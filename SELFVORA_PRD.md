# Selfvora — Product Requirements Document

> **Status:** Draft | **Owner:** Product Manager | **Last Updated:** 2026-03-21

---

## 1. Overview

Selfvora is an all-in-one HR Management System that unifies employee management, attendance tracking, leave management, payroll integration, performance management, skill development, and AI-powered HR intelligence into a single platform. It ships as a React web app, a Flutter mobile app, and a .NET monolithic backend — built to serve growing companies with 10–500 employees across multiple countries.

The platform has two portals: an **Admin Shell** (full HR admin control: employees, attendance, payroll, permissions, org structure, reports, integrations, configurations) and an **Employee Portal** (self-service: timesheet, leave, skills, performance, documents, profile). Employee portal visibility is permission-controlled based on the employee's job family and any admin-granted overrides.

---

## 2. Problem Statement

Growing companies rely on 4–7 disconnected tools for HR: a spreadsheet for headcount, a separate leave tracker, a third-party payroll provider, a learning platform, and a performance tool. This creates data duplication, compliance risk, and HR teams spending the majority of their time on manual coordination.

**Who has this problem:**
- **HR Admins** — no single source of truth for employee data; drowning in manual approvals and spreadsheet reconciliation
- **Employees** — multiple logins, no visibility into leave balances, no self-service for skill development or document access
- **Managers** — no real-time view of team attendance, performance, or skill gaps
- **Finance teams** — payroll data lives outside the HR system; salary, allowances, deductions, and pension require manual reconciliation
- **Founders/CEOs** — no real-time workforce analytics for headcount, attrition, or budget decisions

---

## 3. Goals & Success Metrics

| Goal | Metric | Target |
| --- | --- | --- |
| Reduce HR admin time | Hours saved per HR manager per week | ≥ 8 hrs/week |
| Unify employee lifecycle | % of hire-to-offboard managed in Selfvora | 100% |
| Improve attendance accuracy | % of clock-ins with verified method (biometric/GPS/Wi-Fi) | ≥ 90% |
| Payroll accuracy | Payroll discrepancy rate per cycle | < 0.5% |
| Employee self-service adoption | % of leave requests submitted via app (not email/verbal) | ≥ 85% |
| Skill gap visibility | % of employees with skill profile mapped to job family requirements | ≥ 80% |
| AI assistant engagement | % of HR decisions with Nexis AI suggestion reviewed | ≥ 50% |
| Time-to-onboard | Days from offer accepted to fully provisioned Day 1 | ≤ 3 days |

---

## 4. Target Users

**Primary Users:**
- **HR Admin** — full system control: employees, payroll, leave policies, permissions, reports, org config, integrations, devices
- **HR Executive / Manager** — day-to-day operations: approvals, onboarding, reviews, skill assignments, team management
- **Employee** — self-service portal: clock-in/out, leave requests, skill development, documents, performance check-ins, profile management

**Secondary Users:**
- **Department Manager** — approve leave, view team attendance/performance, run team reports (permissions-controlled)
- **Finance / Payroll Admin** — payroll runs, salary/allowance/pension setup, tax compliance, payroll reports
- **IT / System Admin** — device management (biometric terminals, GPS trackers), integrations, security config, system settings

---

## 5. Core Features (v1)

### Admin Portal

