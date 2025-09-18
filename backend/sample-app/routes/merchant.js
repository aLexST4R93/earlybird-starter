import { Router } from "express";
import bcrypt from "bcrypt";
import { signToken, requireAuth } from "../utils/auth.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ordersStore from "../stores/orders.js";
import { merchants } from "../data/merchants.js";

const router = Router();

// Simple shops list (demo)
const shops = [
  {
    id: "hemmerle",
    name: "Stadtbäckerei Hemmerle",
    address: "Mülheim an der Ruhr",
    timezone: "Europe/Berlin",
    open_hours: []
  }
];

// Helper: load products if needed (not required, kept for future)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productsPath = path.join(__dirname, "..", "assets", "hemmerle-sample-products.json");
let hemmerleProducts = [];
try {
  const raw = fs.readFileSync(productsPath, "utf8");
  hemmerleProducts = JSON.parse(raw);
} catch (err) {
  console.warn("Konnte Demo-Produkte nicht laden:", err.message);
}

/**
 * POST /merchant/login
 * Body: { email, password }
 * Response: { token, merchantId, name }
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email and password required" });

  const m = merchants.find(x => x.email === email);
  if (!m) return res.status(401).json({ error: "invalid credentials" });

  const ok = await bcrypt.compare(password, m.passwordHash);
  if (!ok) return res.status(401).json({ error: "invalid credentials" });

  const token = signToken({ id: m.id, email: m.email, name: m.name });
  return res.json({ token, merchantId: m.id, name: m.name });
});

/**
 * GET /merchant/shops
 * Protected: returns shops owned by merchant
 */
router.get("/shops", requireAuth, (req, res) => {
  const merchant = merchants.find(m => m.id === req.merchant.id);
  if (!merchant) return res.status(404).json({ error: "merchant not found" });
  const owned = shops.filter(s => merchant.shops.includes(s.id));
  res.json(owned);
});

/**
 * GET /merchant/shops/:id/orders
 * Protected: list orders for given shop
 */
router.get("/shops/:id/orders", requireAuth, (req, res) => {
  const shopId = req.params.id;
  const merchant = merchants.find(m => m.id === req.merchant.id);
  if (!merchant || !merchant.shops.includes(shopId)) return res.status(403).json({ error: "forbidden" });
  const shopOrders = ordersStore.listByShop(shopId);
  res.json(shopOrders);
});

/**
 * PATCH /merchant/orders/:id
 * Protected: update order (status)
 * Body: { status }
 */
router.patch("/orders/:id", requireAuth, (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;
  const merchant = merchants.find(m => m.id === req.merchant.id);
  const order = ordersStore.get(orderId);
  if (!order) return res.status(404).json({ error: "order not found" });
  if (!merchant || !merchant.shops.includes(order.shop_id)) return res.status(403).json({ error: "forbidden" });
  const updated = ordersStore.update(orderId, { ...order, status: status || order.status });
  res.json(updated);
});

/**
 * GET /merchant/shops/:id/report
 * Protected: simple report for the shop
 */
router.get("/shops/:id/report", requireAuth, (req, res) => {
  const shopId = req.params.id;
  const merchant = merchants.find(m => m.id === req.merchant.id);
  if (!merchant || !merchant.shops.includes(shopId)) return res.status(403).json({ error: "forbidden" });

  const shopOrders = ordersStore.listByShop(shopId);
  const revenue = shopOrders.reduce((s, o) => s + (o.total || 0), 0);
  const topProducts = {};
  shopOrders.forEach(o => {
    (o.items || []).forEach(it => {
      topProducts[it.product_id] = (topProducts[it.product_id] || 0) + (it.qty || 0);
    });
  });
  const top = Object.entries(topProducts).map(([productId, qty]) => ({ productId, qty })).sort((a, b) => b.qty - a.qty).slice(0, 5);
  res.json({ revenue, ordersCount: shopOrders.length, topProducts: top });
});

export default router;
