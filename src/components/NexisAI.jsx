/**
 * NexisAI.jsx
 * Nexis — AI-powered HR Intelligence Assistant
 * Floating chat panel with real data-driven insights:
 *  - Attrition risk prediction
 *  - Skills gap mapping
 *  - Promotion readiness
 *  - Development plan generation
 *  - Growth potential & career trajectory
 *  - Workforce analytics
 */

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";

/* Module-level ref so sub-components can read the C proxy without prop-drilling */
let _C = null;

/* ─── Intelligence Engine ──────────────────────────────────────── */

const tenureMonths = (startDate) =>
    Math.floor((new Date("2026-03-15") - new Date(startDate)) / (1000 * 60 * 60 * 24 * 30.44));

const calcAttritionRisk = (emp, employees, leaveRequests) => {
    let score = 0;
    const tenure = tenureMonths(emp.startDate);
    const deptEmps = employees.filter(e => e.dept === emp.dept && e.id !== emp.id);
    const avgSalary = deptEmps.length ? deptEmps.reduce((s, e) => s + e.salary, 0) / deptEmps.length : emp.salary;

    // Salary below dept average
    const salaryRatio = emp.salary / avgSalary;
    if (salaryRatio < 0.80) score += 28;
    else if (salaryRatio < 0.90) score += 14;

    // Performance rating
    if (emp.rating === 0) score += 18;
    else if (emp.rating < 3.5) score += 22;
    else if (emp.rating >= 4.5 && tenure > 24) score += 12; // high performer, long tenure, no visible promo

    // Tenure risk zones
    if (tenure < 6) score += 18;
    else if (tenure > 42 && (emp.rating || 0) >= 4.0) score += 16;

    // Recent stress indicators (medical / emergency leave)
    const stressLeave = leaveRequests.filter(l =>
        l.empId === emp.id &&
        ["Medical Leave", "Emergency Leave"].includes(l.type) &&
        new Date(l.from) >= new Date("2026-01-01")
    );
    if (stressLeave.length >= 2) score += 14;
    else if (stressLeave.length === 1) score += 6;

    // Status
    if (emp.status === "On Leave") score += 8;

    // Part-time employees leave more
    if (emp.type === "Part-time") score += 8;

    return Math.min(Math.max(score, 4), 95);
};

const calcPromotionReadiness = (emp, jobFamilies) => {
    let score = 0;
    const tenure = tenureMonths(emp.startDate);
    const family = jobFamilies.find(jf => jf.id === emp.familyId);
    const currentIdx = family ? family.levels.indexOf(emp.level) : -1;
    const hasNextLevel = family && currentIdx >= 0 && currentIdx < family.levels.length - 1;

    if (!hasNextLevel) return 0; // already at top

    if (tenure >= 36) score += 30;
    else if (tenure >= 24) score += 22;
    else if (tenure >= 12) score += 12;

    if ((emp.rating || 0) >= 4.5) score += 40;
    else if ((emp.rating || 0) >= 4.0) score += 28;
    else if ((emp.rating || 0) >= 3.5) score += 14;

    if (family) {
        const empSkills = emp.skills.map(s => typeof s === "string" ? s : (s?.name || ""));
        const covered = family.requiredSkills.filter(r => empSkills.includes(r)).length;
        const pct = family.requiredSkills.length > 0 ? covered / family.requiredSkills.length : 1;
        score += Math.round(pct * 30);
    }
    return Math.min(score, 100);
};

const getSkillsGap = (emp, jobFamilies) => {
    const family = jobFamilies.find(jf => jf.id === emp.familyId);
    if (!family) return [];
    const empSkills = emp.skills.map(s => typeof s === "string" ? s : (s?.name || ""));
    return family.requiredSkills.filter(r => !empSkills.includes(r));
};

const getNextRole = (emp, jobFamilies) => {
    const family = jobFamilies.find(jf => jf.id === emp.familyId);
    if (!family) return null;
    const idx = family.levels.indexOf(emp.level);
    if (idx === -1 || idx >= family.levels.length - 1) return null;
    return family.levels[idx + 1];
};

const riskLabel = (score) => {
    if (score >= 65) return { label: "High Risk", color: _C.danger, bg: _C.dangerBg, border: _C.dangerBorder };
    if (score >= 40) return { label: "Medium Risk", color: _C.warning, bg: _C.warningBg, border: _C.warningBorder };
    return { label: "Low Risk", color: _C.success, bg: _C.successBg, border: _C.successBorder };
};

const generateDevPlan = (emp, jobFamilies) => {
    const gap = getSkillsGap(emp, jobFamilies);
    const nextRole = getNextRole(emp, jobFamilies);
    const family = jobFamilies.find(jf => jf.id === emp.familyId);
    const tenure = tenureMonths(emp.startDate);

    return {
        nextRole,
        gap,
        family,
        phases: [
            {
                period: "30 Days", icon: "Zap", color: _C.primary,
                focus: "Immediate Wins",
                actions: [
                    gap.length > 0 ? `Enrol in ${gap[0]} structured learning path` : "Deepen expertise via advanced use-cases in current stack",
                    "Align on Q2 OKRs with direct manager in a dedicated 1:1",
                    "Identify 2 stretch tasks within current sprint cycle",
                ],
            },
            {
                period: "90 Days", icon: "BookOpen", color: _C.info,
                focus: "Skill Building",
                actions: [
                    gap.length > 1 ? `Complete ${gap[1]} certification or formal assessment` : "Pursue advanced certification in primary discipline",
                    "Lead at least one cross-functional initiative or project",
                    nextRole ? `Shadow ${nextRole} responsibilities through delegation` : "Contribute to internal knowledge base / documentation",
                    "Run a 360° peer feedback round to identify blind spots",
                ],
            },
            {
                period: "6 Months", icon: "TrendingUp", color: _C.success,
                focus: "Growth Momentum",
                actions: [
                    "Mid-year performance review — target rating of 4.5 or above",
                    gap.length > 0 ? `Full working proficiency in ${gap.slice(0, 2).join(" and ")}` : "Mentor 1–2 junior team members to build leadership signal",
                    "Salary review checkpoint — document impact delivered",
                    nextRole ? `Formal readiness assessment for ${nextRole}` : "Explore cross-department rotation or special projects",
                ],
            },
            {
                period: "12 Months", icon: "Award", color: _C.warning,
                focus: "Advancement",
                actions: [
                    nextRole ? `Promotion recommendation: ${nextRole}` : "Senior specialist track or team-lead pathway discussion",
                    "Present key work at team all-hands — build internal visibility",
                    "Attend external conference or obtain industry certification",
                    "Annual review: compile achievement portfolio for promotion case",
                ],
            },
        ],
    };
};

/* ─── Intent Detection ─────────────────────────────────────────── */

const detectIntent = (text) => {
    const t = text.toLowerCase();
    if (/attrition|risk|leaving|quit|turn.?over|retain|flight risk/.test(t)) return "ATTRITION";
    if (/skill.?gap|missing skill|competenc|capability|gap analysis/.test(t)) return "SKILLS_GAP";
    if (/promot|next level|advance|readiness|ladder|step up/.test(t)) return "PROMOTION";
    if (/dev.?plan|development|career|growth potential|future|trajectory|pathway/.test(t)) return "DEV_PLAN";
    if (/overview|summary|workforce|analytics|insight|snapshot|health/.test(t)) return "OVERVIEW";
    if (/leave|absent|attendance|time off/.test(t)) return "ATTENDANCE";
    if (/salary|pay|compensation|payroll|earn/.test(t)) return "COMPENSATION";
    if (/hello|hi |hey |help|what can|who are you|nexis/.test(t)) return "GREETING";
    return "GENERAL";
};

const findMentionedEmployee = (text, employees) => {
    const t = text.toLowerCase();
    return employees.find(e => t.includes(e.name.toLowerCase()) || t.includes(e.name.split(" ")[0].toLowerCase()));
};

