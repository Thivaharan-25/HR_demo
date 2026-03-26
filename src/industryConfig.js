/* ═══════════════════════════════════════════════════════════════
   Selfvora — Industry Dashboard Configurations
   Keyed to the exact dropdown values used in CompanySetupWizard Step 1.
   mockValue(employees, company) must be DETERMINISTIC — no Math.random().
   Seed only from employees.length and company.name.length.
   ═══════════════════════════════════════════════════════════════ */

export const INDUSTRY_CONFIGS = {

    /* ─────────────────────────────────────────────────────────────
       TECHNOLOGY
    ───────────────────────────────────────────────────────────── */
    "Technology": {
        accentColor: "#6366f1",
        accentGradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",

        companyBanner: {
            headline: "{company} Engineering Hub",
            subline:  "People data for teams that ship fast",
        },

        kpiCards: [
            {
                label:    "Total Headcount",
                icon:     "Users",
                valueKey: "employees.length",
                mockValue: null,
                color:    "#6366f1",
                trend:    "+3 this quarter",
                tooltip:  "Active full-time and contractor headcount",
            },
            {
                label:    "Attrition Risk",
                icon:     "TrendingDown",
                valueKey: "mocked",
                mockValue: (emp) => `${Math.max(1, Math.floor(emp.length * 0.2))} High Risk`,
                color:    "#ef4444",
                trend:    "2 flagged this week",
                tooltip:  "Employees scored >70 on Nexis AI attrition model",
            },
            {
                label:    "Skills Gaps",
                icon:     "Zap",
                valueKey: "mocked",
                mockValue: (emp) => `${Math.max(4, Math.floor(emp.length * 0.8))} gaps`,
                color:    "#f59e0b",
                trend:    "Across 4 teams · Updated 2d ago",
                tooltip:  "Missing skills vs job family requirements across all roles",
            },
            {
                label:    "OKR Completion",
                icon:     "Target",
                valueKey: "mocked",
                mockValue: (_emp, co) => `${58 + (co.name.length % 20)}% on track`,
                color:    "#10b981",
                trend:    "Q2 cycle · 6 weeks left",
                tooltip:  "% of active goals marked On Track or Completed",
            },
        ],

        quickLinks: [
            {
                label:       "Skills Gap Analysis",
                icon:        "Zap",
                page:        "skills_Gap_Analysis",
                description: "See which teams are under-skilled",
            },
            {
                label:       "Performance OKRs",
                icon:        "Target",
                page:        "performance_Goals_&_OKR",
                description: "Track Q2 goal progress",
            },
            {
                label:       "Headcount Planner",
                icon:        "Users",
                page:        "people_Directory",
                description: "View org structure and open roles",
            },
            {
                label:       "Attrition Watchlist",
                icon:        "TrendingDown",
                page:        "performance_Overview",
                description: "AI-flagged flight risks",
            },
        ],

        alertBanner: {
            message:  "Q2 hiring plan is 2 offers behind target — 3 roles still open in Engineering",
            severity: "warning",
            icon:     "AlertTriangle",
        },

        secondaryPanel: "attrition",

        dashboardSections: {
            primaryChart:         "skills",
            primaryChartLabel:    "Skills Coverage by Team",
            showLeavePanel:       false,
            showPayrollPanel:     false,
            showSkillsPanel:      true,
            showCompliancePanel:  false,
        },

        emptyStateMessage: "Add your engineering team to start tracking OKRs and skills gaps.",

        industryInsight: {
            stat:      "Tech companies lose $30,000–$50,000 per engineer who leaves",
            source:    "SHRM 2024",
            relevance: "Nexis AI flags at-risk employees before they resign",
        },
    },


    /* ─────────────────────────────────────────────────────────────
       HEALTHCARE
    ───────────────────────────────────────────────────────────── */
    "Healthcare": {
        accentColor: "#0ea5e9",
        accentGradient: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)",

        companyBanner: {
            headline: "{company} People Operations",
            subline:  "Keeping your care teams staffed, certified, and supported",
        },

        kpiCards: [
            {
                label:    "Staff On Shift Today",
                icon:     "Activity",
                valueKey: "mocked",
                mockValue: (emp) => String(Math.round(emp.length * 0.72)),
                color:    "#0ea5e9",
                trend:    "3 on planned leave",
                tooltip:  "Headcount currently clocked in across all wards/units",
            },
            {
                label:    "Certification Compliance",
                icon:     "ShieldCheck",
                valueKey: "mocked",
                mockValue: (_emp, co) => `${88 + (co.name.length % 10)}% compliant`,
                color:    "#10b981",
                trend:    "4 renewals due this month",
                tooltip:  "% of staff with all mandatory licenses current and valid",
            },
            {
                label:    "Leave Pending Approval",
                icon:     "Clock",
                valueKey: "leaveRequests.filter(pending).length",
                mockValue: null,
                color:    "#f59e0b",
                trend:    "Oldest: 3 days ago",
                tooltip:  "Unreviewed leave requests — delays impact shift planning",
            },
            {
                label:    "Overtime This Month",
                icon:     "Zap",
                valueKey: "mocked",
                mockValue: (emp) => `${Math.round(emp.length * 14.3)} hrs logged`,
                color:    "#ef4444",
                trend:    "+18% vs last month",
                tooltip:  "Total overtime hours logged — a burnout early-warning signal",
            },
        ],

        quickLinks: [
            {
                label:       "Leave Approvals",
                icon:        "Clock",
                page:        "leave_All_Leave_Requests",
                description: "Unreviewed requests affecting shift coverage",
            },
            {
                label:       "Certification Tracker",
                icon:        "ShieldCheck",
                page:        "skills_Skill_Library",
                description: "Expiring licenses and renewal reminders",
            },
            {
                label:       "Shift Calendar",
                icon:        "CalendarDays",
                page:        "timesheet_Calendar",
                description: "Full team schedule and coverage view",
            },
            {
                label:       "Compliance Report",
                icon:        "FileText",
                page:        "reports",
                description: "Regulatory and audit-ready summaries",
            },
        ],

        alertBanner: {
            message:  "Ward B is below minimum staffing ratio for the next 2 days",
            severity: "critical",
            icon:     "AlertOctagon",
        },

        secondaryPanel: "compliance",

        dashboardSections: {
            primaryChart:         "attendance",
            primaryChartLabel:    "Shift Coverage Today",
            showLeavePanel:       true,
            showPayrollPanel:     false,
            showSkillsPanel:      false,
            showCompliancePanel:  true,
        },

        emptyStateMessage: "Import your clinical staff to start tracking shifts and certifications.",

        industryInsight: {
            stat:      "Healthcare workers are 3× more likely to experience burnout than the average worker",
            source:    "WHO 2024",
            relevance: "Selfvora flags overtime patterns before burnout becomes attrition",
        },
    },


    /* ─────────────────────────────────────────────────────────────
       FINANCE
    ───────────────────────────────────────────────────────────── */
    "Finance": {
        accentColor: "#0f766e",
        accentGradient: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)",

        companyBanner: {
            headline: "{company} Human Capital",
            subline:  "Audit-ready. Compliant. Compensation-driven.",
        },

        kpiCards: [
            {
                label:    "Headcount",
                icon:     "Users",
                valueKey: "employees.length",
                mockValue: null,
                color:    "#0f766e",
                trend:    "2 open requisitions",
                tooltip:  "Total active employees across all entities",
            },
            {
                label:    "Payroll Accuracy",
                icon:     "CheckCircle",
                valueKey: "mocked",
                mockValue: (_emp, co) => `${96 + (co.name.length % 4)}.${(co.name.length * 3) % 10}% accurate`,
                color:    "#10b981",
                trend:    "Last run: 2 errors resolved",
                tooltip:  "% of payroll records processed without corrections",
            },
            {
                label:    "Compliance Items",
                icon:     "FileSearch",
                valueKey: "mocked",
                mockValue: (_emp, co) => `${1 + (co.name.length % 4)} open items`,
                color:    "#f59e0b",
                trend:    "2 due this week",
                tooltip:  "Regulatory tasks, audit findings, or policy acknowledgements pending",
            },
            {
                label:    "Avg Comp vs Market",
                icon:     "BarChart2",
                valueKey: "mocked",
                mockValue: (_emp, co) => `+${(2 + co.name.length % 5)}.${co.name.length % 9}% above median`,
                color:    "#6366f1",
                trend:    "Benchmarked last quarter",
                tooltip:  "How your total compensation compares to industry median",
            },
        ],

        quickLinks: [
            {
                label:       "Payroll Run",
                icon:        "DollarSign",
                page:        "payroll_Overview",
                description: "Process and reconcile current period",
            },
            {
                label:       "Permissions & Access",
                icon:        "ShieldCheck",
                page:        "permissions",
                description: "Role-based data access controls",
            },
            {
                label:       "Audit Reports",
                icon:        "FileText",
                page:        "reports",
                description: "Compliance-ready export packs",
            },
            {
                label:       "Payroll Settings",
                icon:        "BarChart2",
                page:        "payroll",
                description: "Payroll configuration and compliance",
            },
        ],

        alertBanner: {
            message:  "Quarterly payroll audit due in 8 days — 3 records flagged for review",
            severity: "warning",
            icon:     "FileWarning",
        },

        secondaryPanel: "reviews",

        dashboardSections: {
            primaryChart:         "payroll",
            primaryChartLabel:    "Payroll Cost by Department",
            showLeavePanel:       false,
            showPayrollPanel:     true,
            showSkillsPanel:      false,
            showCompliancePanel:  true,
        },

        emptyStateMessage: "Import your finance team to start tracking payroll accuracy and compliance.",

        industryInsight: {
            stat:      "Finance firms spend 22% more on compliance per employee than any other sector",
            source:    "Deloitte HR Survey 2024",
            relevance: "Selfvora's audit trail and permissions module is built for exactly this",
        },
    },


    /* ─────────────────────────────────────────────────────────────
       RETAIL
    ───────────────────────────────────────────────────────────── */
    "Retail": {
        accentColor: "#f97316",
        accentGradient: "linear-gradient(135deg, #f97316 0%, #fb923c 100%)",

        companyBanner: {
            headline: "{company} Store Operations",
            subline:  "Floor coverage, shift scheduling, and a team that stays",
        },

        kpiCards: [
            {
                label:    "Floor Staff Active",
                icon:     "UserCheck",
                valueKey: "mocked",
                mockValue: (emp) => String(Math.round(emp.length * 0.65)),
                color:    "#f97316",
                trend:    "Across all locations",
                tooltip:  "Staff currently on active shift across all store locations",
            },
            {
                label:    "Shift Coverage",
                icon:     "CalendarDays",
                valueKey: "mocked",
                mockValue: (_emp, co) => `${80 + (co.name.length % 15)}% this week`,
                color:    "#10b981",
                trend:    "2 unfilled slots tomorrow",
                tooltip:  "% of required shift slots filled for the current week",
            },
            {
                label:    "30-Day Turnover",
                icon:     "RefreshCw",
                valueKey: "mocked",
                mockValue: (emp) => `${Math.max(1, Math.round(emp.length * 0.26))} exits this month`,
                color:    "#ef4444",
                trend:    "Industry avg: 6.2%",
                tooltip:  "Headcount exits in the last 30 days — key retention signal",
            },
            {
                label:    "Leave Requests",
                icon:     "Inbox",
                valueKey: "leaveRequests.filter(pending).length",
                mockValue: null,
                color:    "#f59e0b",
                trend:    "Weekend coverage at risk",
                tooltip:  "Pending leave requests that may impact upcoming shift schedules",
            },
        ],

        quickLinks: [
            {
                label:       "Shift Calendar",
                icon:        "CalendarDays",
                page:        "timesheet_Calendar",
                description: "Weekly schedule and unfilled slots",
            },
            {
                label:       "Onboarding Tracker",
                icon:        "UserCheck",
                page:        "people_Onboarding",
                description: "New hires in progress this month",
            },
            {
                label:       "Leave Requests",
                icon:        "Clock",
                page:        "leave_All_Leave_Requests",
                description: "Approve or deny to protect coverage",
            },
            {
                label:       "Offboarding",
                icon:        "LogOut",
                page:        "people_Offboarding",
                description: "Exit checklist and knowledge handover",
            },
        ],

        alertBanner: {
            message:  "Weekend shift has 2 unfilled slots — approve leave with caution",
            severity: "warning",
            icon:     "AlertTriangle",
        },

        secondaryPanel: "turnover",

        dashboardSections: {
            primaryChart:         "attendance",
            primaryChartLabel:    "Floor Staff by Location",
            showLeavePanel:       true,
            showPayrollPanel:     false,
            showSkillsPanel:      false,
            showCompliancePanel:  false,
        },

        emptyStateMessage: "Import your store team to start tracking shifts and floor coverage.",

        industryInsight: {
            stat:      "Retail turnover costs an average of $3,500 per frontline employee replaced",
            source:    "SHRM Retail Report 2024",
            relevance: "Selfvora's onboarding tracker reduces time-to-productivity by 40%",
        },
    },


    /* ─────────────────────────────────────────────────────────────
       MANUFACTURING
    ───────────────────────────────────────────────────────────── */
    "Manufacturing": {
        accentColor: "#475569",
        accentGradient: "linear-gradient(135deg, #475569 0%, #64748b 100%)",

        companyBanner: {
            headline: "{company} Workforce Operations",
            subline:  "Safety, shifts, and production-ready teams",
        },

        kpiCards: [
            {
                label:    "Operators On-Site",
                icon:     "HardHat",
                valueKey: "mocked",
                mockValue: (emp) => String(Math.round(emp.length * 0.78)),
                color:    "#475569",
                trend:    "Day shift active",
                tooltip:  "Production floor headcount currently clocked in",
            },
            {
                label:    "Shift Compliance",
                icon:     "ClipboardCheck",
                valueKey: "mocked",
                mockValue: (_emp, co) => `${88 + (co.name.length % 10)}% on-schedule`,
                color:    "#10b981",
                trend:    "2 late arrivals today",
                tooltip:  "% of shift starts on time with correct operator-to-line ratios",
            },
            {
                label:    "Safety Incidents (MTD)",
                icon:     "ShieldAlert",
                valueKey: "mocked",
                mockValue: (_emp, co) => co.name.length % 3 === 0 ? "0 incidents" : "1 minor incident",
                color:    "#ef4444",
                trend:    "0 lost-time incidents",
                tooltip:  "Month-to-date safety events logged — near-misses and recordables",
            },
            {
                label:    "Overtime Hours (MTD)",
                icon:     "Clock",
                valueKey: "mocked",
                mockValue: (emp) => `${Math.round(emp.length * 20.8)} hrs`,
                color:    "#f59e0b",
                trend:    "+9% vs last month",
                tooltip:  "Total overtime logged this month — watch for fatigue risk",
            },
        ],

        quickLinks: [
            {
                label:       "Timesheet Records",
                icon:        "Clock",
                page:        "timesheet_All_Records",
                description: "Clock-in/out logs and corrections",
            },
            {
                label:       "Shift Scheduling",
                icon:        "CalendarDays",
                page:        "timesheet_Calendar",
                description: "Operator assignments across all lines",
            },
            {
                label:       "Leave Management",
                icon:        "Inbox",
                page:        "leave_All_Leave_Requests",
                description: "Requests affecting production capacity",
            },
            {
                label:       "Skills & Certification",
                icon:        "ShieldCheck",
                page:        "skills_Skill_Library",
                description: "Machine certifications and operator qualifications",
            },
        ],

        alertBanner: {
            message:  "Line 3 night shift is understaffed by 2 operators — check leave approvals",
            severity: "critical",
            icon:     "AlertOctagon",
        },

        secondaryPanel: "overtime",

        dashboardSections: {
            primaryChart:         "attendance",
            primaryChartLabel:    "Operator Attendance by Shift",
            showLeavePanel:       true,
            showPayrollPanel:     false,
            showSkillsPanel:      false,
            showCompliancePanel:  true,
        },

        emptyStateMessage: "Import your operators to start tracking shift compliance and safety.",

        industryInsight: {
            stat:      "Manufacturing loses $8.7B annually to unplanned absenteeism",
            source:    "OSHA Workforce Report 2024",
            relevance: "Selfvora's attendance heatmap surfaces absenteeism patterns in real time",
        },
    },
};
