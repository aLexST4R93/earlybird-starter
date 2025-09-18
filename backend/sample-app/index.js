// backend/sample-app/index.js
import 'dotenv/config';
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import bodyParser from "body-parser";
import authRouter from "./routes/auth.js";
import shopsRouter from "./routes/shops.js";
import productsRouter from "./routes/products.js";
import ordersRouter from "./routes/orders.js";
import slotsRouter from "./routes/slots.js";
import paymentsRouter from "./routes/payments.js";
import merchantRouter from "./routes/merchant.js";
import webhooksRouter from "./routes/webhooks_stripe.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Security & middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

// IMPORTANT: For Stripe webhooks we need raw body. Use conditional middleware.
// If the incoming URL starts with /webhooks/stripe, parse raw body; otherwise parse JSON.
app.use((req, res, next) => {
  if (req.originalUrl && req.originalUrl.startsWith("/webhooks/stripe")) {
    bodyParser.raw({ type: "application/json" })(req, res, next);
  } else {
    bodyParser.json()(req, res, next);
  }
});

// Health
app.get("/health", (req, res) => {
  res.json({ status: "ok", ts: new Date().toISOString() });
});

// Routes
app.use("/auth", authRouter);
app.use("/shops", shopsRouter);
app.use("/products", productsRouter);
app.use("/orders", ordersRouter);
app.use("/merchant", merchantRouter);
app.use("/slots", slotsRouter);
app.use("/payments", paymentsRouter);

// Webhooks (Stripe)
app.use("/webhooks", webhooksRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// error handler
app.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Earlybird API listening on http://localhost:${PORT}`);
});