import { Router } from "express";

const router = Router();

const shops = [
  {
    id: "hemmerle",
    name: "Stadtbäckerei Hemmerle",
    address: "Mülheim an der Ruhr",
    timezone: "Europe/Berlin",
    open_hours: [
      { day: 1, open: "06:00", close: "18:00" },
      { day: 2, open: "06:00", close: "18:00" }
    ],
    slots_today: [
      { id: "t1", start: "06:30", end: "06:50", capacity: 20, reserved: 0 },
      { id: "t2", start: "07:00", end: "07:20", capacity: 20, reserved: 0 }
    ]
  }
];

router.get("/", (req, res) => {
  res.json(shops);
});

router.get("/:id", (req, res) => {
  const shop = shops.find((s) => s.id === req.params.id);
  if (!shop) return res.status(404).json({ error: "shop not found" });
  res.json(shop);
});

export default router;
