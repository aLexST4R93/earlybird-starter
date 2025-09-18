import { Router } from "express";

const router = Router();

// Stripe Webhook Stub (nur Demo — validiere Signatur in echt!)
router.post("/stripe/webhook", (req, res) => {
  // TODO: Verify signature (stripe-signature header), parse event type
  // event types: payment_intent.succeeded, payment_intent.payment_failed
  // Update order.payment_status accordingly.
  res.status(200).json({ received: true });
});

// PayPal Webhook Stub
router.post("/paypal/webhook", (req, res) => {
  // TODO: Validate transmission (PayPal headers), handle SALE.COMPLETED etc.
  res.status(200).json({ received: true });
});

export default router;