| Feature | Description | Priority |
| --- | --- | --- |
| **Employee Directory & Profiles** | Full employee records: personal info, bank details, country, job family, level, manager, skills, salary, leave balance, pension enrollment, rating. 15-field employee schema. Search, filter by status/dept/level/type, sort by any column. | P0 |
| **Onboarding Workflow** | 6-step employee onboarding wizard: welcome/role confirmation, personal info, document upload, GDPR/PDPA consent, notification preferences, security setup (password + MFA). HR-side: add employee form, CSV import, invite tracking. | P0 |
| **Offboarding** | Exit workflow with 5 checklist tasks (exit survey, knowledge transfer, asset return, access revocation, final settlement). Penalty system for incomplete tasks. Calendar view of last days. | P0 |
| **Attendance System** | Configurable capture methods: biometric terminal, mobile GPS, Wi-Fi detection, manual entry. Each method mappable to Onsite/Offsite/Both. Two tracking modes: Standard Schedule (fixed start/end times, grace period for lateness) or Hour Limit Only (employee completes daily hour target, no fixed schedule). Geo-fencing per office location with configurable radius. Manual override fallback with reason notes and admin notifications. | P0 |
| **Leave Management** | Multi-type leave policies (annual, medical, emergency, unpaid). Accrual rules, carry-over limits, notice period requirements. Team calendar heatmap. Approve/reject with reason. Leave entitlements per employee with balance editing. | P0 |
| **Work Schedule & Shifts** | Shift management (create shifts: name, start/end time, color). 4 pre-seeded templates (Morning, General, Evening, Night). Assign employees to shifts (permanent, fixed date range, or rotating). 5 work schedule templates (Full Onsite, Full Remote, Hybrid 3-2, Hybrid 2-3, Flex/Split). | P0 |
| **Payroll Integration** | Connect external providers: Deel (150+ countries), Xero Payroll (UK/AU/NZ), ADP Workforce Now (US/CA), QuickBooks (US/UK), Oracle HCM (50+ countries, enterprise). Multi-country tax engines: Sri Lanka (EPF/ETF/APIT), UK (PAYE/NI/Pension), US (Federal/SS/Medicare), Australia (PAYG/Super). OAuth 2.0 + API Key auth. Field mapping, sync history, CSV export. | P0 |
| **Role-Based Permissions** | Permission matrix per job family position: 14 modules × 6 actions (view, create, edit, delete, export, approve). Per-employee overrides. Grant All / Revoke All per role. Employee portal dynamically shows/hides nav items based on granted permissions. | P0 |
| **Performance Management** | Goals & OKR tracking (create, progress %, status: on-track/at-risk/completed). 360° peer feedback (anonymous option, rating 1-5). Public recognition wall (badges, points, leaderboard). Structured review cycles (self-assessment, manager score, HR sign-off, calibration). | P1 |
| **Skill Library** | Company-owned skill taxonomy with proficiency levels. Per-skill: category, evidence required, validation rules, learning resources (link/video/file upload). Required skills per job family. Skill request validation workflow (employee submits evidence → validator approves). | P1 |
| **Learning Hub** | Internal content (resources from Skill Library auto-synced + direct video/article uploads) always available. External LMS sync via integrations: Thinkific (headless LMS API), LinkedIn Learning (enterprise API), SCORM Cloud (SCORM/xAPI). Course assignment to employees. Completion tracking. SSO redirect to provider platforms. | P1 |
| **Development Plans** | Manager-assigned dev plans with skill-tagged milestones. Each milestone has: title, due date, description, attached skills from Skill Library. Matching Learning Hub courses shown inline per skill. Progress tracking. Employee's current skills displayed during plan creation. | P1 |
| **Skill Gap Analysis** | Heatmap: employees vs job family required skills. Department-level aggregation. Missing skill identification. Learning path recommendations. | P1 |
| **Talent DNA & Succession** | Employee strength profiles, skill radar. Succession planning: heir per role, readiness score, bench strength. Flight risk scoring. Development milestones for successors. | P1 |
| **Reports & Analytics** | 6 report types: Headcount, Workforce Trends (turnover/attrition), Attendance, Leave Utilisation, Payroll Summary, Skills Coverage. Each with: department/status filters, customisable column selection, CSV export, sort by any column, email scheduling (weekly/monthly/quarterly). Summary stat pills per report type. Currency dynamically uses company config. | P1 |
| **Org Structure** | Visual org chart from manager relationships. Department management (add/edit/delete, assign to legal entities). Legal entity management (multi-country branches with registration number, currency, address). Office location management. | P1 |
| **Documents** | Shared policy/template library. Upload with metadata (type, description). Acknowledgement tracking per employee. Read status. Download. | P1 |
| **AI Assistant (Nexis AI)** | Embedded floating chat panel. 8 AI capabilities: HR policy Q&A, attrition risk scoring (algorithm: salary ratio + rating + tenure + leave patterns → 4-95 score), promotion readiness (tenure + rating + skill coverage → 0-100), skill gap analysis, 12-month dev plan generation (4 phases), workforce overview, attendance pattern insights, JD generation. Quick action buttons for common queries. | P1 |
| **Biometric Device Management** | Register hardware terminals (fingerprint, face recognition, multi-modal). 4 demo devices (ZKTeco, Suprema, HikVision, Anviz). Live heartbeat monitoring (online/offline/warning). Employee enrollment per device. Scan simulation with match scoring. Event log with CSV export. HMAC verification. Consent workflow for biometric data. Decommission with confirmation. | P1 |
| **Integrations Hub** | 16 pre-configured integrations across: Payroll (Deel, Xero, ADP, Oracle HCM), Learning (Thinkific, LinkedIn Learning, SCORM Cloud), Calendar (Google Calendar, Microsoft Outlook), Identity (Google Workspace SSO, Azure AD/Okta), Billing (Stripe, Direct Pay Online), Notifications (Firebase Cloud Messaging, SendGrid). Connect/disconnect UI, health status, sync logs. | P2 |
| **Allowance Setup** | Define allowance types (Transport, Meals, Housing, Phone, Wellness, Clothing, Education). Fixed amount or % of salary. Taxable/non-taxable. Scope: all employees, by position (job family), or per-employee. Active/inactive toggle. Per-employee total calculation. | P2 |
| **Pension Setup** | Define pension plans (EPF, 401k, SMSF). Employer & employee contribution rates. Vesting schedule. Per-employee enrollment with custom rate overrides. | P2 |
| **Employee Lifecycle** | Timeline view (hire, promotions, leaves, milestones). Bulk action triggers (contracts, promotion letters, exit notices). | P2 |
| **Teams** | Team creation with lead, members, projects. Org roles within teams. Aggregate team skill view. | P2 |
| **Holidays** | Public holiday management by country. Custom holidays. Bulk CSV import. Used in attendance calculation. | P2 |

