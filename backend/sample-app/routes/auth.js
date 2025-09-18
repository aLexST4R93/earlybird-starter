import { Router } from "express";
import { v4 as uuid } from "uuid";

const router = Router();

// In-Memory Store (nur Demo!)
const users = new Map();

router.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }
  const id = uuid();
  users.set(id, { id, email });
  return res.status(201).json({ id, email, token: `demo-${id}` });
});

router.post("/login", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "email required" });
  }
  // Demo: immer ok
  const id = uuid();
  return res.json({ id, email, token: `demo-${id}` });
});

export default router;
