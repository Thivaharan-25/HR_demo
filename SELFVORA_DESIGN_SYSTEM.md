# Selfvora Design System

> The single source of truth for all UI decisions. Every developer and AI tool must follow this when building Selfvora.

---

## Brand Identity

| Property | Value |
| --- | --- |
| Product Name | **Selfvora** |
| Logo | Circular turbine/swirl with 6 alternating blades (`#0f4c3a` dark green + `#0d9488` teal) and white building icon centre |
| Wordmark | "Self" in `C.text` + "vora" in `#0d9488` (teal) |
| Font Weight | 800 (Extra Bold) for wordmark |

---

## Colors — Light Mode (`LIGHT_C`)

| Token | Hex | Usage |
| --- | --- | --- |
| `primary` | `#6366F1` | Buttons, active nav, accent bars, links |
| `primaryHover` | `#4F46E5` | Button hover state |
| `primaryLight` | `#EEF2FF` | Active nav bg, badge fills, input focus bg |
| `primaryMid` | `#C7D2FE` | Badge borders, secondary button borders |
| `bg` | `#F5F7FA` | Page background, table headers |
| `white` | `#FFFFFF` | Cards, modals, topbar, sidebar |
| `sidebar` | `#FFFFFF` | Sidebar surface |
| `border` | `#E5E9F0` | Card borders, input borders, dividers |
| `borderLight` | `#EFF2F8` | Table row dividers, subtle separators |
| `text` | `#0F172A` | Headings, body text, primary content |
| `textMid` | `#475569` | Secondary labels, nav items, descriptions |
| `textMuted` | `#94A3B8` | Captions, placeholders, timestamps |
| `success` | `#10B981` | Active, present, approved states |
| `successBg` | `#ECFDF5` | Success badge background |
| `successBorder` | `#A7F3D0` | Success badge border |
| `warning` | `#F59E0B` | Pending, late, at-risk states |
| `warningBg` | `#FFFBEB` | Warning badge background |
| `warningBorder` | `#FDE68A` | Warning badge border |
| `danger` | `#EF4444` | Rejected, absent, error, delete |
| `dangerBg` | `#FEF2F2` | Danger badge background |
| `dangerBorder` | `#FECACA` | Danger badge border |
| `info` | `#3B82F6` | On Leave, info states, links |
| `infoBg` | `#EFF6FF` | Info badge background |
| `infoBorder` | `#BFDBFE` | Info badge border |
| `navActive` | `#EEEFFE` | Active nav item pill background |
| `navHover` | `#F5F7FA` | Sidebar hover background |
| `tableHead` | `#F5F7FA` | Table header row background |
| `tableRow` | `#FFFFFF` | Table row background |

---

## Colors — Dark Mode (`DARK_C`)

| Token | Value | Notes |
| --- | --- | --- |
| `primary` | `#818CF8` | Lighter indigo for dark bg readability |
| `primaryLight` | `rgba(129,140,248,0.15)` | Translucent instead of solid |
| `bg` | `#0C1118` | Deep near-black page background |
| `white` | `#141C2E` | Card/topbar surface — deep navy |
| `sidebar` | `#0F1729` | Darker than cards |
| `border` | `#1E2840` | Subtle border on dark |
| `text` | `#F1F5F9` | Light text |
| `textMid` | `#CBD5E1` | Medium text |
| `textMuted` | `#64748B` | Muted text |
| `success` | `#34D399` | Brighter green |
| `warning` | `#FBBF24` | Brighter amber |
| `danger` | `#F87171` | Brighter red |
| `info` | `#60A5FA` | Brighter blue |
| All `*Bg` tokens | `rgba(color, 0.10)` | Translucent backgrounds |
| All `*Border` tokens | `rgba(color, 0.25)` | Translucent borders |
| Shadows | `rgba(0,0,0,0.40–0.60)` | Heavier than light mode |

### How the dark mode system works

```js
let _darkMode = false;
const C = new Proxy({}, { get: (_, k) => (_darkMode ? DARK_C : LIGHT_C)[k] });
```