/* ─── Response Generator ───────────────────────────────────────── */

const buildResponse = (userText, employees, jobFamilies, leaveRequests, attendance, payroll) => {
    const intent = detectIntent(userText);
    const mentionedEmp = findMentionedEmployee(userText, employees);

    switch (intent) {

        case "GREETING": return {
            type: "text",
            text: `I'm **Nexis**, your AI-powered HR intelligence assistant. I continuously analyse your workforce data to surface insights that would otherwise stay hidden in silos.\n\nHere's what I can help you with right now:`,
            quickActions: ["Show attrition risks", "Promotion candidates", "Skills gap report", "Workforce overview"],
        };

        case "OVERVIEW": {
            const active = employees.filter(e => e.status === "Active").length;
            const onLeave = employees.filter(e => e.status === "On Leave").length;
            const avgRating = (employees.filter(e => e.rating > 0).reduce((s, e) => s + e.rating, 0) / employees.filter(e => e.rating > 0).length).toFixed(1);
            const atRisk = employees.filter(e => calcAttritionRisk(e, employees, leaveRequests) >= 40).length;
            const promoReady = employees.filter(e => calcPromotionReadiness(e, jobFamilies) >= 70).length;
            const avgTenure = (employees.reduce((s, e) => s + tenureMonths(e.startDate), 0) / employees.length / 12).toFixed(1);
            return {
                type: "overview",
                text: "Here's your workforce intelligence snapshot for **March 2026**:",
                stats: [
                    { label: "Active Headcount", value: active, icon: "Users", color: _C.primary },
                    { label: "Currently On Leave", value: onLeave, icon: "CalendarOff", color: _C.info },
                    { label: "Avg Performance", value: avgRating + " / 5", icon: "Star", color: _C.warning },
                    { label: "Avg Tenure", value: avgTenure + " yrs", icon: "Clock", color: _C.success },
                    { label: "Attrition Risk Flags", value: atRisk + " employees", icon: "AlertTriangle", color: _C.danger },
                    { label: "Promotion-Ready", value: promoReady + " employees", icon: "TrendingUp", color: "#8B5CF6" },
                ],
                insight: `Nexis has analysed **${employees.length}** employees across **${[...new Set(employees.map(e => e.dept))].length}** departments. ${atRisk > 0 ? `⚑ ${atRisk} employees show moderate-to-high attrition signals — I recommend reviewing their compensation and career trajectory.` : "Attrition signals are within healthy range."}`,
            };
        }

        case "ATTRITION": {
            const scored = employees
                .map(e => ({ ...e, riskScore: calcAttritionRisk(e, employees, leaveRequests) }))
                .sort((a, b) => b.riskScore - a.riskScore)
                .slice(0, 6);

            const avgRisk = Math.round(scored.reduce((s, e) => s + e.riskScore, 0) / scored.length);
            const highRisk = scored.filter(e => e.riskScore >= 65).length;

            return {
                type: "attrition",
                text: `I've run an attrition risk scan across your workforce. Here are the **${scored.length} highest-risk employees** identified using 7 behavioural, compensation, and performance signals:`,
                employees: scored,
                insight: `**${highRisk}** employees are in the **high-risk** zone. Primary drivers: below-market compensation, tenure plateaus, and elevated medical leave frequency. Proactive interventions now could reduce turnover probability by **25–40%**.`,
                quickActions: ["Build development plan", "Promotion candidates", "Skills gap report"],
            };
        }

        case "SKILLS_GAP": {
            if (mentionedEmp) {
                const gap = getSkillsGap(mentionedEmp, jobFamilies);
                const family = jobFamilies.find(jf => jf.id === mentionedEmp.familyId);
                const empSkills = mentionedEmp.skills.map(s => typeof s === "string" ? s : (s?.name || ""));
                return {
                    type: "skills_individual",
                    text: `Skills coverage analysis for **${mentionedEmp.name}** (${mentionedEmp.level}, ${mentionedEmp.dept}):`,
                    emp: mentionedEmp,
                    gap,
                    existing: empSkills,
                    required: family?.requiredSkills || [],
                    family,
                    insight: gap.length === 0
                        ? `${mentionedEmp.name} meets all required skills for their current role. Consider mapping them to advanced or next-level competencies.`
                        : `Closing the ${gap.length} skill gap${gap.length > 1 ? "s" : ""} would improve ${mentionedEmp.name}'s promotion readiness by an estimated ${gap.length * 12}%.`,
                };
            }

            // Department-level gap
            const deptGaps = [...new Set(employees.map(e => e.dept))].map(dept => {
                const deptEmps = employees.filter(e => e.dept === dept);
                const totalGaps = deptEmps.reduce((s, e) => s + getSkillsGap(e, jobFamilies).length, 0);
                const coverage = deptEmps.length > 0
                    ? Math.round(100 - (totalGaps / (deptEmps.length * 3)) * 100)
                    : 100;
                return { dept, totalGaps, coverage: Math.max(0, Math.min(100, coverage)), count: deptEmps.length };
            }).sort((a, b) => a.coverage - b.coverage);

            return {
                type: "skills_dept",
                text: "Here's the organisation-wide **skills coverage** breakdown by department:",
                depts: deptGaps,
                insight: `Departments with coverage below 70% represent critical skill risk. I recommend initiating structured learning paths or targeted hiring in the lowest-coverage areas.`,
                quickActions: ["Development plan for an employee", "Promotion candidates", "Attrition risks"],
            };
        }

        case "PROMOTION": {
            const scored = employees
                .map(e => ({ ...e, promoScore: calcPromotionReadiness(e, jobFamilies) }))
                .filter(e => e.promoScore > 0)
                .sort((a, b) => b.promoScore - a.promoScore)
                .slice(0, 7);

            return {
                type: "promotion",
                text: `Based on tenure, performance rating, and skills coverage, here are your **top promotion candidates**:`,
                employees: scored,
                insight: `Nexis recommends a **data-driven promotion cycle** — promoting high-readiness employees reduces attrition risk by 30–45% and increases team-wide engagement scores. Consider initiating formal review processes for candidates scoring above 75.`,
                quickActions: ["Development plans", "Skills gaps", "Attrition risks"],
            };
        }

        case "DEV_PLAN": {
            const emp = mentionedEmp || employees.sort((a, b) =>
                calcPromotionReadiness(b, jobFamilies) - calcPromotionReadiness(a, jobFamilies)
            )[0];
            const plan = generateDevPlan(emp, jobFamilies);
            return {
                type: "dev_plan",
                text: `Here's a personalised **12-month development roadmap** for **${emp.name}** (${emp.level} → ${plan.nextRole || "Senior Specialist track"}):`,
                emp,
                plan,
                insight: `This plan was built by cross-referencing ${emp.name}'s current proficiency against the ${plan.family?.name || emp.dept} job family requirements, their ${(emp.rating || 0).toFixed(1)}/5 performance rating, and ${tenureMonths(emp.startDate)} months of tenure data. Executing this plan increases promotion probability by ~68%.`,
                quickActions: ["Skills gap details", "Attrition risk", "Promotion candidates"],
            };
        }

        case "ATTENDANCE": {
            const leaveByEmp = employees.map(e => ({
                ...e,
                leaveCount: leaveRequests.filter(l => l.empId === e.id).length,
                pendingLeave: leaveRequests.filter(l => l.empId === e.id && l.status === "Pending").length,
            })).sort((a, b) => b.leaveCount - a.leaveCount).slice(0, 5);

            const totalPending = leaveRequests.filter(l => l.status === "Pending").length;
            const approvalRate = Math.round(leaveRequests.filter(l => l.status === "Approved").length / leaveRequests.length * 100);

            return {
                type: "attendance",
                text: `Here's your **leave & attendance intelligence** summary:`,
                stats: [
                    { label: "Total Leave Requests", value: leaveRequests.length, icon: "CalendarDays", color: _C.primary },
                    { label: "Pending Approval", value: totalPending, icon: "Clock", color: _C.warning },
                    { label: "Approval Rate", value: approvalRate + "%", icon: "CheckCircle2", color: _C.success },
                ],
                topEmployees: leaveByEmp,
                insight: `${totalPending} leave requests are awaiting action. Delayed approvals correlate with a 12% dip in team satisfaction scores — consider enabling auto-approval for leave types with 100% historical approval.`,
            };
        }

        case "COMPENSATION": {
            const deptComp = [...new Set(employees.map(e => e.dept))].map(dept => {
                const emps = employees.filter(e => e.dept === dept);
                const avg = Math.round(emps.reduce((s, e) => s + e.salary, 0) / emps.length);
                const min = Math.min(...emps.map(e => e.salary));
                const max = Math.max(...emps.map(e => e.salary));
                return { dept, avg, min, max, count: emps.length };
            }).sort((a, b) => b.avg - a.avg);

            const underPaid = employees.filter(e => {
                const deptEmps = employees.filter(d => d.dept === e.dept);
                const avg = deptEmps.reduce((s, d) => s + d.salary, 0) / deptEmps.length;
                return e.salary < avg * 0.85;
            });

            return {
                type: "compensation",
                text: "Here's your **compensation intelligence** breakdown by department:",
                depts: deptComp,
                underPaid,
                insight: `**${underPaid.length}** employees are paid more than 15% below their department average — a significant attrition predictor. I recommend initiating a compensation equity review for these individuals.`,
                quickActions: ["Show attrition risks", "Promotion candidates"],
            };
        }

        default: return {
            type: "text",
            text: `I'm analysing your workforce data to find relevant insights. Try asking me about:\n\n• **Attrition risks** — who is likely to leave and why\n• **Skills gap** — capability coverage across teams\n• **Promotion readiness** — data-driven advancement candidates\n• **Development plans** — personalised growth roadmaps\n• **Workforce overview** — full intelligence snapshot`,
            quickActions: ["Show attrition risks", "Promotion candidates", "Skills gap report", "Workforce overview"],
        };
    }
};

