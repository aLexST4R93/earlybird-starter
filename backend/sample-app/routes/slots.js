import { Router } from "express";

const router = Router();

// Demo: Feste Slots für "hemmerle"
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
    ],
    cutoff: "20:00"
  }
};

// WICHTIG: Route lautet hier "/shops/:id" — der Router wird in index.js
// unter "/slots" gemountet, daher entspricht das genau:
// GET /slots/shops/:id?date=today
router.get("/shops/:id", (req, res) => {
  const { id } = req.params;
  const date = req.query.date || "today"; // 'today' | 'tomorrow'
  const shopSlots = slotsByShop[id];
  if (!shopSlots) return res.status(404).json({ error: "shop not found" });
  const data = shopSlots[date];
  if (!data) return res.status(400).json({ error: "invalid date param" });
  // Return a consistent object with slots array and cutoff
  res.json({ date, cutoff: shopSlots.cutoff, slots: data });
});

export default router;
