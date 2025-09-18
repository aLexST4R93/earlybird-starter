# Pflichtenheft (V1) — Earlybird

Version: 1.0
Sprache: Deutsch
Region: NRW, Fokus Mülheim an der Ruhr
Ziel: Marktplatz-App für Bäckerei-Vorbestellungen mit festen Abhol-Slots (heute/morgen), Payment in App, Web-Backend für Bäckereien, wöchentliche Auszahlungen.

## 1. Ziele
- Wartezeiten reduzieren, Planbarkeit für Bäckereien erhöhen.
- Kundenbindung und Umsatz in Stoßzeiten steigern.
- DSGVO-konforme, skalierbare Plattform.

## 2. Rollen & Akteure
- Kunde (App): Registrierung, Browse, Warenkorb, Slot-Auswahl, Bezahlen, Abholen.
- Bäckerei (Web): Produkte, Allergene, Slots/Kapazitäten, Bestellungen, Status.
- Admin (Operator): Onboarding/Verifikation, Gebühren, Auszahlungen, Support, Monitoring.
- Payment-Provider (Stripe/PayPal), SMS (Twilio), Push (APNs/FCM), POS-Anbieter.

## 3. Geschäftsregeln
- Bestellungen nur für heute oder morgen, feste Slots mit Kapazität.
- Cutoff für „morgen“ konfigurierbar (Standard 20:00 Lokalzeit).
- Inventarbegrenzung pro Produkt und pro Slot.
- Zahlungen vorab; No-Show-Policy: optional konfigurierbar.
- Auszahlungen wöchentlich, Provision 10%, Onboarding 199 EUR (einmalig).
- LMIV: Allergene/Zutaten ausweisen.

## 4. Funktionsumfang (MVP)
4.1 Kunde
- Auth: E-Mail/Passwort oder Telefon-OTP, Profil, Historie, Favoriten.
- Shop-Liste/Detail, Produktkatalog, Allergene, Preise.
- Warenkorb, Slot-Auswahl (heute/morgen), Checkout (Stripe/PayPal).
- Bestellstatus: Push- & SMS-Updates; QR-Code zur Abholung.

4.2 Bäckerei (Web)
- Login, Bestellliste (Filter: heute/morgen/status), Statuswechsel (in Vorbereitung, fertig, abgeholt).
- Produktverwaltung (Name, Preis, Bild, Allergene, Zutaten, Einheit, aktiv).
- Slot-/Kapazitätsverwaltung (Fenster, Kapazität, Cutoff).
- Reporting: Tagesumsatz, Top-Produkte, Bestellungen pro Slot.
- Einstellungen: Payout (Stripe Connect), POS-Integration (API-Key/Mapping).

4.3 Admin
- Partner-Onboarding (Self-Service + Kuratiert), Dokumenten-Upload (Gewerbe, IBAN).
- Gebührenverwaltung (Provision, Onboarding-Fee).
- Auszahlungsübersicht, Refunds, Streitfälle.
- Monitoring: Health, Fehler, Payment-Events.
- Content: AGB, Datenschutz, Impressum.

## 5. Nicht-funktionale Anforderungen
- Sicherheit: TLS, OWASP Top 10, JWT + Refresh, RBAC, Audit-Logs.
- Datenschutz: Datenminimierung, AVV, EU-Region, Löschkonzepte (Right to be forgotten).
- Performance: P95 API < 300 ms (lesend), < 800 ms (schreibend) bei 100 RPS.
- Verfügbarkeit: Ziel 99.9% API.
- Skalierung: Horizontal via Container/Orchestrierung, Caching (Redis).
- Observability: Logging (JSON), Tracing, Metriken, Alerts.

