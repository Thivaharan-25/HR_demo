# PeopleCore — HR Management Demo
## CLAUDE.md — Full Project Reference for AI Sessions

---

## Project Identity

**Name:** PeopleCore
**Type:** React SPA — HR Management System demo
**Stack:** React 18.2, Framer Motion, Lucide React, Vite
**Primary file:** `src/App.jsx` (~12,500 lines, monolithic)
**Supporting files:** `src/industryConfig.js`, `src/components/PayrollPage.jsx`, `src/components/HRSetupPages.jsx`, `src/components/NexisAI.jsx`
**Styling:** Inline styles ONLY — zero CSS files, zero Tailwind, zero styled-components
**State:** React Context only — no Redux, no Zustand
**Routing:** Single `useState` — no React Router

---

## Critical Constraints (read before every session)

1. **Inline styles only.** Never add CSS classes, CSS files, or Tailwind utilities.
2. **Use the `C` proxy for all colors.** Never hardcode light/dark color values — use `C.primary`, `C.text`, etc. New colors that are truly one-off (like industry accent hex) can be hardcoded inline.
3. **Never add npm dependencies** without explicit user request.
4. **Never restructure App.jsx.** Edit within existing component boundaries only.
5. **All mocked/computed data must be deterministic.** Seed from `string.length`, `charCodeAt(0)`, or array index. Never `Math.random()` in display-facing data.
6. **Fallback everything.** If `industryConfig` is null, every zone must fall back to the existing hardcoded UI with zero regressions.
7. **Dark mode must work.** Every new UI element must use `C.*` tokens so it respects the theme proxy.
8. **DataCtx is the single source of truth.** All data reads/writes go through `React.useContext(DataCtx)`.

---

## Authentication

| Account | Email | Password | Role |
|---|---|---|---|
| HR Admin | `admin@company.com` | `admin123` | `hr_admin` |
| Employee | `john@company.com` | `employee123` | `employee` (James Perera) |

Session is persisted to `localStorage` key `"peoplecore_session"`. Cleared on logout.

---

## Color Token System

### How It Works

```js
let _darkMode = false;
const C = new Proxy({}, { get: (_, k) => (_darkMode ? DARK_C : LIGHT_C)[k] });
```

`_darkMode` is mutated at the top of every `App()` render (`_darkMode = isDark`). Every component reading `C.*` gets the correct token at render time without subscribing to context.

### Light Mode — `LIGHT_C`

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#6366F1` | Indigo — buttons, active nav, accent bars |
| `primaryHover` | `#4F46E5` | Button hover |
| `primaryLight` | `#EEF2FF` | Active nav bg, badge fills, input focus bg |
| `primaryMid` | `#C7D2FE` | Badge borders, secondary button borders |
| `bg` | `#F5F7FA` | Page background, table heads |
| `white` | `#FFFFFF` | Cards, modals, topbar |
| `sidebar` | `#FFFFFF` | Sidebar surface |
| `border` | `#E5E9F0` | Card borders, inputs, dividers |
| `borderLight` | `#EFF2F8` | Table row dividers |
| `text` | `#0F172A` | Headings, body text |
| `textMid` | `#475569` | Secondary labels, nav items |
| `textMuted` | `#94A3B8` | Captions, subtitles, placeholders |
| `success` | `#10B981` | Active, present, approved |
| `successBg` | `#ECFDF5` | Success badge background |
| `successBorder` | `#A7F3D0` | Success badge border |
| `warning` | `#F59E0B` | Pending, late, at-risk |
| `warningBg` | `#FFFBEB` | Warning badge background |
| `warningBorder` | `#FDE68A` | Warning badge border |
| `danger` | `#EF4444` | Rejected, absent, error, high-risk |
| `dangerBg` | `#FEF2F2` | Danger badge background |
| `dangerBorder` | `#FECACA` | Danger badge border |
| `info` | `#3B82F6` | On Leave, info states |
| `infoBg` | `#EFF6FF` | Info badge background |
| `infoBorder` | `#BFDBFE` | Info badge border |
| `navActive` | `#EEEFFE` | Active nav item pill bg |
| `navHover` | `#F5F7FA` | Sidebar hover bg |
| `tableHead` | `#F5F7FA` | Table header row background |
| `tableRow` | `#FFFFFF` | Table row background |
| `shadow` | `0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04)` | Card resting shadow |
| `shadowMd` | `0 4px 16px rgba(15,23,42,0.10), 0 2px 4px rgba(15,23,42,0.06)` | Card hover shadow |
| `shadowLg` | `0 12px 40px rgba(15,23,42,0.14), 0 4px 8px rgba(15,23,42,0.08)` | Modals, dropdowns |