`_darkMode` is mutated at the top of every `App()` render. Every component reads `C.primary`, `C.text`, etc. and automatically gets the correct token.

---

## Typography

| Style | Size | Weight | Letter Spacing | Usage |
| --- | --- | --- | --- | --- |
| Page H1 | `22px` | `800` | `-0.4px` | Page titles ("Dashboard", "Settings") |
| Modal Title | `18px` | `800` | `-0.4px` | Modal header text |
| Section Heading | `16–19px` | `700–800` | — | Section labels, card group titles |
| Card Title | `14px` | `700` | — | CardHeader title text |
| Card Subtitle | `12px` | `500` | — | CardHeader subtitle, in `textMuted` |
| Nav Label (active) | `13.5px` | `700` | — | Active sidebar/topbar items |
| Nav Label (inactive) | `13.5px` | `500` | — | Inactive nav items, in `textMid` |
| Body Text | `13px` | `400–500` | — | Table cells, descriptions, paragraphs |
| Secondary Label | `12–12.5px` | `500–600` | — | Field labels, stat card labels |
| Caption | `11px` | `500–600` | — | Timestamps, helper text, tooltips |
| Badge Text | `11px` | `700` | `0.3px` | Status pills, tags |
| Table Header | `10.5–11px` | `700` | `0.6px` | Uppercase column headers |
| Sidebar Group Label | `9.5–10px` | `800` | `0.08em` | Sidebar section headings (uppercase) |

**Font Family:** System default — `"Inter", "DM Sans", -apple-system, sans-serif` (no custom font import in demo; production should import Inter via Google Fonts)

---

## Spacing

| Context | Value | Notes |
| --- | --- | --- |
| Page padding | `24px 28px` | Main content area |
| Card padding (body) | `16px 20px` or `18px 20px` | Content sections inside cards |
| CardHeader padding | `16px 20px` | With bottom border |
| StatCard padding | `20px 22px` | KPI stat cards |
| Modal header padding | `20px 24px` | Modal title bar |
| Modal body padding | `20px 24px` | Modal content |
| Input padding | `8px 12px` | Text inputs |
| Select padding | `8px 12px 8px 12px` | Dropdown selects |
| Button padding (sm) | `5px 12px` | Small buttons |
| Button padding (md) | `8px 16px` | Default buttons |
| Button padding (lg) | `10px 20px` | Large buttons |
| Table cell (th) | `10px 16px` | Header cells |
| Table cell (td) | `12px 16px` | Body cells |
| Badge padding | `3px 10px` | Status badges |
| Grid gap (cards) | `18px` | Card grid layouts |
| KPI row gap | `14px` | Between stat cards |
| Nav item gap | `1–2px` | Between nav items |
| Nav group gap | `6px` | Between nav groups |

---

## Border Radius

| Element | Radius | Notes |
| --- | --- | --- |
| Cards | `14px` | All Card components |
| StatCards | `14px` | KPI stat cards |
| Modals | `20px` | Modal container |
| Dropdown menus | `14px` | Flyout menus |
| Buttons | `9px` | All Btn variants |
| Badges | `20px` | Pill shape |
| Inputs | `8px` | Text inputs and selects |
| Sidebar nav items | `9–10px` | Nav item pill |
| Avatar | `size × 0.35` | Squircle (not circle) |
| StatCard icon square | `11px` | Icon background box |
| Logo icon block | `10–11px` | Brand logo container |
| Trend pill | `20px` | Trend indicator pill |

---

## Shadows

| Token | Value | Usage |
| --- | --- | --- |
| `shadow` (resting) | `0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04)` | Cards at rest, dropdowns |
| `shadowMd` (hover) | `0 4px 16px rgba(15,23,42,0.10), 0 2px 4px rgba(15,23,42,0.06)` | Cards on hover, elevated elements |
| `shadowLg` (modals) | `0 12px 40px rgba(15,23,42,0.14), 0 4px 8px rgba(15,23,42,0.08)` | Modals, large overlays |
| Button primary | `0 2px 12px rgba(99,102,241,0.30)` | Primary/secondary buttons |
| Avatar | `0 2px 4px rgba(0,0,0,0.1)` | Avatar hover shadow |
| Modal scrim | `0 25px 50px -12px rgba(0,0,0,0.25)` | Modal container shadow |

