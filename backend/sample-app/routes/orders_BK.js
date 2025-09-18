import { Router } from "express";
import ordersStore from "../stores/orders.js";
import { v4 as uuid } from "uuid";

const router = Router();

router.post("/", (req, res) => {
  const { shop_id, items, pickup_slot, phone } = req.body;
  if (!shop_id || !Array.isArray(items)) return res.status(400).json({ error: "invalid order payload" });
  const total = items.reduce((sum, it) => sum + (it.price || 0) * (it.qty || 1), 0) || 0;
  const order = ordersStore.create({ shop_id, items, total, pickup_slot, phone, payment_status: "paid" });
  // In a real app: Reserve inventory, create payment intent, webhooks, notify merchant etc.
  return res.status(201).json(order);
});

router.get("/:id", (req, res) => {
  const order = ordersStore.get(req.params.id);
  if (!order) return res.status(404).json({ error: "order not found" });
  res.json(order);
});

export default router;