### Dark Mode — `DARK_C` (key differences)

| Token | Value |
|---|---|
| `primary` | `#818CF8` (lighter for dark bg readability) |
| `bg` | `#0C1118` (deep near-black) |
| `white` | `#141C2E` (card/topbar surface — deep navy) |
| `sidebar` | `#0F1729` (darker than cards) |
| `border` | `#1E2840` |
| `borderLight` | `#182035` |
| `text` | `#F1F5F9` |
| `success` | `#34D399` |
| `warning` | `#FBBF24` |
| `danger` | `#F87171` |
| All bg/border tokens | `rgba(color, 0.10/0.25)` — translucent instead of solid pastels |
| Shadows | `rgba(0,0,0,0.40–0.60)` — heavier |

### Industry Accent Colors (Dashboard only)

| Industry | Accent Hex | Gradient |
|---|---|---|
| Technology | `#6366f1` | `135deg → #6366f1, #8b5cf6` |
| Healthcare | `#0ea5e9` | `135deg → #0ea5e9, #06b6d4` |
| Finance | `#0f766e` | `135deg → #0f766e, #0d9488` |
| Retail | `#f97316` | `135deg → #f97316, #fb923c` |
| Manufacturing | `#475569` | `135deg → #475569, #64748b` |

---

## Typography Scale

| Use | Size | Weight | Notes |
|---|---|---|---|
| Page heading H1 | `22px` | `800` | `letterSpacing: -0.4px` |
| Section heading | `18–20px` | `700–800` | |
| Card title | `14px` | `700` | |
| Nav label | `13px` | `500` inactive / `700` active | |
| Body / table data | `13px` | `400–500` | |
| Secondary label | `12–12.5px` | `500` | |
| Caption / muted | `11px` | `500–600` | |
| Badge / tag | `11px` | `700` | pill shape, `letterSpacing: 0.3px` |
| Table header | `11px` | `700` | uppercase, `letterSpacing: 0.6px` |

Font family: system default (`fontFamily: "inherit"` everywhere). No custom font imports.

---

## Border Radius Scale

| Element | Radius |
|---|---|
| Cards | `14px` |
| StatCards | `14px` |
| Modals | `20px` |
| Dropdown menus | `14px` |
| Buttons | `8–9px` |
| Badges | `20px` (pill) |
| Inputs / selects | `8px` |
| Sidebar nav items | `10px` |
| Avatar | `size × 0.35` |
| Industry pill / rounded tags | `20px` |
| Industry insight card | `14px` |
| Logo / icon block | `10–11px` |
| StatCard icon square | `11px` |

---

## Spacing

- Page padding: `24px 28px`
- Card internal padding: `0` (content sections use their own `16px 20px` / `12px 20px`)
- CardHeader: `16px 20px` padding, `1px borderLight` bottom
- StatCard padding: `20px 22px`
- KPI card gap: `14px`
- Chart / panel row gap: `18px`
- Quick link gap: `12px`
- Sidebar nav item gap: `1px` between items, `6px` between groups

---

## Component Library (all in App.jsx, top section)