---

## Component Rules

### Buttons (`Btn`)

| Variant | Background | Text Color | Border |
| --- | --- | --- | --- |
| `primary` | `linear-gradient(135deg, #6366F1, #7C3AED)` | `#FFFFFF` | transparent + `boxShadow: 0 2px 12px rgba(99,102,241,0.30)` |
| `secondary` | Same gradient as primary | `#FFFFFF` | transparent |
| `outline` | `C.white` | `C.textMid` | `1px solid C.border` |
| `ghost` | transparent | `C.textMid` | transparent |
| `danger` | `C.dangerBg` | `C.danger` | `1px solid C.dangerBorder` |

- **Sizes:** `sm` (12px font, `5px 12px`), `md` (13px font, `8px 16px`), `lg` (14px font, `10px 20px`)
- **Font weight:** `600`
- **Animation:** `whileHover scale(1.02)`, `whileTap scale(0.98)`
- **Disabled:** `opacity: 0.5`, `pointerEvents: none`

### Badges (`Badge`)

| Variant | Background | Text | Border | Dot Color |
| --- | --- | --- | --- | --- |
| `success` | `C.successBg` | `C.success` | `C.successBorder` | `C.success` |
| `warning` | `C.warningBg` | `C.warning` | `C.warningBorder` | `C.warning` |
| `danger` | `C.dangerBg` | `C.danger` | `C.dangerBorder` | `C.danger` |
| `info` | `C.infoBg` | `C.info` | `C.infoBorder` | `C.info` |
| `primary` | `C.primaryLight` | `C.primary` | `C.primaryMid` | `C.primary` |
| `default` | `C.tableHead` | `C.textMid` | `C.border` | `C.textMid` |

- **Shape:** Pill (`borderRadius: 20`)
- **Font:** `11px`, weight `700`, `letterSpacing: 0.3px`
- **Dot indicator:** 5px circle before label
- **Entry animation:** `opacity 0→1, scale 0.92→1`

### Cards (`Card`)

- Background: `C.white`
- Border: `1px solid C.border`
- Radius: `14px`
- Shadow: `C.shadow` (resting), `C.shadowMd` (hover)
- Entry animation: `opacity 0→1, y 10→0`, duration `0.4s` easeOut
- No internal padding (content sections add their own)

### CardHeader

- Padding: `16px 20px`
- Bottom border: `1px solid C.borderLight`
- Title: `14px`, weight `700`, color `C.text`
- Subtitle: `12px`, color `C.textMuted`, `marginTop: 2px`
- Optional action slot (right-aligned)

### StatCard

- Padding: `20px 22px`
- Same border/radius as Card (`14px`, `1px solid C.border`)
- Icon square: `40×40px`, `borderRadius: 11`, variant-colored background
- Value: `30px`, weight `800`, `letterSpacing: -0.6px`
- Label: `12.5px`, weight `500`, color `C.textMuted`
- Trend pill: `11px`, weight `700`, pill shape, up=green/down=red/neutral=gray
- Decorative corner: semi-circle `${color}08` at bottom-right
- Hover: `y -4px`, shadow elevation to `shadowMd`
- Entry: `opacity 0→1, y 15→0`

### Inputs (`Input`)

- Padding: `8px 12px`
- Border: `1px solid C.border`
- Radius: `8px`
- Font: `13px`
- Focus: `boxShadow: 0 0 0 2px C.primaryLight`, `borderColor: C.primary`
- Width: `100%` (full container)

### Select

- Same padding and border as Input
- Custom chevron icon (positioned absolute right)
- `appearance: none` (no native dropdown arrow)
- Cursor: pointer

