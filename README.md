# Earlybird — Marktplatz für Bäckerei‑Vorbestellungen (MVP-Starter)

Dieses Repository ist ein Starterpaket (Code & Dokumentation) für das Projekt
Earlybird. Es enthält:
- Onepager (docs/onepager.md) für Bäckerei‑Akquise (PDF selbst generierbar)
- Backend-Stub (Node.js/Express) mit Beispiel‑Routen und OpenAPI‑Stub
- Projektstruktur für Mobile (Flutter) und Admin (React) als Platzhalter
- CI/CD‑Beispiel (GitHub Actions)
- Beispiel‑Produktdaten (Hemmerle, Demo)

## Quickstart (Backend-Stub)

Voraussetzungen:
- Node.js >= 18, npm >= 9 (oder pnpm/yarn)
- Optional: Docker (für späteren Betrieb)

Installation:
```bash
cd backend/sample-app
npm install
npm run dev
```

Die API startet auf http://localhost:3000.
Swagger/OpenAPI-Stub: `backend/sample-app/openapi.yaml`

Routen (Auszug):
- GET /health
- POST /auth/register, POST /auth/login
- GET /shops, GET /shops/:id
- GET /shops/:id/products
- POST /orders, GET /orders/:id

## Dateien & Ordner

- docs/
  - onepager.md (Bäcker‑Pitch, deutsch)
  - pflichtenheft-summary.md (Kurzfassung; vollständiges Pflichtenheft folgt)
- backend/
  - sample-app/ (Express-Stub)
  - docker-compose.yml (Stub, für spätere DB/Redis)
- mobile/ (Platzhalter, Flutter-Hinweise)
- admin/ (Platzhalter, React-Hinweise)
- infra/
  - ci-cd.yaml (GitHub Actions, Node CI)

## PDF aus Markdown erzeugen

Option 1 (VS Code Extension): "Markdown PDF" installieren, onepager.md öffnen,
"Export (pdf)" wählen.

Option 2 (pandoc):
```bash
pandoc docs/onepager.md -o docs/onepager.pdf
```

## Hinweise zu Zahlungen & Auszahlungen

Empfehlung: Stripe Connect (Express) + PayPal als alternative Zahlart. Damit
erfüllt Stripe KYC/AML, PSD2/SCA und Payouts ohne eigene BaFin-Lizenz.
Auszahlungen: wöchentlich (konfigurierbar).

## Rechtliches

- DSGVO: Daten in der EU speichern, AVV mit Stripe, Twilio etc. abschließen.
- LMIV: Allergene/Zutaten in Produktdaten pflegen (Backend-Felder vorgesehen).
- AGB/Datenschutz & Widerruf: Vor Go‑Live juristisch prüfen lassen.

## Nächste Schritte

- Figma‑Prototyp & Pflichtenheft werden separat geliefert.
- Backend um DB (PostgreSQL) erweitern und Auth/Bestellungen persistieren.
- Push (FCM/APNs) und SMS (Twilio) implementieren (Queue/Worker).