### `Icon`
```jsx
<Icon n="dashboard" size={16} color={C.primary} strokeWidth={1.75} />
```
Resolves short name → Lucide component via `iconMap`. Falls back to `Lucide.HelpCircle`.

**iconMap keys:** `dashboard, timesheet, leave, people, sign, projects, invoices, config, settings, bell, search, clock, chevDown, chevRight, plus, upload, export, filter, eye, edit, trash, check, close, arrowUp, menu, panel, org, dot, more, briefcase, trending, shield, globe, database, link, heart, user, star, calendar, refresh, code, dollar, book, alert`

### `Badge`
```jsx
<Badge label="Active" variant="success" />
```
Variants: `success`, `warning`, `danger`, `info`, `primary`, `default`
Pill shape (`borderRadius: 20`), dot indicator, `fontWeight: 700`, `letterSpacing: 0.3px`
Animates in: `opacity 0→1, scale 0.92→1`

### `Btn`
```jsx
<Btn variant="primary" size="sm" onClick={fn}>Label</Btn>
```
Variants: `primary`, `secondary`, `outline`, `ghost`, `danger`
Sizes: `sm` (12px), `md` (13px), `lg` (14px)
Animation: `whileHover scale(1.02)`, `whileTap scale(0.98)`

### `Card`
```jsx
<Card>content</Card>
```
White bg, 1px border, **14px** radius, shadow. `whileHover` elevates shadow. Animates in `opacity 0, y 10 → 1, 0` over 0.4s.

### `CardHeader`
```jsx
<CardHeader title="Title" subtitle="sub" action={<Btn>...</Btn>} />
```

### `StatCard`
```jsx
<StatCard label="Employees" value="15" variant="primary" sub="12 active" trend={3} icon="people" />
```
- **No left accent bar** (removed in redesign)
- `icon` prop (optional): renders 40×40 icon square with variant-colored background top-left
- `trend` prop: number → pill with ↑/↓ arrows + color; string → neutral pill
- Decorative semi-circle corner (`${color}08`) bottom-right
- `whileHover y(-4px)`, shadow elevation

### `Avatar`
Deterministic color from `name.charCodeAt(0) % 8` using palette:
`[#6366F1, #3B82F6, #10B981, #F59E0B, #EF4444, #8B5CF6, #0891B2, #D97706]`
Radius = `size × 0.35`. `whileHover scale(1.1)`.

### `Input` / `Select`
`whileFocus` adds `0 0 0 2px primaryLight` ring on Input.

### `Modal`
Backdrop: `rgba(15,23,42,0.4)` + `backdropFilter: blur(8px)`
Content: spring animation `damping:25, stiffness:300`, max-width 840px.

### `BarChart` / `DonutChart`
CSS-only bar chart + SVG donut using `strokeDasharray` technique.

---

## Animation Patterns (Framer Motion)

```
Card entry:         opacity 0→1, y 10→0, duration 0.4s easeOut
Card hover:         whileHover shadow elevation
KPI card stagger:   delay idx × 0.06s
Quick link stagger: delay 0.15 + idx × 0.08s
Alert banner:       height 0→auto, opacity 0→1, y -8→0, 0.22s easeOut (AnimatePresence)
Modal:              scale 0.95→1, y 20→0, opacity 0→1 (spring)
Sidebar collapse:   width 234↔62px, 0.25s easeInOut
Topbar entry:       y -20→0, 0.5s
Sidebar entry:      x -20→0
StatCard hover:     y -4px + shadowMd
Button hover/tap:   scale 1.02 / 0.98
Avatar hover:       scale 1.1
Logo hover:         rotate 8deg + scale 1.08
Nav chevron:        rotate 0→180° on dropdown open
Industry insight:   opacity 0→1, y 12→0, delay 0.4s
```

---

## Application Flow

