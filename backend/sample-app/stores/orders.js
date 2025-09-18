// backend/sample-app/stores/orders.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuid } from "uuid";

/**
 * File-backed orders store (dev)
 * - Loads data/orders.json at startup (if exists)
 * - Writes atomically to data/orders.json on changes
 */

// Resolve __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use a data directory relative to this file's folder: ../data
const dataDir = path.resolve(__dirname, "..", "data");
const dataFile = path.join(dataDir, "orders.json");

// Ensure data dir exists
try {
  fs.mkdirSync(dataDir, { recursive: true });
} catch (e) {
  console.error("Failed to create data directory:", e);
}

// Load existing orders from disk
function loadOrdersFromFile() {
  try {
    if (!fs.existsSync(dataFile)) return [];
    const raw = fs.readFileSync(dataFile, "utf8");
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr;
  } catch (err) {
    console.error("Failed to load orders file:", err);
    return [];
  }
}

// Atomic write helper
function writeOrdersToFileAtomic(ordersArray) {
  try {
    // ensure data dir exists (again, safe)
    fs.mkdirSync(dataDir, { recursive: true });
    const tmp = dataFile + ".tmp";
    // Write to temp file first
    fs.writeFileSync(tmp, JSON.stringify(ordersArray, null, 2), "utf8");
    // Rename (atomic on most OS)
    fs.renameSync(tmp, dataFile);
  } catch (err) {
    console.error("Failed to write orders file:", err);
  }
}

// In-memory map for orders
const ordersMap = new Map();

// Initialize from disk
const initial = loadOrdersFromFile();
for (const o of initial) {
  if (o && o.id) {
    ordersMap.set(o.id, o);
  }
}

// Exported API
export default {
  create(order) {
    const id = uuid();
    const now = new Date().toISOString();
    const rec = {
      id,
      ...order,
      created_at: now,
      status: order.status || "received",
      payment_status: order.payment_status || "pending",
    };
    ordersMap.set(id, rec);
    try {
      writeOrdersToFileAtomic(Array.from(ordersMap.values()));
    } catch (e) {
      console.error("Error persisting order:", e);
    }
    return rec;
  },

  get(id) {
    return ordersMap.get(id);
  },

  listByShop(shopId) {
    return Array.from(ordersMap.values()).filter(o => o.shop_id === shopId).sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  update(id, patch) {
    const cur = ordersMap.get(id);
    if (!cur) return null;
    const next = { ...cur, ...patch };
    ordersMap.set(id, next);
    try {
      writeOrdersToFileAtomic(Array.from(ordersMap.values()));
    } catch (e) {
      console.error("Error persisting order update:", e);
    }
    return next;
  },

  all() {
    return Array.from(ordersMap.values()).sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  remove(id) {
    const existed = ordersMap.delete(id);
    try {
      writeOrdersToFileAtomic(Array.from(ordersMap.values()));
    } catch (e) {
      console.error("Error persisting order deletion:", e);
    }
    return existed;
  }
};