### Modal

- Backdrop: `rgba(15,23,42,0.4)` + `backdropFilter: blur(8px)`
- Container: `maxWidth: 840px`, `borderRadius: 20`, `maxHeight: 90vh`
- Animation: spring (`damping: 25, stiffness: 300`), `scale 0.95→1, y 20→0`
- Header: `20px 24px` padding, bottom border, title `18px`/`800`
- Close button: ghost Btn with `borderRadius: 50%`, X icon `20px`
- Body: `overflowY: auto`, `flex: 1`

### Tables

- Header: `C.tableHead` bg, `11px` uppercase, weight `700`, `letterSpacing: 0.6px`
- Cells: `12px 16px` padding, `13px` font, `C.borderLight` bottom border
- Alternating rows: `C.white` / `C.tableRow`
- Status columns: use Badge component
- Name columns: Avatar (24px) + name text

### Avatar

- Shape: Squircle (`borderRadius: size × 0.35`)
- Font: `size × 0.38`, weight `700`, white text
- Color: Deterministic from name — `name.charCodeAt(0) % 8`
- Palette: `[#6366F1, #3B82F6, #10B981, #F59E0B, #EF4444, #8B5CF6, #0891B2, #D97706]`
- Hover: `scale 1.1`

### Toggle Switch

- Track: `40×22px` (or `36×20px` in Settings), `borderRadius: 11`
- Knob: `18×18px` (or `16×16px`), white circle, `borderRadius: 50%`
- Active: track `C.primary`, knob at `left: 20px`
- Inactive: track `C.border`, knob at `left: 2px`
- Shadow: `0 1px 3px rgba(0,0,0,0.15)` on knob
- Transition: `left 0.2s`, `background 0.2s`

---

## Animation Patterns (Framer Motion)

| Element | Animation | Duration/Config |
| --- | --- | --- |
| Card entry | `opacity 0→1, y 10→0` | `0.4s easeOut` |
| Card hover | Shadow elevation to `shadowMd` | `0.2s` |
| StatCard hover | `y -4px` + `shadowMd` | — |
| StatCard stagger | `delay: index × 0.06s` | — |
| Modal enter | `scale 0.95→1, y 20→0, opacity 0→1` | Spring: `damping 25, stiffness 300` |
| Modal backdrop | `opacity 0→1` | — |
| Button hover/tap | `scale 1.02` / `scale 0.98` | — |
| Avatar hover | `scale 1.1` | — |
| Badge entry | `opacity 0→1, scale 0.92→1` | — |
| Alert banner | `height 0→auto, opacity 0→1, y -8→0` | `0.22s easeOut` |
| Sidebar collapse | `width 234↔62px` | `0.25s easeInOut` |
| Topbar entry | `y -20→0` | `0.5s` |
| Nav item hover | `x +2px` | — |
| Logo hover | `rotate 8deg, scale 1.08` | — |
| Nav chevron | `rotate 0→180°` | on dropdown open |
| Toast enter | `opacity 0→1, y -12→0` | `0.22s` |
| Toast exit | `opacity 1→0, y 0→-12` | `0.22s` |

---

## Status Color Mapping

| Status | Variant | Color |
| --- | --- | --- |
| `Active` | `success` | `#10B981` |
| `Present` | `success` | `#10B981` |
| `Approved` | `success` | `#10B981` |
| `Onsite` | `success` | `#10B981` |
| `On Leave` | `info` | `#3B82F6` |
| `Remote` | `info` | `#3B82F6` |
| `Pending` | `warning` | `#F59E0B` |
| `Late` | `warning` | `#F59E0B` |
| `Rejected` | `danger` | `#EF4444` |
| `Absent` | `danger` | `#EF4444` |
| `Inactive` | `default` | `#475569` |

---

## Layout Structure

### Admin Shell