```
Landing Page  →  "Start Free Trial"  →  CompanySetupWizard (6 steps)
                                                    ↓ onComplete(config)
                                          saves companyConfig + session
                                          to localStorage, calls handleLogin
Landing Page  →  "Sign In"  →  LoginPage  →  handleLogin
                                                    ↓
                                     role === "hr_admin" → AdminShell
                                     role === "employee" → EmployeeApp
```

---

## Layout Structure

```
AdminShell
├── Topbar (60px, z-index 200)
│   ├── Logo: gradient indigo block + "PeopleCore" wordmark
│   ├── TOP_NAV (7 modules, pill-style hover/active, dropdown menus)
│   └── Right: Search (⌘K pill) + Clock In btn + Bell + Dark mode toggle
└── flex row
    ├── Sidebar (234px / 62px collapsed)
    │   ├── Section: "Admin Panel" header
    │   ├── SIDE_NAV_GROUPS (3 groups: Organisation / Access & Data / System)
    │   └── Bottom: profile popup (name, role, dark mode toggle, logout)
    └── Main content (flex:1, overflowY:auto, padding 24px 28px)
        └── Page component from `page` state
```

---

## Navigation Structure

### TOP_NAV (Admin — module nav in topbar)

**Style:** Pill background on active/hover (no underline). Active = `C.navActive` bg + `C.primary` color.

| Key | Label | Sub-pages |
|---|---|---|
| `dashboard` | Dashboard | — |
| `timesheet` | Timesheet | All Records, Corrections, Overtime, Calendar, My Schedule |
| `leave` | Leave | My Requests, All Leave Requests, Leave Entitlements, Leave Types, Team Calendar |
| `people` | People | Directory, Onboarding, Offboarding, Lifecycle, Teams, Job Families, Holidays |
| `performance` | Performance | Overview, Goals & OKR, Feedback, Recognition, Reviews |
| `skills` | Skills & Talent | Skill Library, Skill Development, Gap Analysis, Dev Plans, Talent DNA, Succession |
| `payroll` | Payroll | Dynamic sub-nav from connected provider |

### SIDE_NAV_GROUPS (Admin — settings sidebar, grouped)

```
Organisation:  org, compensation, allowance, pension
Access & Data: permissions, integrations, documents, reports
System:        devices, config, settings
```

**Style:** Active item shows animated left indicator bar (3px) + `C.navActive` bg. Group labels are uppercase 9.5px.

### EMP_NAV_ITEMS (Employee portal)

`emp_dashboard, emp_timesheet, emp_calendar, emp_leave, emp_skills, emp_documents, emp_profile, emp_performance`

---

## Data Model

### Employee Schema

```js
{
  id: "EMP001",
  name: "James Perera",
  email: "james@company.com",
  phone: "+94 771234567",
  country: "LK",
  familyId: "jf1",
  level: "Staff Engineer",
  dept: "Engineering",
  managerId: null,
  type: "Full-time",
  startDate: "2022-01-15",
  status: "Active",
  salary: 185000,
  leaveBalance: { annual: 14, medical: 7, emergency: 3 },
  skills: ["JavaScript", "React", "AWS"],
  rating: 4.5,
  bankDetails: { bankName, branchName, accountNumber, accountHolderName, paymentMethod, currency },
  pensionEnrollment: { planId, enrollmentDate, status, customEmpRate }
}
```

**15 seeded employees:** EMP001–EMP015. Mostly Sri Lanka (`country: "LK"`), one UK (`EMP006`).

### Payroll Records (computed at startup)

```js
{ id, empId, empName, dept, country, currency, baseSalary, allowances, allowanceBreakdown[], deductions, pensionPlanId, tax, netPay, status: "Paid"|"Pending", period }
```

### Skill Requests (seeded)

```js
{
  id: "SR001", empId, empName, skillName, skill: "SkillName → Level",
  fromLevel, toLevel, evidence, validatorId, validatorName,
  requiresEvidence, status: "pending"|"approved"|"rejected",
  submittedAt, requestedAt, reviewNote
}
```
3 seeded entries: SR001 (TypeScript), SR002 (React), SR003 (Kubernetes) — all status `"pending"`.