### Employee Portal

| Feature | Description | Priority |
| --- | --- | --- |
| **Employee Dashboard** | Welcome message, quick stats (leave balance, pending requests, team size). Clock-in/out button with work mode selector (Onsite/Remote/Hybrid). Recent announcements. Team snapshot. Due goals & reviews. Onboarding checklist (if incomplete). | P0 |
| **My Timesheet** | Personal clock-in/out log. Mode detection (Remote default in browser, Onsite via biometric). Manual fallback option (admin-controlled). Daily/weekly summary. | P0 |
| **My Leave** | Apply for leave (type, dates, reason). View pending/approved/rejected. Leave balance display. Cancel pending requests. | P0 |
| **My Profile** | Edit personal info, emergency contacts, bank details. Pension enrollment status. Social profile links. | P0 |
| **My Skills** | Current skills with proficiency. Request skill validation (upload evidence). Gap analysis vs job family requirements. Link to learning resources. | P1 |
| **My Performance** | View reviews (scores, feedback, manager comments). Goals & OKR progress with self-assessment. Recognition received. Feedback summary. | P1 |
| **My Documents** | View shared company documents. Download. Acknowledge receipt. Personal documents (contract, certifications). | P1 |
| **My Calendar** | Leave and shift schedule on monthly calendar. | P1 |
| **Permission-Based Nav** | Sidebar items dynamically visible based on employee's job family permissions. Profile page always visible. Admin can grant/revoke module access per position or per employee. | P0 |

### Configuration System

| Feature | Description | Priority |
| --- | --- | --- |
| **Time Config** | Standard working days (Mon-Sun toggle). Start of week. Conditional: if Standard Schedule mode → start/end of work day + grace period; if Hour Limit mode → daily hour requirement input. Time zone. | P0 |
| **Attendance Config** | Tracking mode selection (Standard Schedule or Hour Limit Only). Capture method selection (Biometric/GPS/Wi-Fi/Manual) with onsite/offsite mapping per method. Work mode toggles (Onsite/Remote/Hybrid). Geo-fencing per office. Manual override fallback settings (require reason, notify admin, max consecutive days before escalation). | P0 |
| **Sign Config** | Digital signature requirements per document type (employment contracts, leave policy, DPA, NDA). | P1 |
| **User Roles Config** | Read-only role permission matrix (Employee/Manager/HR Admin/System Admin vs 7 modules). | P1 |
| **Integrations Config** | 8 integration slots: ADP, Oracle HCM, Google Calendar, Outlook, Google Workspace SSO, Azure AD/Okta, LMS Provider, Stripe. Connect/configure/disconnect. | P1 |
| **Security Config** | MFA per role (HR Admin, System Admin, Employees). Session policy (timeout, max sessions, lockout threshold). | P1 |
| **Settings Page** | Organisation Profile (name, registration, email, industry — persisted to localStorage). Regional Settings (market, currency, date format, language). Notification Preferences (8 toggles including Learning Hub completion and Dev Plan milestone due — persisted). Data & Privacy (retention, backup, residency — display only). | P1 |

