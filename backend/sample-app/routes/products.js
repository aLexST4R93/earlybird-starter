// backend/sample-app/routes/products.js
import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = Router();

// JSON-Datei synchron laden (Demo)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productsPath = path.join(__dirname, "..", "..", "assets", "hemmerle-sample-products.json");
let hemmerle = [];
try {
  const raw = fs.readFileSync(productsPath, "utf8");
  hemmerle = JSON.parse(raw);
} catch (err) {
  console.error("Fehler beim Laden der Demo-Produkte:", err);
  hemmerle = [];
}

router.get("/by-shop/:shopId", (req, res) => {
  const { shopId } = req.params;
  if (shopId !== "hemmerle") {
    return res.status(404).json({ error: "shop not found" });
  }
  return res.json(hemmerle);
});

// Legacy alias to match README (GET /shops/:id/products)
router.get("/shops/:id", (req, res) => {
  const { id } = req.params;
  if (id !== "hemmerle") {
    return res.status(404).json({ error: "shop not found" });
  }
  return res.json(hemmerle);
});

export default router;