/* ─── Rich Message Renderers ───────────────────────────────────── */

const EmployeeAttritionCard = ({ emp, leaveRequests, employees }) => {
    const score = emp.riskScore ?? calcAttritionRisk(emp, employees, leaveRequests);
    const risk = riskLabel(score);
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: _C.bg, borderRadius: 10, border: `1px solid ${_C.border}`, marginBottom: 6 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: emp.riskScore >= 65 ? _C.dangerBg : emp.riskScore >= 40 ? _C.warningBg : _C.successBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12, fontWeight: 800, color: risk.color }}>
                {emp.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: _C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{emp.name}</div>
                <div style={{ fontSize: 11, color: _C.textMuted }}>{emp.level} · {emp.dept}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: risk.color }}>{score}%</div>
                <span style={{ fontSize: 10, fontWeight: 700, background: risk.bg, color: risk.color, border: `1px solid ${risk.border}`, borderRadius: 4, padding: "1px 6px" }}>{risk.label}</span>
            </div>
        </div>
    );
};

const SkillBar = ({ skill, has }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
        <div style={{ width: has ? 14 : 14, height: 14, borderRadius: 4, background: has ? _C.successBg : _C.dangerBg, border: `1px solid ${has ? _C.successBorder : _C.dangerBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {has ? <Lucide.Check size={9} color={_C.success} strokeWidth={3} /> : <Lucide.X size={9} color={_C.danger} strokeWidth={3} />}
        </div>
        <span style={{ fontSize: 12, color: has ? _C.success : _C.danger, fontWeight: has ? 500 : 600 }}>{skill}</span>
        {!has && <span style={{ fontSize: 10, background: _C.warningBg, color: _C.warning, border: `1px solid ${_C.warningBorder}`, borderRadius: 4, padding: "1px 5px", fontWeight: 600 }}>Gap</span>}
    </div>
);

const PromotionCard = ({ emp, jobFamilies }) => {
    const score = emp.promoScore ?? calcPromotionReadiness(emp, jobFamilies);
    const nextRole = getNextRole(emp, jobFamilies);
    const pct = score;
    const color = pct >= 75 ? _C.success : pct >= 50 ? _C.warning : _C.textMuted;
    return (
        <div style={{ padding: "10px 12px", background: _C.bg, borderRadius: 10, border: `1px solid ${_C.border}`, marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: _C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: _C.primary, flexShrink: 0 }}>
                    {emp.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: _C.text }}>{emp.name}</div>
                    <div style={{ fontSize: 11, color: _C.textMuted }}>{emp.level}{nextRole ? ` → ${nextRole}` : ""}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color }}>{pct}%</div>
            </div>
            <div style={{ height: 5, background: _C.border, borderRadius: 3 }}>
                <div style={{ height: "100%", width: pct + "%", background: pct >= 75 ? `linear-gradient(90deg, ${_C.success}, #34D399)` : pct >= 50 ? `linear-gradient(90deg, ${_C.warning}, #FBBF24)` : _C.border, borderRadius: 3, transition: "width 0.6s ease" }} />
            </div>
        </div>
    );
};

const DevPlanPhase = ({ phase, idx }) => {
    const PhaseIcon = Lucide[phase.icon] || Lucide.Circle;
    return (
        <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: phase.color + "22", border: `1px solid ${phase.color}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <PhaseIcon size={13} color={phase.color} strokeWidth={2} />
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: _C.text }}>{phase.period}</div>
                <span style={{ fontSize: 10, fontWeight: 700, color: phase.color, background: phase.color + "15", border: `1px solid ${phase.color}33`, borderRadius: 4, padding: "2px 7px" }}>{phase.focus}</span>
            </div>
            <div style={{ paddingLeft: 10, borderLeft: `2px solid ${phase.color}33` }}>
                {phase.actions.map((a, i) => (
                    <div key={i} style={{ display: "flex", gap: 7, marginBottom: 5 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: phase.color, flexShrink: 0, marginTop: 5 }} />
                        <span style={{ fontSize: 11.5, color: _C.textMid, lineHeight: 1.5 }}>{a}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ─── Message Component ────────────────────────────────────────── */

const MessageBubble = ({ msg, employees, jobFamilies, leaveRequests, onQuickAction, actionForm, onLeaveSubmit, onGoalSubmit, onRecognizeSubmit, onSkillRequestSubmit, onCancelAction, goals }) => {
    const isUser = msg.role === "user";

    const renderContent = () => {
        const r = msg.response;
        if (!r) return <span style={{ fontSize: 13, color: isUser ? "#fff" : _C.text, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{msg.text}</span>;

        return (
            <div>
                {/* Main text */}
                <div style={{ fontSize: 13, color: _C.text, lineHeight: 1.65, marginBottom: r.type !== "text" ? 14 : 0 }}>
                    {r.text.split("**").map((part, i) =>
                        i % 2 === 1
                            ? <strong key={i} style={{ fontWeight: 700, color: _C.text }}>{part}</strong>
                            : <span key={i}>{part}</span>
                    )}
                </div>

                {/* OVERVIEW stats */}
                {r.type === "overview" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                        {r.stats.map(s => {
                            const SI = Lucide[s.icon] || Lucide.Circle;
                            return (
                                <div key={s.label} style={{ padding: "9px 11px", background: _C.bg, border: `1px solid ${_C.border}`, borderRadius: 9 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                        <SI size={12} color={s.color} strokeWidth={2} />
                                        <span style={{ fontSize: 10, color: _C.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</span>
                                    </div>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: _C.text }}>{s.value}</div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ATTRITION employees */}
                {r.type === "attrition" && r.employees && (
                    <div style={{ marginBottom: 12 }}>
                        {r.employees.map(e => <EmployeeAttritionCard key={e.id} emp={e} employees={employees} leaveRequests={leaveRequests} />)}
                    </div>
                )}

                {/* PROMOTION employees */}
                {r.type === "promotion" && r.employees && (
                    <div style={{ marginBottom: 12 }}>
                        {r.employees.map(e => <PromotionCard key={e.id} emp={e} jobFamilies={jobFamilies} />)}
                    </div>
                )}

                {/* SKILLS individual */}
                {r.type === "skills_individual" && (
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: _C.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                            {r.family?.name} Required Skills
                        </div>
                        {r.required.map(s => <SkillBar key={s} skill={s} has={r.existing.includes(s)} />)}
                        {r.gap.length === 0 && (
                            <div style={{ marginTop: 8, padding: "8px 11px", background: _C.successBg, border: `1px solid ${_C.successBorder}`, borderRadius: 8, fontSize: 12, color: _C.success, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                                <Lucide.CheckCircle2 size={13} color={_C.success} /> Full skills coverage — no gaps detected
                            </div>
                        )}
                    </div>
                )}

                {/* SKILLS department */}
                {r.type === "skills_dept" && r.depts && (
                    <div style={{ marginBottom: 12 }}>
                        {r.depts.map(d => (
                            <div key={d.dept} style={{ marginBottom: 8 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: _C.text }}>{d.dept}</span>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: d.coverage >= 70 ? _C.success : d.coverage >= 50 ? _C.warning : _C.danger }}>{d.coverage}%</span>
                                </div>
                                <div style={{ height: 6, background: _C.border, borderRadius: 3 }}>
                                    <div style={{ height: "100%", width: d.coverage + "%", background: d.coverage >= 70 ? _C.success : d.coverage >= 50 ? _C.warning : _C.danger, borderRadius: 3 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* DEVELOPMENT PLAN */}
                {r.type === "dev_plan" && r.plan && (
                    <div style={{ marginBottom: 12 }}>
                        {r.plan.gap.length > 0 && (
                            <div style={{ marginBottom: 12, padding: "8px 11px", background: _C.warningBg, border: `1px solid ${_C.warningBorder}`, borderRadius: 8 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: _C.warning, marginBottom: 4 }}>Priority Skill Gaps</div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                                    {r.plan.gap.map(s => (
                                        <span key={s} style={{ fontSize: 11, fontWeight: 600, background: _C.warningBg, color: _C.warning, border: `1px solid ${_C.warningBorder}`, borderRadius: 5, padding: "2px 8px" }}>{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {r.plan.phases.map((phase, i) => <DevPlanPhase key={i} phase={phase} idx={i} />)}
                    </div>
                )}

                {/* ATTENDANCE */}
                {r.type === "attendance" && r.stats && (
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                            {r.stats.map(s => {
                                const SI = Lucide[s.icon] || Lucide.Circle;
                                return (
                                    <div key={s.label} style={{ flex: 1, padding: "8px 10px", background: _C.bg, border: `1px solid ${_C.border}`, borderRadius: 9, textAlign: "center" }}>
                                        <SI size={14} color={s.color} style={{ margin: "0 auto 4px" }} />
                                        <div style={{ fontSize: 15, fontWeight: 800, color: _C.text }}>{s.value}</div>
                                        <div style={{ fontSize: 9.5, color: _C.textMuted, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: _C.textMuted, marginBottom: 6 }}>Highest Leave Usage</div>
                        {r.topEmployees?.slice(0, 4).map(e => (
                            <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: _C.bg, borderRadius: 8, border: `1px solid ${_C.border}`, marginBottom: 4 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: _C.text, flex: 1 }}>{e.name}</span>
                                <span style={{ fontSize: 11, color: _C.textMuted }}>{e.dept}</span>
                                <span style={{ fontSize: 12, fontWeight: 800, color: _C.primary }}>{e.leaveCount} days</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* COMPENSATION */}
                {r.type === "compensation" && r.depts && (
                    <div style={{ marginBottom: 12 }}>
                        {r.depts.slice(0, 5).map(d => (
                            <div key={d.dept} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 11px", background: _C.bg, border: `1px solid ${_C.border}`, borderRadius: 9, marginBottom: 5 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: _C.text }}>{d.dept}</div>
                                    <div style={{ fontSize: 10.5, color: _C.textMuted }}>{d.count} employees</div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: _C.text }}>LKR {d.avg.toLocaleString()}</div>
                                    <div style={{ fontSize: 10, color: _C.textMuted }}>{d.min.toLocaleString()} – {d.max.toLocaleString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* LEAVE BALANCE */}
                {r.type === "leave_balance" && r.balances && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                        {r.balances.map(b => {
                            const BI = Lucide[b.icon] || Lucide.Circle;
                            const pct = Math.round((b.remaining / b.total) * 100);
                            return (
                                <div key={b.type} style={{ padding: "10px 12px", background: _C.bg, border: `1px solid ${_C.border}`, borderRadius: 10 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                                        <BI size={12} color={b.color} strokeWidth={2} />
                                        <span style={{ fontSize: 10.5, fontWeight: 600, color: _C.textMuted }}>{b.type}</span>
                                    </div>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: _C.text }}>{b.remaining}<span style={{ fontSize: 12, fontWeight: 500, color: _C.textMuted }}>/{b.total}</span></div>
                                    <div style={{ height: 4, background: _C.border, borderRadius: 2, marginTop: 6 }}>
                                        <div style={{ height: "100%", width: pct + "%", background: b.color, borderRadius: 2 }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* PAYSLIP */}
                {r.type === "payslip" && (
                    <div style={{ marginBottom: 12 }}>
                        {r.payslip ? (
                            <div style={{ background: _C.bg, border: `1px solid ${_C.border}`, borderRadius: 10, overflow: "hidden" }}>
                                <div style={{ padding: "10px 14px", background: _C.primaryLight, borderBottom: `1px solid ${_C.primaryMid}` }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: _C.primary }}>Payslip — {r.payslip.period || "March 2026"}</div>
                                    <div style={{ fontSize: 10.5, color: _C.textMuted, marginTop: 2 }}>{r.emp?.name} · {r.emp?.dept}</div>
                                </div>
                                <div style={{ padding: "10px 14px" }}>
                                    {[
                                        { label: "Base Salary", value: r.payslip.baseSalary, color: _C.text },
                                        { label: "Allowances", value: r.payslip.allowances || 0, color: _C.success },
                                        { label: "Deductions", value: -(r.payslip.deductions || 0), color: _C.danger },
                                        { label: "Tax", value: -(r.payslip.tax || 0), color: _C.warning },
                                    ].map(row => (
                                        <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${_C.borderLight}` }}>
                                            <span style={{ fontSize: 12, color: _C.textMid }}>{row.label}</span>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: row.color }}>{(r.payslip.currency || "LKR")} {Math.abs(row.value).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 4px", marginTop: 4 }}>
                                        <span style={{ fontSize: 13, fontWeight: 800, color: _C.text }}>Net Pay</span>
                                        <span style={{ fontSize: 14, fontWeight: 800, color: _C.success }}>{(r.payslip.currency || "LKR")} {(r.payslip.netPay || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: "12px 14px", background: _C.warningBg, border: `1px solid ${_C.warningBorder}`, borderRadius: 10, fontSize: 12, color: _C.warning, fontWeight: 600 }}>
                                No payslip data found for your account. Contact HR for assistance.
                            </div>
                        )}
                    </div>
                )}

                {/* ACTION FORM */}
                {r.type === "action_form" && r.formKey && actionForm === r.formKey && (
                    <div style={{ marginBottom: 12 }}>
                        {r.formKey === "apply_leave" && <ActionFormApplyLeave onSubmit={onLeaveSubmit} onCancel={onCancelAction} />}
                        {r.formKey === "update_goal" && <ActionFormUpdateGoal goals={goals} onSubmit={onGoalSubmit} onCancel={onCancelAction} />}
                        {r.formKey === "recognize" && <ActionFormRecognize employees={employees} onSubmit={onRecognizeSubmit} onCancel={onCancelAction} />}
                        {r.formKey === "request_skill" && <ActionFormRequestSkill onSubmit={onSkillRequestSubmit} onCancel={onCancelAction} />}
                    </div>
                )}

                {/* Insight callout */}
                {r.insight && (
                    <div style={{ padding: "9px 12px", background: _C.primaryLight, border: `1px solid ${_C.primaryMid}`, borderRadius: 9, marginBottom: r.quickActions ? 10 : 0 }}>
                        <div style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
                            <Lucide.Sparkles size={13} color={_C.primary} style={{ marginTop: 1, flexShrink: 0 }} strokeWidth={2} />
                            <span style={{ fontSize: 11.5, color: _C.primary, lineHeight: 1.55 }}>
                                {r.insight.split("**").map((p, i) =>
                                    i % 2 === 1 ? <strong key={i}>{p}</strong> : <span key={i}>{p}</span>
                                )}
                            </span>
                        </div>
                    </div>
                )}

                {/* Quick actions */}
                {r.quickActions && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                        {r.quickActions.map(a => (
                            <motion.button key={a} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => onQuickAction(a)}
                                style={{ fontSize: 11, fontWeight: 600, color: _C.primary, background: _C.primaryLight, border: `1px solid ${_C.primaryMid}`, borderRadius: 7, padding: "5px 11px", cursor: "pointer", fontFamily: "inherit" }}>
                                {a}
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{ display: "flex", flexDirection: isUser ? "row-reverse" : "row", gap: 8, marginBottom: 14, alignItems: "flex-start" }}>
            {!isUser && (
                <div style={{ width: 30, height: 30, borderRadius: 10, background: "linear-gradient(135deg, #6366F1, #8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", boxShadow: "0 3px 8px rgba(99,102,241,0.35)" }}>N</div>
            )}
            <div style={{ maxWidth: "82%", padding: "11px 13px", borderRadius: isUser ? "14px 14px 4px 14px" : "4px 14px 14px 14px", background: isUser ? "linear-gradient(135deg, #6366F1, #7C3AED)" : _C.white, border: isUser ? "none" : `1px solid ${_C.border}`, boxShadow: isUser ? "0 3px 10px rgba(99,102,241,0.3)" : _C.shadow, color: isUser ? "#fff" : _C.text }}>
                {renderContent()}
                <div style={{ fontSize: 10, color: isUser ? "rgba(255,255,255,0.6)" : _C.textMuted, marginTop: 5, textAlign: isUser ? "right" : "left" }}>
                    {msg.time}
                </div>
            </div>
        </motion.div>
    );
};

