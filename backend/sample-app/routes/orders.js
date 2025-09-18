// backend/sample-app/routes/orders.js
import { Router } from "express";
import ordersStore from "../stores/orders.js";
import Stripe from "stripe";
import Redis from "ioredis";
import { v4 as uuid } from "uuid";

const router = Router();

// Configure Stripe using env var
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2022-11-15" });

// Optional Redis (for atomic reservation)
let redis = null;
try {
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL);
  } else {
    // attempt default localhost
    redis = new Redis("redis://127.0.0.1:6379");
  }
  console.log("Redis connected:", !!redis);
  // attach error handler to fallback gracefully
  if (redis) {
    redis.on("error", (err) => {
      console.warn("Redis runtime error, switching to local fallback:", err.message);
      try { redis.disconnect(); } catch (e) {}
      redis = null;
    });
  }
} catch (err) {
  console.warn("Redis not available, will use local mutex fallback:", err.message);
  redis = null;
}

// In-memory slots demo (for prototype)
// In production use DB table for slots
const slotsByShop = {
  hemmerle: {
    today: [
      { id: "t1", start: "06:30", end: "06:50", capacity: 20, reserved: 3 },
      { id: "t2", start: "07:00", end: "07:20", capacity: 20, reserved: 7 },
      { id: "t3", start: "07:30", end: "07:50", capacity: 20, reserved: 12 }
    ],
    tomorrow: [
      { id: "m1", start: "06:30", end: "06:50", capacity: 20, reserved: 0 },
      { id: "m2", start: "07:00", end: "07:20", capacity: 20, reserved: 0 }
    ]
  }
};

function findSlot(branchId, slotId) {
  const shop = slotsByShop[branchId];
  if (!shop) return null;
  const all = (shop.today || []).concat(shop.tomorrow || []);
  return all.find(s => s.id === slotId) || null;
}

// Local simple mutex fallback
class SimpleMutex {
  constructor() { this._locked = false; this._queue = []; }
  acquire() {
    if (!this._locked) { this._locked = true; return Promise.resolve(); }
    return new Promise(resolve => this._queue.push(resolve));
  }
  release() {
    if (this._queue.length > 0) {
      const next = this._queue.shift();
      next();
    } else {
      this._locked = false;
    }
  }
  async runExclusive(fn) {
    await this.acquire();
    try { return await fn(); } finally { this.release(); }
  }
}
const globalMutex = new SimpleMutex();

async function reserveSlotRedis(branchId, slotId) {
  if (!redis) throw new Error("no_redis");
  const key = `slot:${branchId}:${slotId}:reserved`;
  const slot = findSlot(branchId, slotId);
  if (!slot) return { ok: false, reason: "slot_not_found" };
  const capacity = slot.capacity || 0;
  const val = await redis.incr(key);
  if (val === 1) await redis.expire(key, 15 * 60);
  if (val > capacity) { await redis.decr(key); return { ok: false, reason: "capacity_exceeded" }; }
  return { ok: true, reservedCount: val };
}

async function releaseSlotRedis(branchId, slotId) {
  if (!redis) return;
  const key = `slot:${branchId}:${slotId}:reserved`;
  await redis.decr(key);
  const cur = parseInt(await redis.get(key) || "0", 10);
  if (isNaN(cur) || cur <= 0) await redis.del(key);
}

async function reserveSlotLocal(branchId, slotId) {
  return await globalMutex.runExclusive(async () => {
    const slot = findSlot(branchId, slotId);
    if (!slot) return { ok: false, reason: "slot_not_found" };
    if ((slot.reserved || 0) + 1 > (slot.capacity || 0)) return { ok: false, reason: "capacity_exceeded" };
    slot.reserved = (slot.reserved || 0) + 1;
    return { ok: true, reservedCount: slot.reserved };
  });
}

async function releaseSlotLocal(branchId, slotId) {
  await globalMutex.runExclusive(async () => {
    const slot = findSlot(branchId, slotId);
    if (!slot) return;
    slot.reserved = Math.max(0, (slot.reserved || 1) - 1);
  });
}

// POST /orders — create order, reserve slot, create Stripe PaymentIntent, return client_secret
router.post("/", async (req, res) => {
  try {
    console.log("DEBUG POST /orders - body:", JSON.stringify(req.body));
  } catch (e) {
    console.warn("DEBUG log failed:", e.message);
  }

  const { shop_id, items, pickup_slot, phone } = req.body || {};
  if (!shop_id || !Array.isArray(items) || !pickup_slot) {
    return res.status(400).json({ error: "invalid order payload" });
  }
  if (items.length === 0) return res.status(400).json({ error: "empty_cart" });

  const slot = findSlot(shop_id, pickup_slot);
  if (!slot) return res.status(400).json({ error: "slot_not_found" });

  // Reserve a seat (Redis preferred, else local)
  let reserveResult;
  try {
    if (redis) reserveResult = await reserveSlotRedis(shop_id, pickup_slot);
    else reserveResult = await reserveSlotLocal(shop_id, pickup_slot);
  } catch (err) {
    console.warn("reserve error, fallback to local:", err.message);
    reserveResult = await reserveSlotLocal(shop_id, pickup_slot);
  }

  if (!reserveResult.ok) {
    return res.status(409).json({ error: reserveResult.reason || "capacity_exceeded" });
  }

  // Create order in pending state
  const total = items.reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0);
  const order = ordersStore.create({
    shop_id,
    items,
    total,
    pickup_slot,
    phone,
    payment_status: "pending",
    status: "pending"
  });

  // Create Stripe PaymentIntent
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round((order.total || 0) * 100),
      currency: "eur",
      metadata: { order_id: order.id, shop_id },
      description: `Earlybird Order ${order.id} (${shop_id})`,
      automatic_payment_methods: { enabled: true }
    });

    return res.status(201).json({
      order,
      client_secret: paymentIntent.client_secret
    });
  } catch (err) {
    console.error("Stripe PaymentIntent error:", err);
    // release reservation and mark order failed
    if (redis) await releaseSlotRedis(shop_id, pickup_slot).catch(()=>{});
    else await releaseSlotLocal(shop_id, pickup_slot).catch(()=>{});
    ordersStore.update(order.id, { status: "cancelled", payment_status: "failed" });
    return res.status(500).json({ error: "payment_init_failed" });
  }
});

// GET single order (debuggable)
router.get("/:id", (req, res) => {
  const id = req.params.id;
  console.log("DEBUG GET /orders/:id called, id =", id);
  try {
    const order = ordersStore.get(id);
    console.log("DEBUG ordersStore.get result:", order ? "FOUND" : "NOT FOUND");
    if (!order) {
      return res.status(404).json({ error: "order not found" });
    }
    return res.json(order);
  } catch (err) {
    console.error("DEBUG error in GET /orders/:id", err);
    return res.status(500).json({ error: "internal" });
  }
});

// GET all orders (for debugging)
router.get("/", (req, res) => {
  try {
    const all = ordersStore.all();
    return res.json(all);
  } catch (err) {
    console.error("Error listing orders:", err);
    return res.status(500).json({ error: "internal" });
  }
});

// Optional: release endpoint for manual release (used by payments failure flow)
router.post("/release", async (req, res) => {
  const { shop_id, slot_id } = req.body || {};
  if (!shop_id || !slot_id) return res.status(400).json({ error: "invalid" });
  try {
    if (redis) await releaseSlotRedis(shop_id, slot_id);
    else await releaseSlotLocal(shop_id, slot_id);
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "release_failed" });
  }
});

export default router;