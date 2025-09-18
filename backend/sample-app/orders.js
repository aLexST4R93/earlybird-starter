// Simple in-memory orders store for demo
import { v4 as uuid } from "uuid";

const orders = new Map();

// Helper functions
export default {
  create(order) {
    const id = uuid();
    const now = new Date().toISOString();
    const rec = { id, ...order, status: order.status || "received", created_at: now };
    orders.set(id, rec);
    return rec;
  },
  get(id) {
    return orders.get(id);
  },
  listByShop(shopId) {
    return Array.from(orders.values()).filter(o => o.shop_id === shopId).sort((a,b) => b.created_at.localeCompare(a.created_at));
  },
  update(id, patch) {
    const cur = orders.get(id);
    if (!cur) return null;
    const next = { ...cur, ...patch };
    orders.set(id, next);
    return next;
  },
  all() {
    return Array.from(orders.values()).sort((a,b) => b.created_at.localeCompare(a.created_at));
  }
};