```
┌─────────────────────────────────────────────────────┐
│ Topbar (height: 60px, z-index: 200)                  │
│ ├── Logo (gradient block + "Selfvora" wordmark)      │
│ ├── TOP_NAV (7 modules, pill-style active)           │
│ └── Right: Search ⌘K + Clock In + Bell + Dark mode   │
├──────────┬──────────────────────────────────────────┤
│ Sidebar  │ Main Content                              │
│ 234px    │ flex: 1                                   │
│ (or 62px │ overflowY: auto                           │
│ collapsed)│ padding: 24px 28px                       │
│          │                                           │
│ 3 groups │ Page component renders here               │
│ ─ Org    │                                           │
│ ─ Access │                                           │
│ ─ System │                                           │
└──────────┴──────────────────────────────────────────┘
```

- Sidebar width: `234px` expanded, `62px` collapsed
- Sidebar bg: `C.sidebar`
- Sidebar border: `1px solid C.border` (right)
- Active nav: left indicator bar (`3px`) + `C.navActive` bg
- Group labels: `9.5px` uppercase

### Employee Portal

```
┌──────────┬──────────────────────────────────────────┐
│ Sidebar  │ Main Content                              │
│ 224px    │ flex: 1                                   │
│          │ Permission-filtered pages                 │
│ Logo     │                                           │
│ Profile  │                                           │
│ Nav items│                                           │
│ ─ Dark   │                                           │
│ ─ Logout │                                           │
└──────────┴──────────────────────────────────────────┘
```

- No topbar — logo + profile in sidebar
- Nav items filtered by employee's job family permissions

---

## Industry Accent Colors (Dashboard only)

| Industry | Accent | Gradient |
| --- | --- | --- |
| Technology | `#6366F1` | `135deg → #6366f1, #8b5cf6` |
| Healthcare | `#0ea5e9` | `135deg → #0ea5e9, #06b6d4` |
| Finance | `#0f766e` | `135deg → #0f766e, #0d9488` |
| Retail | `#f97316` | `135deg → #f97316, #fb923c` |
| Manufacturing | `#475569` | `135deg → #475569, #64748b` |

---

## Icon System

- **Library:** Lucide React (`lucide-react`)
- **Default size:** `16px`
- **Default stroke width:** `1.75`
- **Color:** Uses `C.*` tokens (never hardcoded black/white)
- **39 named shortcuts** via `iconMap` (e.g., `"dashboard"` → `LayoutDashboard`, `"people"` → `Users`)
- **Fallback:** `HelpCircle` for unknown names

---

## Component Library

- **Framework:** React 18.2 + Framer Motion
- **All components are inline-styled** — zero CSS files, zero Tailwind, zero styled-components
- **Components defined in:** `src/App.jsx` (top section, lines 269–497)
- **Never use CSS classes** — all styling through the `style` prop + `C` color proxy
- **Production plan:** Extract to `/components/ui/` folder with same inline style patterns

| Component | Location | Props |
| --- | --- | --- |
| `Icon` | App.jsx:152 | `n`, `size`, `color`, `strokeWidth` |
| `Badge` | App.jsx:269 | `label`, `variant` |
| `Btn` | App.jsx:291 | `variant`, `size`, `onClick`, `disabled`, `children` |
| `Card` | App.jsx:314 | `children`, `noPad`, `style` |
| `CardHeader` | App.jsx:326 | `title`, `subtitle`, `action` |
| `StatCard` | App.jsx:336 | `label`, `value`, `sub`, `variant`, `trend`, `icon` |
| `Avatar` | App.jsx:383 | `name`, `size`, `color` |
| `Input` | App.jsx:397 | `placeholder`, `value`, `onChange`, `type` |
| `Select` | App.jsx:408 | `options`, `value`, `onChange` |
| `TableHead` | App.jsx:369 | `cols` |
| `Td` | App.jsx:379 | `children`, `muted` |
| `Modal` | App.jsx:464 | `isOpen`, `onClose`, `title`, `children` |
| `BarChart` | App.jsx:427 | `data`, `color`, `height` |
| `DonutChart` | App.jsx:442 | `segments`, `size` |
