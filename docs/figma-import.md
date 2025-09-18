# Figma-Import & Prototyp-Anleitung — Earlybird

Ziel: Klickbarer Prototyp für iOS/Android (Deutsch), plus Bäcker-Dashboard-Ansicht.

## Struktur & Seiten

Mobile (App)
1. Splash / Intro
2. Onboarding (3 Slides, überspringbar)
3. Login / Registrieren
4. Start / Shop-Liste (mit Suchfeld + Filter "Heute"/"Morgen")
5. Shop-Detail (Bilder, Öffnungszeiten, Adresse, Abhol-Slots)
6. Produktliste (mit Kategorien, Allergene-Badges)
7. Produkt-Detail (Menge, Hinweise, Allergene)
8. Warenkorb
9. Abholzeit auswählen (fixe Slots Heute/Morgen)
10. Checkout (Zahlarten: Apple Pay / Google Pay / Kreditkarte / PayPal — Mock)
11. Bestellung bestätigt (QR-Code + Abholinfos)
12. Profil (Bestellhistorie, Favoriten, Einstellungen)
13. Push-/SMS-Opt-in Screen

Web (Bäcker-Dashboard, Desktop)
1. Login
2. Bestellübersicht (Tagesansicht, Statuswechsel)
3. Produktverwaltung (Liste, bearbeiten, Allergene)
4. Slot-/Kapazitätsverwaltung (heute/morgen, Cutoff)
5. Reporting (Mini-Übersicht)
6. Einstellungen (Payout, POS-Integration, Team)

## Design-Tokens (siehe assets/design/tokens.json)
- Farben Neutral (Grau/Blau), hohe Lesbarkeit, AA-Kontrast
- Typo: Inter oder System (SF / Roboto)
- Radius: 8 px
- Spacing: 4 px Grid
- Schatten: z2 für Karten, z4 für Modals

## Komponentenbibliothek (Basis)
- Buttons: Primary, Secondary, Ghost, Destructive
- Inputs: Text, Select, Date/Time Slot Picker (Mock)
- Badges: Allergen(e), Vegan/Vegetarisch
- Karten: Shop-Karte, Produkt-Karte
- Modals: Bestätigen, Fehler
- Toaster: Erfolg/Fehler
- Tabs: Heute / Morgen
- Listen: Order-List-Item (mit Statusfarbe)

## Prototyp-Verlinkung (Beispiel-Flow)
- Splash → Onboarding → Login → Shop-Liste → Shop-Detail → Produktliste → Produkt-Detail → Warenkorb → Slot-Auswahl → Checkout → Bestätigung.

## Figma-Import (so gehst du vor)
1. In Figma ein neues Projekt anlegen: "Earlybird Prototype".
2. Seiten anlegen: "Mobile", "Components", "Bäcker-Dashboard".
3. Kompatible Assets importieren:
   - SVGs und PNGs aus assets/design/ (Icons, Logos, Platzhalter-Bilder).
   - Farben/Typo aus tokens.json manuell als Styles anlegen:
     - Fill Styles: primary/neutral/success/warn/danger
     - Text Styles: Heading/Body/Caption
4. Frames erstellen:
   - Mobile: iPhone 13/14 (390x844) oder Pixel 6
   - Desktop: 1440x900
5. Interaktionen definieren:
   - Buttons → Navigate To nächster Screen
   - Checkout → Overlay "Zahlung erfolgreich" → Bestätigung
   - Orderstatus im Dashboard: Klick auf "In Vorbereitung" → "Fertig" wechselt Badge

## Hinweise
- Zahlungs-Screens: verwende „Fake“ Apple Pay/Google Pay/PayPal Logos (als Platzhalter).
- QR-Code: nutze ein generisches QR-Placeholder-Image.
- Slot-Auswahl: benutze Grid (2 Spalten x 4 Zeilen), disabled Slots ausgegraut.

## Export / Teilen
- Linkfreigabe: "Can view" für Tester:innen.
- Prototyp Einstellungen: Device frames on, hot spots visible (optional).