## 6. Datenmodell (ER-Überblick)
- users(id, email, phone, password_hash, name, locale, gdpr_consent_at, created_at)
- shops(id, owner_id, name, address, geo, timezone, open_hours, active)
- products(id, shop_id, name, sku, price, currency, allergens[], ingredients[], unit, image_url, active)
- slots(id, shop_id, date, start_time, end_time, capacity, reserved, cutoff_at)
- inventories(id, shop_id, product_id, date, per_slot_limit)
- orders(id, user_id, shop_id, pickup_slot_id, total_gross, status, created_at)
- order_items(id, order_id, product_id, qty, unit_price, total_price)
- payments(id, order_id, provider, provider_ref, amount, status, created_at)
- payouts(id, shop_id, period_start, period_end, amount, status)
- notifications(id, user_id, channel, payload, status, created_at)
- pos_integrations(id, shop_id, provider, credentials)

Hinweis: Allergene/Zutaten sind Pflichtfelder (LMIV).

## 7. API (Auszug, Detail in OpenAPI)
- POST /auth/register, /auth/login
- GET /shops, /shops/{id}
- GET /products/by-shop/{shopId}
- GET /slots/shops/{id}/slots?date=today|tomorrow
- POST /orders (reserviert Inventar, erstellt Payment Intent)
- GET /orders/{id}
- POST /payments/stripe/webhook, /payments/paypal/webhook
- Admin/Bäcker-APIs (später): /admin/..., /merchant/...

## 8. Zahlungsabwicklung
- Stripe: Karten, Apple Pay, Google Pay (via Payment Request API), Connect (Express) für Auszahlungen, KYC/PSD2.
- PayPal: Alternative Wallet.
- Refund-Strategie: Teil/Voll, abhängig von Slot-Zeit (Policy konfigurierbar).
- Gebühren: Provision + Payment-Fees ausgewiesen, Abrechnungsreport je Woche.

## 9. POS-Integration (Konzept)
- Adapter-Service pro Anbieter (z. B. Lightspeed, Orderbird, Vectron).
- Mapping: Produkt-SKU ↔ POS-Artikelnummer.
- Modi: Push Order in POS oder Export/CSV + Webhook.
- Retries, Dead-letter Queue, Monitoring.

## 10. Benachrichtigungen
- Push (FCM/APNs) mit Token-Management.
- SMS (Twilio; EU-Nummern), Opt-in/Opt-out, Kostenkontrolle.
- Templates: Auftrag eingegangen / in Vorbereitung / fertig / Erinnerung / Abholung bestätigt.

## 11. Prozesse & Policies
- Cutoff: Standard 20:00 für „morgen“, pro Shop überschreibbar.
- No-Show: Bestellung verfällt 60 Min. nach Slot-Ende; Erstattung optional.
- Stornierung: bis X Std. vorher kostenlos; danach anteilig.
- Datenschutz: Datenlöschung auf Anfrage, Pseudonymisierung historischer Daten.

## 12. Qualität & Tests
- Unit/Integration für Kern-Services (Orders/Payments).
- E2E (Happy Path: komplette Bestellung).
- Lasttests (k6) auf Listings/Checkout.
- Security: Dependency Scans, PenTests vor Go-Live.

## 13. Risiken
- Zahlungs-/Regulatorik: Mit Stripe Connect mitigieren.
- POS-Heterogenität: Priorisierte Roadmap (2–3 Anbieter zuerst).
- SMS-Kosten: Rate Limits, Fallback auf Push.

## 14. Roadmap
- MVP: 8–12 Wochen (2–3 Devs) — App + Backend + Merchant-Web Basic
- Phase 2: Skalierung, POS-Adapter, Monitoring
- Phase 3: Loyalty, Coupons, Promotions, Marketplace Ads

## 15. Akzeptanzkriterien (Ausschnitt)
- Kunde kann Bestellung für heute/morgen abschließen, Zahlung erfolgreich simuliert, Bestätigung mit QR.
- Bäckerei kann Status in Dashboard ändern; Kunde erhält Push/SMS.
- Admin kann Bäckerei anlegen, Provision konfigurieren, Auszahlungsreport einsehen.