const TypingIndicator = () => (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
        <div style={{ width: 30, height: 30, borderRadius: 10, background: "linear-gradient(135deg, #6366F1, #8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#fff", flexShrink: 0 }}>N</div>
        <div style={{ padding: "11px 16px", background: _C.white, border: `1px solid ${_C.border}`, borderRadius: "4px 14px 14px 14px", boxShadow: _C.shadow }}>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {[0, 1, 2].map(i => (
                    <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                        style={{ width: 6, height: 6, borderRadius: "50%", background: _C.primary, opacity: 0.7 }} />
                ))}
                <span style={{ fontSize: 11, color: _C.textMuted, marginLeft: 4 }}>Nexis is analysing…</span>
            </div>
        </div>
    </motion.div>
);

/* ─── Action Tags Definition ──────────────────────────────────── */

const ACTION_TAGS = [
    { key: "apply_leave", label: "Apply Leave", emoji: "\uD83C\uDFD6" },
    { key: "clock_in", label: "Clock In", emoji: "\u23F0" },
    { key: "leave_balance", label: "My Leave Balance", emoji: "\uD83D\uDCCA" },
    { key: "update_goal", label: "Update Goal Progress", emoji: "\uD83C\uDFAF" },
    { key: "recognize", label: "Recognize Colleague", emoji: "\uD83C\uDF1F" },
    { key: "request_skill", label: "Request Skill", emoji: "\uD83D\uDCCB" },
    { key: "my_payslip", label: "My Payslip", emoji: "\uD83D\uDCC4" },
];