---

## DataCtx — Full Value Object

```js
const dataCtxValue = {
  employees, setEmployees,
  jobFamilies, setJobFamilies,
  skillLibrary, setSkillLibrary,
  teams, setTeams,
  leaveRequests, setLeaveRequests,
  attendance,                         // read-only (IIFE generated)
  payroll, setPayroll,
  notifications, setNotifications,
  skillRequests, setSkillRequests,    // seeded with 3 pending requests
  sharedDocuments, setSharedDocuments,
  goals, setGoals,
  feedbacks, setFeedbacks,
  recognitions, setRecognitions,
  reviews, setReviews,
  companyConfig,
  navigate: setPage,
};
```

---

## localStorage Persistence

```js
const LS_CONFIG_KEY  = "peoplecore_company_config";
const LS_SESSION_KEY = "peoplecore_session";
```

---

## Industry Dashboard Configuration

Defined in `src/industryConfig.js`, imported as `INDUSTRY_CONFIGS`.

### Industry → Zone mapping

| Industry | `primaryChart` | `secondaryPanel` | Alert Banner |
|---|---|---|---|
| Technology | `"skills"` | `"attrition"` | Q2 hiring plan behind target |
| Healthcare | `"attendance"` | `"compliance"` | Ward B below staffing ratio |
| Finance | `"payroll"` | `"reviews"` | Quarterly payroll audit due |
| Retail | `"attendance"` | `"turnover"` | Weekend shift unfilled slots |
| Manufacturing | `"attendance"` | `"overtime"` | Line 3 night shift understaffed |

---

## Dashboard Zone Structure (DashboardPage)

```
Zone 1: Header
  ├── iCfg active: gradient banner, white text, industry pill
  └── iCfg null: plain "HR Dashboard" + date

Zone 2: Alert Banner (AnimatePresence, dismissable)
  └── iCfg.alertBanner — severity-colored (info/warning/critical)

Zone 3: KPI Stat Cards (4 columns)
  ├── iCfg active: industry kpiCards — icon, trend pill, tooltip
  └── iCfg null: Total Employees, Attendance, Pending Leaves, Payroll

Zone 3b: Quick Links Row (iCfg only)

Zone 4: Primary Chart (left column)
  ├── "skills":     avg skills per dept — horizontal bars
  ├── "payroll":    sum netPay per dept — horizontal bars
  └── "attendance": Present/Late/Absent blocks

Zone 5: Secondary Panel (right column)
  ├── "attrition":  top 3 flight risks (deterministic score)
  ├── "compliance": 3 nearest cert expiry (seeded from name)
  ├── "reviews":    pending performance reviews (live DataCtx)
  ├── "turnover":   recent hires + exit count
  ├── "overtime":   top 3 OT hours (seeded from emp ID)
  └── null:         Department Overview headcount bars

Zone 6: Pending Actions (2-column grid)
  ├── Technology:    Dev Requests (skillRequests) + Leave Approvals
  ├── Healthcare:    Shift Coverage Risk Leave + Notifications
  ├── Finance:       Compliance Action Items + Leave Approvals
  ├── Retail:        Shift Gaps table + Leave Approvals
  ├── Manufacturing: Safety Checklist + Overtime Records
  └── fallback:      Leave Approvals + Notifications

Zone 7: Industry Insight Card (iCfg only)
  └── borderLeft: 3px solid accentColor, background: accentColor + "14"
```

---

## Company Setup Wizard (7 steps — streamlined)

