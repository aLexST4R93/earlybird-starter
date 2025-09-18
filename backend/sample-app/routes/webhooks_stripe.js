// backend/sample-app/routes/webhooks_stripe.js
import { Router } from "express";
import Stripe from "stripe";
import ordersStore from "../stores/orders.js";
import Redis from "ioredis";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2022-11-15" });

// Optional Redis for release helper (reuse if present in orders.js)
let redis = null;
try {
  if (process.env.REDIS_URL) redis = new Redis(process.env.REDIS_URL);
  else redis = new Redis("redis://127.0.0.1:6379");
} catch (e) {
  redis = null;
}

// Helper release function (same semantics as in orders.js)
async function releaseReservation(branchId, slotId) {
  if (redis) {
    const key = `slot:${branchId}:${slotId}:reserved`;
    await redis.decr(key);
    const cur = parseInt(await redis.get(key) || "0", 10);
    if (isNaN(cur) || cur <= 0) await redis.del(key);
  } else {
    // In-memory fallback - try to adjust slotsByShop if available
    try {
      // lazy require to avoid circular references
      const { default: slotsModule } = await import("../routes/slots.js");
      // if slotsModule had export for release, call it (not implemented here)
    } catch (e) {
      // nothing to do for fallback
    }
  }
}

router.post("/stripe", (req, res) => {
  const signature = req.headers["stripe-signature"];
  const rawBody = req.body; // we used bodyParser.raw in index.js for this route
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn("STRIPE_WEBHOOK_SECRET not set — webhook signature not verified");
  }

  let event;
  try {
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      // No webhook secret configured — parse without verification (not recommended)
      event = JSON.parse(rawBody.toString());
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event types we care about
  (async () => {
    try {
      if (event.type === "payment_intent.succeeded") {
        const pi = event.data.object;
        const orderId = pi.metadata && pi.metadata.order_id;
        if (orderId) {
          ordersStore.update(orderId, { payment_status: "paid", status: "received" });
          console.log(`Order ${orderId} marked as paid (webhook).`);
        }
      } else if (event.type === "payment_intent.payment_failed") {
        const pi = event.data.object;
        const orderId = pi.metadata && pi.metadata.order_id;
        if (orderId) {
          const ord = ordersStore.get(orderId);
          if (ord) {
            ordersStore.update(orderId, { payment_status: "failed", status: "cancelled" });
            // release reservation
            const branchId = ord.shop_id;
            const slotId = ord.pickup_slot;
            await releaseReservation(branchId, slotId);
            console.log(`Order ${orderId} failed -> reservation released`);
          }
        }
      } else {
        console.log(`Unhandled Stripe event type: ${event.type}`);
      }
    } catch (err) {
      console.error("Error processing webhook:", err);
    }
  })();

  res.json({ received: true });
});

export default router;