# HospitalityHub ERP — Design Guidelines

## Brand Colors

- **Primary:** Deep Blue `#1E3A5F` — trust, enterprise, stability
- **Accent:** Amber `#F59E0B` — energy, action, warmth
- **Success:** `#10B981`
- **Warning:** `#F59E0B`
- **Danger:** `#EF4444`
- **Neutral background (dark mode):** `#0F172A`
- **Neutral background (light mode):** `#F8FAFC`
- **Surface dark:** `#1E293B`
- **Surface light:** `#FFFFFF`
- **Border:** `#334155` (dark) / `#E2E8F0` (light)

## Typography

- **Font:** Inter (system fallback: sans-serif)
- **Display:** 700 weight, 2xl–4xl
- **Heading:** 600 weight, lg–2xl
- **Body:** 400 weight, sm–base
- **Caption/Label:** 500 weight, xs–sm
- Tight letter-spacing on headings; relaxed on body

## Spacing & Layout

- 8px base grid
- Sidebar width: 240px (collapsed: 64px)
- Top navbar height: 56px
- Card border-radius: 12px
- Input border-radius: 8px
- Button border-radius: 8px
- Modal border-radius: 16px
- Container max-width: 1440px

## Elevation / Shadows

- **Level 0:** No shadow (flat surfaces)
- **Level 1:** `0 1px 3px rgba(0,0,0,0.12)` — cards
- **Level 2:** `0 4px 12px rgba(0,0,0,0.15)` — dropdowns, popovers
- **Level 3:** `0 8px 24px rgba(0,0,0,0.20)` — modals
- **Level 4:** `0 16px 40px rgba(0,0,0,0.25)` — drawers, side panels

## Components

### PIN Keypad
- Large circular or rounded-square digit buttons (min 56px touch target)
- Amber accent on active/pressed
- PIN dots display: filled amber circle = entered digit, hollow = empty
- Smooth press animation (scale 0.95)

### Navigation Sidebar
- Deep blue background
- Active item: amber left border + amber text
- Hover: subtle blue-tinted background
- Icons: 20px, consistent weight (Heroicons or Lucide)
- Collapsible with smooth slide transition

### POS Product Grid
- Card layout, 3–5 columns responsive
- Product image top, name + price bottom
- Category filter tabs above grid (horizontal scroll on mobile)
- Cart panel on right (280px) — sticky, full height

### KDS Cards
- High-contrast cards: dark background, bright text
- Status-color left border: yellow = preparing, green = ready, red = overdue
- Large readable font (kitchen environment)
- Real-time countdown timer per order

### Dashboard Cards (KPI)
- Icon + metric value + label + trend arrow
- Subtle gradient or flat colored icon background
- Dark mode first

### Tables / Floor Plan
- SVG or div-based floor plan
- Color-coded table status: green = available, red = occupied, yellow = reserved, gray = cleaning
- Tooltip on hover showing order summary

### Data Tables
- Striped rows (very subtle), hover highlight
- Sticky header
- Pagination at bottom
- Action buttons: icon-only with tooltip

## Dark / Light Mode

- Default: Dark mode (operational environment)
- Toggle in top navbar
- Consistent with TailwindCSS dark: prefix classes
- Smooth 200ms transition between modes

## Responsiveness

- Fully responsive: mobile (320px), tablet (768px), desktop (1280px+)
- POS and KDS optimized for tablets (landscape)
- Floor plan editor for desktop-first

## Motion & Animation

- Subtle transitions: 150–250ms ease-in-out
- KDS card entrance: slide-in from top
- Cart item add: scale + fade
- Modal open: scale 0.95 → 1.0 + fade
- Page transitions: fade (100ms)