| # | Key | Label | What it configures |
|---|---|---|---|
| 1 | `welcome` | Company Profile | Name, industry, size, country, timezone, currency, fiscal year |
| 2 | `org` | Organisation | Departments, office locations |
| 3 | `jobs` | Job Families & Skills | Career ladders, level names, must-have skills per family |
| 4 | `migration` | Employee Import | CSV upload or manual entry |
| 5 | `leave` | Leave Policies | Types, accruals, carry-over rules |
| 6 | `attendance` | Attendance | Work hours, shifts, overtime rules |
| 7 | `golive` | Payroll & Launch | Payroll integration, deductions, admin email, go live |

**Step 3 detail — Job Families & Skills:**
- 5 family options: Engineering & Tech (`tech`), HR & People (`hr`), Sales & Revenue (`sales`), Finance & Accounting (`finance`), Custom
- Per family: editable career levels list with up/down reorder + delete + Add Level + Reset
- Per family: must-have skills tags (add by typing + Enter or "Add" button, remove with ×)
- `familySkills` state pre-seeded with sensible defaults per family
- On Go Live: `requiredSkills: [...familySkills[f]]` written to each job family in DataCtx
- Skill tags power Nexis AI gap analysis and Skills module recommendations

**Removed from wizard** (configured post-launch in Settings): Performance Cycles, Training & Compliance, Security & Notifications.

---

## Payroll Integration

**File:** `src/components/PayrollPage.jsx`

| Provider | Coverage | Auth |
|---|---|---|
| Deel | 150+ countries | API Key |
| Xero Payroll | UK, AU, NZ | OAuth 2.0 |
| ADP Workforce Now | USA, Canada | OAuth 2.0 + Client ID/Secret |

---

## Status Color Mapping

```js
"Active"   → success (#10B981)
"On Leave" → info    (#3B82F6)
"Pending"  → warning (#F59E0B)
"Approved" → success (#10B981)
"Rejected" → danger  (#EF4444)
"Inactive" → default (#475569)
```

---

## Avatar Color Palette (deterministic)

```js
const colors = ["#6366F1","#3B82F6","#10B981","#F59E0B","#EF4444","#8B5CF6","#0891B2","#D97706"];
const bg = colors[name.charCodeAt(0) % colors.length];
```

---

## Known Issues / Watch-outs

1. **`INITIAL_ATTENDANCE` uses `Math.random()`** — runs once at startup (IIFE). Data is stable within a session but changes on every page refresh. Not a bug, worth noting.

2. **Topbar Clock In button** has no onClick handler — visual demo element only.

3. **`DataCtx` does not expose `setAttendance`** — attendance is read-only after IIFE generation.

4. **Manufacturing accent color** (`#475569` slate-gray) is visually weak. Consider `#0369a1` or `#b45309` for a stronger industrial feel.

5. **Zone 7 has no CTA link** — the industry insight card is informational only. Consider adding a `navigate()` call.

---

## File Map

```
src/
├── App.jsx                    ~12,500 lines — all admin + employee pages
├── industryConfig.js          ~524 lines — 5 industry configs
├── main.jsx                   Vite entry point
└── components/
    ├── PayrollPage.jsx        Payroll integration wizard
    ├── HRSetupPages.jsx       Allowance, Pension, Permissions pages
    ├── NexisAI.jsx            AI assistant floating panel
    └── ui/
        ├── radial-orbital-timeline.jsx
        ├── testimonials-columns-1.jsx
        ├── hero-parallax.jsx
        ├── typewriter.jsx
        ├── smoke-card.jsx
        └── theme-toggle.jsx
```

---

## Contexts

| Context | Carries |
|---|---|
| `ThemeCtx` | `isDark: bool`, `toggleTheme: fn` |
| `UserCtx` | `currentUser: object \| null` |
| `DataCtx` | All HR data arrays + setters + `companyConfig` + `navigate` |
| `PayrollIntegrationCtx` | Connected provider state, credentials (payroll module only) |

---

*This file is the authoritative reference for all Claude Code sessions on this project.*
*Last updated: 2026-03-16 — UI/UX redesign + 6-step wizard*