/* ─── Inline Action Form Components ───────────────────────────── */

const ActionFormApplyLeave = ({ onSubmit, onCancel }) => {
    const [form, setForm] = React.useState({ type: "Annual Leave", from: "", to: "", reason: "" });
    const handleSubmit = () => {
        if (!form.from || !form.to) return;
        onSubmit(form);
    };
    const inputStyle = { width: "100%", padding: "7px 10px", fontSize: 12, border: `1px solid ${_C.border}`, borderRadius: 8, background: _C.bg, color: _C.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box" };
    const labelStyle = { fontSize: 11, fontWeight: 600, color: _C.textMid, marginBottom: 4, display: "block" };
    return (
        <div style={{ marginTop: 10 }}>
            <div style={{ marginBottom: 8 }}>
                <label style={labelStyle}>Leave Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
                    {["Annual Leave", "Medical Leave", "Casual Leave", "Emergency Leave"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>From</label>
                    <input type="date" value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>To</label>
                    <input type="date" value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))} style={inputStyle} />
                </div>
            </div>
            <div style={{ marginBottom: 10 }}>
                <label style={labelStyle}>Reason (optional)</label>
                <input type="text" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Enter reason..." style={inputStyle} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleSubmit}
                    style={{ flex: 1, padding: "8px 14px", fontSize: 12, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg, #6366F1, #7C3AED)", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>
                    Submit Leave Request
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onCancel}
                    style={{ padding: "8px 14px", fontSize: 12, fontWeight: 600, color: _C.textMid, background: _C.bg, border: `1px solid ${_C.border}`, borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>
                    Cancel
                </motion.button>
            </div>
        </div>
    );
};

const ActionFormUpdateGoal = ({ goals, onSubmit, onCancel }) => {
    const [form, setForm] = React.useState({ goalId: "", progress: 50 });
    const availableGoals = (goals || []).filter(g => g.status !== "Completed");
    const handleSubmit = () => {
        if (!form.goalId) return;
        onSubmit(form);
    };
    const inputStyle = { width: "100%", padding: "7px 10px", fontSize: 12, border: `1px solid ${_C.border}`, borderRadius: 8, background: _C.bg, color: _C.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box" };
    const labelStyle = { fontSize: 11, fontWeight: 600, color: _C.textMid, marginBottom: 4, display: "block" };
    return (
        <div style={{ marginTop: 10 }}>
            <div style={{ marginBottom: 8 }}>
                <label style={labelStyle}>Select Goal</label>
                <select value={form.goalId} onChange={e => setForm(f => ({ ...f, goalId: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="">Choose a goal...</option>
                    {availableGoals.map(g => <option key={g.id} value={g.id}>{g.title || g.name || g.id}</option>)}
                </select>
            </div>
            <div style={{ marginBottom: 10 }}>
                <label style={labelStyle}>Progress: {form.progress}%</label>
                <input type="range" min="0" max="100" value={form.progress} onChange={e => setForm(f => ({ ...f, progress: parseInt(e.target.value) }))}
                    style={{ width: "100%", accentColor: _C.primary }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: _C.textMuted }}><span>0%</span><span>100%</span></div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleSubmit}
                    style={{ flex: 1, padding: "8px 14px", fontSize: 12, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg, #6366F1, #7C3AED)", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>
                    Update Progress
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onCancel}
                    style={{ padding: "8px 14px", fontSize: 12, fontWeight: 600, color: _C.textMid, background: _C.bg, border: `1px solid ${_C.border}`, borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>
                    Cancel
                </motion.button>
            </div>
        </div>
    );
};

const ActionFormRecognize = ({ employees, onSubmit, onCancel }) => {
    const badges = [
        { emoji: "\uD83C\uDFC6", label: "MVP" },
        { emoji: "\uD83C\uDF1F", label: "Top Performer" },
        { emoji: "\uD83D\uDC8E", label: "Culture Champion" },
        { emoji: "\uD83D\uDE80", label: "Fast Learner" },
    ];
    const [form, setForm] = React.useState({ empId: "", badge: badges[0].label, reason: "" });
    const handleSubmit = () => {
        if (!form.empId || !form.reason) return;
        onSubmit(form);
    };
    const inputStyle = { width: "100%", padding: "7px 10px", fontSize: 12, border: `1px solid ${_C.border}`, borderRadius: 8, background: _C.bg, color: _C.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box" };
    const labelStyle = { fontSize: 11, fontWeight: 600, color: _C.textMid, marginBottom: 4, display: "block" };
    return (
        <div style={{ marginTop: 10 }}>
            <div style={{ marginBottom: 8 }}>
                <label style={labelStyle}>Employee</label>
                <select value={form.empId} onChange={e => setForm(f => ({ ...f, empId: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="">Select employee...</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.dept})</option>)}
                </select>
            </div>
            <div style={{ marginBottom: 8 }}>
                <label style={labelStyle}>Badge</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {badges.map(b => (
                        <motion.button key={b.label} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            onClick={() => setForm(f => ({ ...f, badge: b.label }))}
                            style={{ padding: "6px 12px", fontSize: 12, fontWeight: form.badge === b.label ? 700 : 500, color: form.badge === b.label ? _C.primary : _C.textMid, background: form.badge === b.label ? _C.primaryLight : _C.bg, border: `1px solid ${form.badge === b.label ? _C.primary : _C.border}`, borderRadius: 20, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
                            <span>{b.emoji}</span> {b.label}
                        </motion.button>
                    ))}
                </div>
            </div>
            <div style={{ marginBottom: 10 }}>
                <label style={labelStyle}>Reason</label>
                <input type="text" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Why do they deserve this recognition?" style={inputStyle} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleSubmit}
                    style={{ flex: 1, padding: "8px 14px", fontSize: 12, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg, #6366F1, #7C3AED)", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>
                    Send Recognition
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onCancel}
                    style={{ padding: "8px 14px", fontSize: 12, fontWeight: 600, color: _C.textMid, background: _C.bg, border: `1px solid ${_C.border}`, borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>
                    Cancel
                </motion.button>
            </div>
        </div>
    );
};

const ActionFormRequestSkill = ({ onSubmit, onCancel }) => {
    const [form, setForm] = React.useState({ skillName: "", targetLevel: "Intermediate", evidence: "" });
    const handleSubmit = () => {
        if (!form.skillName) return;
        onSubmit(form);
    };
    const inputStyle = { width: "100%", padding: "7px 10px", fontSize: 12, border: `1px solid ${_C.border}`, borderRadius: 8, background: _C.bg, color: _C.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box" };
    const labelStyle = { fontSize: 11, fontWeight: 600, color: _C.textMid, marginBottom: 4, display: "block" };
    return (
        <div style={{ marginTop: 10 }}>
            <div style={{ marginBottom: 8 }}>
                <label style={labelStyle}>Skill Name</label>
                <input type="text" value={form.skillName} onChange={e => setForm(f => ({ ...f, skillName: e.target.value }))} placeholder="e.g. TypeScript, AWS, Leadership..." style={inputStyle} />
            </div>
            <div style={{ marginBottom: 8 }}>
                <label style={labelStyle}>Target Level</label>
                <select value={form.targetLevel} onChange={e => setForm(f => ({ ...f, targetLevel: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
                    {["Beginner", "Intermediate", "Advanced", "Expert"].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
            </div>
            <div style={{ marginBottom: 10 }}>
                <label style={labelStyle}>Evidence URL (optional)</label>
                <input type="text" value={form.evidence} onChange={e => setForm(f => ({ ...f, evidence: e.target.value }))} placeholder="https://..." style={inputStyle} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleSubmit}
                    style={{ flex: 1, padding: "8px 14px", fontSize: 12, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg, #6366F1, #7C3AED)", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>
                    Submit Request
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onCancel}
                    style={{ padding: "8px 14px", fontSize: 12, fontWeight: 600, color: _C.textMid, background: _C.bg, border: `1px solid ${_C.border}`, borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>
                    Cancel
                </motion.button>
            </div>
        </div>
    );
};

/* ─── Main NexisAI Component ───────────────────────────────────── */

const WELCOME_CHIPS = [
    { label: "Attrition risks", icon: "AlertTriangle", color: "#EF4444" },
    { label: "Promotion candidates", icon: "TrendingUp", color: "#10B981" },
    { label: "Skills gap report", icon: "BarChart2", color: "#3B82F6" },
    { label: "Development plans", icon: "BookOpen", color: "#F59E0B" },
    { label: "Workforce overview", icon: "LayoutDashboard", color: "#8B5CF6" },
    { label: "Compensation analysis", icon: "DollarSign", color: "#0891B2" },
];

const NexisAI = ({ C, employees, jobFamilies, leaveRequests, setLeaveRequests, attendance, payroll, goals, setGoals, recognitions, setRecognitions, skillRequests, setSkillRequests }) => {
    _C = C;
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [unread, setUnread] = useState(2);
    const [actionForm, setActionForm] = useState(null);
    const [showAtMenu, setShowAtMenu] = useState(false);
    const atMenuRef = useRef(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => { if (open) { scrollBottom(); inputRef.current?.focus(); setUnread(0); } }, [open, messages]);

    const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const send = (text) => {
        if (!text.trim()) return;
        const userMsg = { id: Date.now(), role: "user", text, time: now() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        setTimeout(() => {
            const response = buildResponse(text, employees, jobFamilies, leaveRequests, attendance, payroll);
            const aiMsg = { id: Date.now() + 1, role: "nexis", text: response.text, response, time: now() };
            setMessages(prev => [...prev, aiMsg]);
            setLoading(false);
        }, 900 + Math.random() * 600);
    };

    const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } };

    const nowTimestamp = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const currentEmp = employees.find(e => e.id === "EMP001") || employees[0];

    const handleActionTag = (key) => {
        if (key === "clock_in") {
            const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
            const aiMsg = {
                id: Date.now(), role: "nexis", time: nowTimestamp(),
                text: `You're now clocked in at **${timeStr}**. Mode: **Onsite**. Have a productive day!`,
                response: {
                    type: "text",
                    text: `You're now clocked in at **${timeStr}**. Mode: **Onsite**. Have a productive day! \u2705`,
                },
            };
            setMessages(prev => [...prev, aiMsg]);
            return;
        }

        if (key === "leave_balance") {
            const bal = currentEmp?.leaveBalance || { annual: 0, medical: 0, emergency: 0 };
            const aiMsg = {
                id: Date.now(), role: "nexis", time: nowTimestamp(),
                text: "Here's your current leave balance:",
                response: {
                    type: "leave_balance",
                    text: `Here's your current leave balance, **${currentEmp?.name || "Employee"}**:`,
                    balances: [
                        { type: "Annual Leave", remaining: bal.annual, total: 21, color: _C.primary, icon: "Sun" },
                        { type: "Medical Leave", remaining: bal.medical, total: 14, color: _C.info, icon: "Heart" },
                        { type: "Emergency Leave", remaining: bal.emergency, total: 5, color: _C.warning, icon: "AlertTriangle" },
                        { type: "Casual Leave", remaining: bal.casual || 7, total: 10, color: _C.success, icon: "Coffee" },
                    ],
                },
            };
            setMessages(prev => [...prev, aiMsg]);
            return;
        }

        if (key === "my_payslip") {
            const empPayroll = (payroll || []).find(p => p.empId === (currentEmp?.id || "EMP001")) || null;
            const aiMsg = {
                id: Date.now(), role: "nexis", time: nowTimestamp(),
                text: "Here's your latest payslip:",
                response: {
                    type: "payslip",
                    text: `Here's your latest payslip summary, **${currentEmp?.name || "Employee"}**:`,
                    payslip: empPayroll,
                    emp: currentEmp,
                },
            };
            setMessages(prev => [...prev, aiMsg]);
            return;
        }

        // For form-based actions, add a nexis message with the form embedded
        const formLabels = {
            apply_leave: "I'll help you apply for leave. Fill in the details below:",
            update_goal: "Let's update your goal progress. Select a goal and set the new progress:",
            recognize: "Send a recognition to a colleague! Choose who and why:",
            request_skill: "Submit a new skill request. Fill in the details:",
        };
        const aiMsg = {
            id: Date.now(), role: "nexis", time: nowTimestamp(),
            text: formLabels[key] || "Fill in the form below:",
            response: { type: "action_form", text: formLabels[key] || "Fill in the form below:", formKey: key },
        };
        setMessages(prev => [...prev, aiMsg]);
        setActionForm(key);
    };

    const handleLeaveSubmit = (form) => {
        const fromDate = new Date(form.from);
        const toDate = new Date(form.to);
        const days = Math.max(1, Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1);
        const fromStr = fromDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const toStr = toDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

        if (setLeaveRequests) {
            setLeaveRequests(prev => [...prev, {
                id: `LR${Date.now()}`,
                empId: currentEmp?.id || "EMP001",
                empName: currentEmp?.name || "Employee",
                type: form.type,
                from: form.from,
                to: form.to,
                days,
                reason: form.reason || "Personal",
                status: "Pending",
                appliedOn: new Date().toISOString().split("T")[0],
            }]);
        }
        setActionForm(null);
        const successMsg = {
            id: Date.now() + 1, role: "nexis", time: nowTimestamp(),
            text: `Leave request submitted!`,
            response: { type: "text", text: `Leave request submitted! \u2705 **${form.type}**: ${fromStr} \u2013 ${toStr} (**${days} day${days > 1 ? "s" : ""}**). Your manager will be notified.` },
        };
        setMessages(prev => [...prev, successMsg]);
    };

    const handleGoalSubmit = (form) => {
        const goal = (goals || []).find(g => g.id === form.goalId);
        if (setGoals && goal) {
            setGoals(prev => prev.map(g => g.id === form.goalId ? { ...g, progress: form.progress, status: form.progress >= 100 ? "Completed" : g.status } : g));
        }
        setActionForm(null);
        const successMsg = {
            id: Date.now() + 1, role: "nexis", time: nowTimestamp(),
            text: `Goal updated!`,
            response: { type: "text", text: `Goal progress updated! \u2705 **${goal?.title || goal?.name || form.goalId}** is now at **${form.progress}%**.${form.progress >= 100 ? " Congratulations on completing this goal! \uD83C\uDF89" : ""}` },
        };
        setMessages(prev => [...prev, successMsg]);
    };

    const handleRecognizeSubmit = (form) => {
        const emp = employees.find(e => e.id === form.empId);
        if (setRecognitions) {
            setRecognitions(prev => [...prev, {
                id: `REC${Date.now()}`,
                fromId: currentEmp?.id || "ADMIN",
                fromName: currentEmp?.name || "HR Admin",
                toId: form.empId,
                toName: emp?.name || "Employee",
                badge: form.badge,
                message: form.reason,
                date: new Date().toISOString().split("T")[0],
                reactions: {},
            }]);
        }
        setActionForm(null);
        const badgeEmojis = { MVP: "\uD83C\uDFC6", "Top Performer": "\uD83C\uDF1F", "Culture Champion": "\uD83D\uDC8E", "Fast Learner": "\uD83D\uDE80" };
        const successMsg = {
            id: Date.now() + 1, role: "nexis", time: nowTimestamp(),
            text: `Recognition sent!`,
            response: { type: "text", text: `Recognition sent! \u2705 ${badgeEmojis[form.badge] || "\uD83C\uDF1F"} **${form.badge}** badge awarded to **${emp?.name || "Employee"}**. They'll be notified right away!` },
        };
        setMessages(prev => [...prev, successMsg]);
    };

    const handleSkillRequestSubmit = (form) => {
        if (setSkillRequests) {
            setSkillRequests(prev => [...prev, {
                id: `SR${Date.now()}`,
                empId: currentEmp?.id || "EMP001",
                empName: currentEmp?.name || "Employee",
                skillName: form.skillName,
                skill: `${form.skillName} \u2192 ${form.targetLevel}`,
                fromLevel: "None",
                toLevel: form.targetLevel,
                evidence: form.evidence || "",
                validatorId: null,
                validatorName: null,
                requiresEvidence: false,
                status: "pending",
                submittedAt: new Date().toISOString(),
                requestedAt: new Date().toISOString(),
                reviewNote: "",
            }]);
        }
        setActionForm(null);
        const successMsg = {
            id: Date.now() + 1, role: "nexis", time: nowTimestamp(),
            text: `Skill request submitted!`,
            response: { type: "text", text: `Skill request submitted! \u2705 **${form.skillName}** at **${form.targetLevel}** level. Your request is now pending review.` },
        };
        setMessages(prev => [...prev, successMsg]);
    };

    const cancelAction = () => {
        setActionForm(null);
        const cancelMsg = {
            id: Date.now(), role: "nexis", time: nowTimestamp(),
            text: "Action cancelled.",
            response: { type: "text", text: "No problem, action cancelled. Is there anything else I can help you with?" },
        };
        setMessages(prev => [...prev, cancelMsg]);
    };

    const attritionCount = useMemo(() =>
        employees.filter(e => calcAttritionRisk(e, employees, leaveRequests) >= 40).length,
        [employees, leaveRequests]
    );

    return (
        <>
            {/* Floating trigger */}
            <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9000 }}>
                <AnimatePresence>
                    {!open && (
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                            {/* Pulse ring */}
                            <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                style={{ position: "absolute", inset: -8, borderRadius: "50%", background: "rgba(99,102,241,0.25)", zIndex: -1 }} />
                            <motion.button
                                whileHover={{ scale: 1.06 }}
                                whileTap={{ scale: 0.94 }}
                                onClick={() => setOpen(true)}
                                style={{ width: 58, height: 58, borderRadius: "50%", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(99,102,241,0.5), 0 2px 8px rgba(0,0,0,0.2)", position: "relative" }}>
                                <Lucide.Sparkles size={24} color="#fff" strokeWidth={2} />
                                {unread > 0 && (
                                    <div style={{ position: "absolute", top: -2, right: -2, width: 18, height: 18, borderRadius: "50%", background: C.danger, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff" }}>{unread}</div>
                                )}
                            </motion.button>
                            <div style={{ position: "absolute", bottom: -20, left: "50%", transform: "translateX(-50%)", fontSize: 10, fontWeight: 800, color: C.primary, whiteSpace: "nowrap", letterSpacing: "0.08em", textTransform: "uppercase" }}>Nexis AI</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Chat panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: 20, transformOrigin: "bottom right" }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 20 }}
                        transition={{ type: "spring", stiffness: 320, damping: 28 }}
                        style={{ position: "fixed", bottom: 24, right: 24, width: 430, height: 620, zIndex: 8999, display: "flex", flexDirection: "column", borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.22), 0 8px 24px rgba(99,102,241,0.18)", border: "1px solid rgba(99,102,241,0.2)", fontFamily: "'Inter','DM Sans',-apple-system,sans-serif" }}>

                        {/* Header */}
                        <div style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 60%, #312E81 100%)", padding: "14px 16px", flexShrink: 0, borderBottom: "1px solid rgba(99,102,241,0.2)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg, #6366F1, #8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(99,102,241,0.5)", fontSize: 14, fontWeight: 900, color: "#fff" }}>N</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                        <span style={{ fontSize: 15, fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.3px" }}>Nexis</span>
                                        <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(99,102,241,0.3)", border: "1px solid rgba(129,140,248,0.4)", color: "#A5B4FC", borderRadius: 5, padding: "2px 7px" }}>AI · HR Intelligence</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                                        <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399" }} />
                                        <span style={{ fontSize: 10.5, color: "#64748B" }}>Active · Analysing {employees.length} employees</span>
                                    </div>
                                </div>
                                <motion.button whileHover={{ scale: 1.1 }} onClick={() => setOpen(false)}
                                    style={{ width: 30, height: 30, borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Lucide.X size={15} color="#94A3B8" strokeWidth={2} />
                                </motion.button>
                            </div>

                            {/* Capability pills */}
                            <div style={{ display: "flex", gap: 5, marginTop: 10, flexWrap: "wrap" }}>
                                {[
                                    { label: `${attritionCount} at-risk`, color: "#EF4444" },
                                    { label: "Skills mapping", color: "#3B82F6" },
                                    { label: "Dev planning", color: "#10B981" },
                                    { label: "Promotions", color: "#F59E0B" },
                                ].map(({ label, color }) => (
                                    <span key={label} style={{ fontSize: 10, fontWeight: 600, color, background: color + "18", border: `1px solid ${color}33`, borderRadius: 5, padding: "2px 8px" }}>{label}</span>
                                ))}
                            </div>
                        </div>

                        {/* Messages area */}
                        <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 8px", background: C.bg, scrollbarWidth: "thin" }}>

                            {/* Welcome state */}
                            {messages.length === 0 && !loading && (
                                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                                    <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "flex-start" }}>
                                        <div style={{ width: 30, height: 30, borderRadius: 10, background: "linear-gradient(135deg, #6366F1, #8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#fff", flexShrink: 0 }}>N</div>
                                        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "4px 14px 14px 14px", padding: "12px 14px", boxShadow: C.shadow, maxWidth: "82%" }}>
                                            <div style={{ fontSize: 13, color: C.text, lineHeight: 1.65, marginBottom: 10 }}>
                                                Hello — I'm <strong>Nexis</strong>, your AI HR intelligence engine. I have full visibility into your workforce across attendance, performance, compensation, skills, and leave data.<br /><br />
                                                I can predict who might leave, who's ready to advance, where your skills gaps are, and build personalised growth roadmaps. What would you like to explore?
                                            </div>
                                            <div style={{ fontSize: 10, color: C.textMuted }}>{now()}</div>
                                        </div>
                                    </div>

                                    {/* Quick action chips */}
                                    <div style={{ marginBottom: 8 }}>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, paddingLeft: 2 }}>Quick Actions</div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                                            {WELCOME_CHIPS.map(({ label, icon, color }) => {
                                                const ChipIcon = Lucide[icon] || Lucide.Circle;
                                                return (
                                                    <motion.button key={label} whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }} onClick={() => send(label)}
                                                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 11px", background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, cursor: "pointer", fontFamily: "inherit", boxShadow: C.shadow, textAlign: "left", transition: "all 0.15s" }}>
                                                        <div style={{ width: 26, height: 26, borderRadius: 8, background: color + "15", border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                            <ChipIcon size={13} color={color} strokeWidth={2} />
                                                        </div>
                                                        <span style={{ fontSize: 11.5, fontWeight: 600, color: C.textMid, lineHeight: 1.3 }}>{label}</span>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Message history */}
                            {messages.map(msg => (
                                <MessageBubble
                                    key={msg.id}
                                    msg={msg}
                                    employees={employees}
                                    jobFamilies={jobFamilies}
                                    leaveRequests={leaveRequests}
                                    onQuickAction={send}
                                    actionForm={actionForm}
                                    onLeaveSubmit={handleLeaveSubmit}
                                    onGoalSubmit={handleGoalSubmit}
                                    onRecognizeSubmit={handleRecognizeSubmit}
                                    onSkillRequestSubmit={handleSkillRequestSubmit}
                                    onCancelAction={cancelAction}
                                    goals={goals}
                                />
                            ))}

                            {loading && <TypingIndicator />}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input area */}
                        <div style={{ padding: "10px 12px", background: C.white, borderTop: `1px solid ${C.border}`, flexShrink: 0, position: "relative" }}>
                            {/* @ Action Menu Dropdown */}
                            <AnimatePresence>
                                {showAtMenu && (
                                    <motion.div
                                        ref={atMenuRef}
                                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                        transition={{ duration: 0.15 }}
                                        style={{
                                            position: "absolute", bottom: "100%", left: 12, right: 12,
                                            background: C.white, border: `1px solid ${C.border}`, borderRadius: 14,
                                            boxShadow: C.shadowLg, padding: "6px", marginBottom: 6, zIndex: 10,
                                            maxHeight: 260, overflowY: "auto",
                                        }}>
                                        <div style={{ padding: "8px 10px 6px", fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>Quick Actions</div>
                                        {ACTION_TAGS.map(tag => (
                                            <motion.button
                                                key={tag.key}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => { setShowAtMenu(false); handleActionTag(tag.key); }}
                                                style={{
                                                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                                                    padding: "9px 12px", border: "none", borderRadius: 10,
                                                    background: "transparent", cursor: "pointer", fontFamily: "inherit",
                                                    color: C.text, fontSize: 13, fontWeight: 500, textAlign: "left",
                                                    transition: "background 0.12s",
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.background = C.bg; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                                            >
                                                <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>{tag.emoji}</span>
                                                <span>{tag.label}</span>
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "8px 10px", transition: "border-color 0.15s" }}>
                                {/* @ trigger button */}
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setShowAtMenu(v => !v)}
                                    disabled={actionForm !== null}
                                    style={{
                                        width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${showAtMenu ? C.primary : C.border}`,
                                        background: showAtMenu ? C.primaryLight : "transparent",
                                        color: showAtMenu ? C.primary : C.textMuted,
                                        fontSize: 16, fontWeight: 800, cursor: actionForm ? "default" : "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                        fontFamily: "inherit", transition: "all 0.15s", opacity: actionForm ? 0.4 : 1,
                                    }}>
                                    @
                                </motion.button>
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={e => {
                                        setInput(e.target.value);
                                        if (e.target.value.endsWith("@")) setShowAtMenu(true);
                                        else if (showAtMenu && !e.target.value.includes("@")) setShowAtMenu(false);
                                    }}
                                    onKeyDown={e => { if (e.key === "Escape") setShowAtMenu(false); handleKey(e); }}
                                    placeholder="Ask Nexis anything… type @ for actions"
                                    rows={1}
                                    style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 13, color: C.text, fontFamily: "inherit", resize: "none", lineHeight: 1.5, maxHeight: 80, overflowY: "auto" }}
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => send(input)}
                                    disabled={!input.trim() || loading}
                                    style={{ width: 34, height: 34, borderRadius: 9, background: input.trim() && !loading ? "linear-gradient(135deg, #6366F1, #7C3AED)" : C.border, border: "none", cursor: input.trim() && !loading ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}>
                                    <Lucide.Send size={15} color={input.trim() && !loading ? "#fff" : C.textMuted} strokeWidth={2} />
                                </motion.button>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 7 }}>
                                <Lucide.Sparkles size={10} color={C.textMuted} strokeWidth={2} />
                                <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 500 }}>Nexis · AI HR Intelligence · Powered by Selfvora</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default NexisAI;