### Company Setup

| Feature | Description | Priority |
| --- | --- | --- |
| **Quick Setup Wizard** | Single-screen onboarding: company name, industry (Technology/Finance/Healthcare/Retail/Manufacturing/Education/Consulting), company size, work email, password. Creates companyConfig with country, timezone, currency, fiscal year defaults. Post-setup: configure job families, leave policies, shifts, devices in individual pages. | P0 |

### Industry-Specific Dashboard

| Feature | Description | Priority |
| --- | --- | --- |
| **Industry Dashboard** | 5 vertical configurations (Technology, Healthcare, Finance, Retail, Manufacturing). Each defines: gradient header with accent color, alert banner (info/warning/critical), 4 KPI cards with trends, quick link shortcuts, primary chart (skills/payroll/attendance), secondary panel (attrition/compliance/reviews/turnover/overtime), pending action grids, industry insight card. Deterministic mock values (no Math.random). Falls back to generic dashboard when industry not configured. | P1 |

---

## 6. Out of Scope (v1)

- QR code-based clock-in (not planned)
- Native payroll processing engine — Selfvora integrates with providers, does not process payroll internally
- Video conferencing or internal messaging — integrate with Slack/Teams
- Applicant Tracking System (ATS) — recruitment pipeline is out of scope
- Training content authoring — Selfvora plays/links/syncs content, does not build it
- Custom domain / white-labelling
- Offline-first mobile (v1 requires internet)
- Multi-tenant SaaS architecture (single-tenant per deployment for v1)

---

## 7. Assumptions & Constraints

