# Pflichtenheft — Kurzfassung (Earlybird MVP)

Ziel: Marktplatz-App für Bäckerei‑Vorbestellungen (NRW/Mülheim a. d. Ruhr),
Abholung heute/ morgen in festen Slots, Zahlung in der App, Web-Backend für
Bäckereien, wöchentliche Auszahlungen.

## Rollen
- Kunde: Browsen, Produkte, Warenkorb, Slot wählen, bezahlen, abholen.
- Bäckerei: Produkte/Slots verwalten, Bestellungen managen, Reporting.
- Admin: Onboarding/Verifikation, Gebühren, Auszahlungen, Monitoring.

## Kernfunktionen (MVP)
- Produkte mit LMIV-Feldern (Allergene, Zutaten), Inventar-Limits pro Slot.
- Slots heute/morgen, fixe Fenster, Cutoffzeiten.
- Checkout: Stripe (Karte, Apple Pay, Google Pay) + PayPal.
- Status: eingegangen → in Vorbereitung → fertig → abgeholt.
- Push & SMS-Benachrichtigungen.
- Auszahlungen: Stripe Connect (wöchentlich).

## Wichtige Nicht-Funktionale Anforderungen
- DSGVO, SCA/PSD2, EU-Hosting, Observability (Sentry/Prom/Grafana).
- Rate Limiting, Audit Logs, Roll‑back‑fähige Deployments.

## Datenmodell (Ausschnitt)
- users(id, email, phone, ...), shops(id, name, address, ...),
- products(id, shop_id, name, price, allergens[], ingredients, ...),
- slots(id, shop_id, date, start, end, capacity, reserved),
- orders(id, user_id, shop_id, total, status, pickup_slot_id),
- order_items(order_id, product_id, qty, price),
- payments(order_id, provider, status), payouts(shop_id, schedule).

## APIs (Ausschnitt)
- Auth: POST /auth/register, /auth/login
- Shops: GET /shops, GET /shops/:id
- Products: GET /shops/:id/products
- Slots: GET /shops/:id/slots?date=
- Orders: POST /orders, GET /orders/:id
- Payments: Webhooks (Stripe/PayPal)

Details in der Vollversion (folgt separat, inkl. OpenAPI).