**Technical:**
- **Backend:** .NET (C#), monolithic architecture — single deployable with internal domain separation (employees, attendance, leave, payroll, skills, performance, AI)
- **Web frontend:** React SPA, REST API communication (JSON). Inline styles only (no CSS files, no Tailwind in production). Color token system via Proxy (`C.primary`, `C.text`, etc.) for automatic dark mode
- **Mobile:** Flutter (iOS + Android), shares the same REST API
- **Auth:** JWT sessions. SSO via OAuth 2.0 for LMS/payroll integrations
- **Database:** PostgreSQL or SQL Server (relational) as primary store
- **AI:** Claude API (Anthropic) for Nexis AI intelligence features
- **File storage:** Cloud blob storage (S3/Azure Blob) for documents, videos, uploads
- **Styling constraint:** All UI styling is inline — zero CSS files, zero Tailwind. Colors via `C` proxy token system. Dark mode automatic
- **State:** React Context only (no Redux/Zustand). Single `useState` for routing (no React Router)

**Business:**
- Target company size: 10–500 employees
- Multi-country from Day 1 (minimum: Sri Lanka + UK; extensible to US, AU, India)
- GDPR compliance required for UK data; data residency configurable per region
- The current demo codebase uses hardcoded seed data (15 employees, deterministic attendance/payroll). Production uses live .NET backend
- Biometric hardware integration is a core differentiator — not deferred

**Resource:**
- AI-assisted build using Claude Code, Cursor, and Antigravity
- Solo or small team; monolithic architecture to reduce operational complexity
- No dedicated QA team — rely on TypeScript (frontend), C# (backend), automated tests

**Data Model (core entities):**
- Employee: 20+ fields (id, name, email, phone, country, familyId, level, dept, managerId, type, startDate, status, salary, leaveBalance, skills[], rating, bankDetails, pensionEnrollment)
- Attendance: empId, date, clockIn, clockOut, hours, status, mode, method, verified
- Leave: empId, type, from, to, days, status, reason
- Payroll: empId, baseSalary, allowances, deductions, pension, tax, netPay, period, status
- Skill: name, category, evidenceRequired, validatorRole, resources[], steps[]
- DevPlan: empId, milestones[] (title, dueDate, skills[], status)
- Permission: familyId → { module → { action → bool } }, empOverrides

---

## 8. Timeline

| Milestone | Target Date | Scope |
| --- | --- | --- |
| **Architecture & Setup** | 2026-03-28 | .NET solution structure, DB schema (PostgreSQL), React scaffold (token system, routing, contexts), Flutter scaffold, JWT auth, CI/CD pipeline |
| **Core HR Alpha** | 2026-04-11 | Employee CRUD, attendance (all 4 methods + hour limit mode), leave management, permissions enforcement, settings + config pages, company setup |
| **Payroll + Skills Beta** | 2026-04-25 | Payroll provider integrations (Deel/Xero/ADP/QuickBooks), tax engines (SL/UK/US/AU), allowance/pension setup, skill library, learning hub (internal + LMS sync), dev plans, gap analysis |
| **Performance + AI Beta** | 2026-05-09 | Goals/OKR, feedback, reviews, recognition, Nexis AI (Claude API), biometric device management, org chart, reports |
| **Mobile + Integration** | 2026-05-16 | Flutter app (clock-in, leave, skills, documents), industry dashboard configs, integrations hub (Oracle HCM, SSO, calendar sync) |
| **v1 Launch** | 2026-05-21 | All P0 + P1 features stable, employee portal with permission-based nav, end-to-end testing, production deployment |

---

## 8b. Authentication (Demo)

| Account | Email | Password | Role |
| --- | --- | --- | --- |
| HR Admin | `admin@company.com` | `admin123` | `hr_admin` |
| Employee | `john@company.com` | `employee123` | `employee` (James Perera) |

Session stored in `localStorage` key `"peoplecore_session"`. Cleared on logout.

---

## 8c. Production Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                      Selfvora Platform                          │
├──────────────────┬───────────────────┬─────────────────────────┤
│  Web App (React) │  Mobile (Flutter) │  Admin Portal (React)   │
└──────────────────┴───────────────────┴─────────────────────────┘
                            │
                     REST API (HTTPS / JWT)
                            │
┌───────────────────────────▼────────────────────────────────────┐
│               .NET Backend (Monolith — C#)                      │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────────┐  │
│  │ Employees │ │ Attendance│ │   Leave   │ │ Payroll Sync  │  │
│  ├───────────┤ ├───────────┤ ├───────────┤ ├───────────────┤  │
│  │  Skills   │ │ Learning  │ │ Dev Plans │ │ Performance   │  │
│  ├───────────┤ ├───────────┤ ├───────────┤ ├───────────────┤  │
│  │ Reports   │ │   Auth    │ │ Nexis AI  │ │ Notifications │  │
│  ├───────────┤ ├───────────┤ ├───────────┤ ├───────────────┤  │
│  │   Org     │ │ Permissions││  Devices  │ │ Integrations  │  │
│  └───────────┘ └───────────┘ └───────────┘ └───────────────┘  │
└───────────────────────────┬────────────────────────────────────┘
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
  PostgreSQL          Claude API          External APIs
  (Primary DB)       (Anthropic)         ├─ Deel / Xero / ADP / QuickBooks / Oracle HCM
                    Nexis AI Engine      ├─ Thinkific / LinkedIn Learning / SCORM Cloud
                                         ├─ Google Cal / Outlook / SSO (Google / Azure AD)
                                         ├─ Stripe / Direct Pay Online / SendGrid / FCM
                                         └─ Biometric Device APIs
```

---

## 8d. File Map (Production)

```
selfvora/
├── web/                         React SPA
│   ├── src/
│   │   ├── pages/               One folder per module
│   │   ├── components/          Shared UI (Badge, Btn, Card, Modal, StatCard, Avatar, etc.)
│   │   ├── contexts/            ThemeCtx, UserCtx, DataCtx, PayrollIntegrationCtx
│   │   ├── hooks/               useToast, useAttendance, usePermissions, etc.
│   │   ├── api/                 REST client (fetch wrappers)
│   │   └── tokens/              Color system (C proxy, LIGHT_C, DARK_C)
│   └── public/
│
├── mobile/                      Flutter app
│   └── lib/
│       ├── screens/             Employee-facing screens
│       ├── widgets/             Shared Flutter widgets
│       ├── services/            API calls, local storage, GPS, biometric
│       └── models/              Dart data models
│
└── backend/                     .NET Monolith
    └── Selfvora.Api/
        ├── Controllers/         REST endpoints per module
        ├── Services/            Business logic (attendance calc, tax engines, AI)
        ├── Repositories/        DB access (EF Core)
        ├── Models/              Entity classes
        ├── AI/                  Claude API integration (Nexis AI)
        ├── Integrations/        Payroll, LMS, Oracle HCM, calendar connectors
        ├── DeviceSync/          Biometric terminal communication layer
        └── Migrations/          EF Core DB migrations
```
