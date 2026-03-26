/**
 * HRSetupPages.jsx
 * Two HR Admin screens:
 *  1. AllowancePage  — define and assign allowance types
 *  2. PermissionsPage — grant / restrict access by position or by employee
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";

/* ─── tiny shared helpers (mirror App.jsx patterns) ─────────────── */
const Icon = ({ C: _C, n, size = 16, color = "currentColor", strokeWidth = 1.75, style }) => {
    const map = {
        plus: "Plus", edit: "Edit", trash: "Trash2", check: "Check", close: "X",
        chevDown: "ChevronDown", chevRight: "ChevronRight", search: "Search",
        shield: "ShieldCheck", lock: "Lock", unlock: "Unlock2", user: "User",
        users: "Users", briefcase: "Briefcase", dollar: "DollarSign",
        piggy: "PiggyBank", settings: "Settings2", eye: "Eye", eyeOff: "EyeOff",
        info: "Info", warning: "AlertTriangle", percent: "Percent",
        building: "Building2", calendar: "CalendarDays", sparkle: "Sparkles",
        key: "Key", ban: "Ban", checkCircle: "CheckCircle2", xCircle: "XCircle",
        filter: "Filter", download: "Download", refresh: "RotateCcw",
        save: "Save", copy: "Copy", layers: "Layers", tag: "Tag",
        arrowRight: "ArrowRight", dot: "Circle", more: "MoreHorizontal",
        zap: "Zap", wallet: "Wallet", coins: "Coins", receipt: "Receipt",
        shieldOff: "ShieldOff", shieldPlus: "ShieldPlus", toggleLeft: "ToggleLeft",
        toggleRight: "ToggleRight",
    };
    const LucideIcon = Lucide[map[n] || n] || Lucide.HelpCircle;
    return <LucideIcon size={size} color={color} strokeWidth={strokeWidth} style={{ flexShrink: 0, ...style }} />;
};

const Avatar = ({ name, size = 32 }) => {
    const colors = ["#6366F1", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#0891B2", "#D97706"];
    const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "??";
    const bg = colors[name?.charCodeAt(0) % colors.length];
    return (
        <div style={{ width: size, height: size, borderRadius: size * 0.35, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 700, color: "#fff", flexShrink: 0, letterSpacing: "-0.3px" }}>
            {initials}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════
   1.  ALLOWANCE PAGE
   ═══════════════════════════════════════════════════════════════════ */

const ALLOWANCE_CATEGORIES = ["Transport", "Meals", "Housing", "Phone & Internet", "Wellness", "Clothing", "Education", "Other"];

const DEFAULT_ALLOWANCE_TYPES = [
    { id: "al1", name: "Transport Allowance", category: "Transport", calcType: "fixed", amount: 8000, taxable: false, applicableTo: "all", positionIds: [], employeeIds: [], active: true },
    { id: "al2", name: "Meal Allowance", category: "Meals", calcType: "fixed", amount: 5000, taxable: false, applicableTo: "all", positionIds: [], employeeIds: [], active: true },
    { id: "al3", name: "Housing Allowance", category: "Housing", calcType: "percent", amount: 15, taxable: true, applicableTo: "position", positionIds: ["jf1", "jf2", "jf3"], employeeIds: [], active: true },
    { id: "al4", name: "Phone & Internet", category: "Phone & Internet", calcType: "fixed", amount: 3000, taxable: false, applicableTo: "position", positionIds: ["jf1", "jf6"], employeeIds: [], active: true },
    { id: "al5", name: "Wellness Allowance", category: "Wellness", calcType: "fixed", amount: 2500, taxable: false, applicableTo: "all", positionIds: [], employeeIds: [], active: false },
];

export const AllowancePage = ({ C, employees, jobFamilies }) => {
    const [tab, setTab] = useState("types");
    const [types, setTypes] = useState(DEFAULT_ALLOWANCE_TYPES);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [searchEmp, setSearchEmp] = useState("");
    const [selectedEmpId, setSelectedEmpId] = useState(null);

    const emptyForm = { name: "", category: "Transport", calcType: "fixed", amount: "", taxable: false, applicableTo: "all", positionIds: [], employeeIds: [], active: true };
    const [form, setForm] = useState(emptyForm);

    const openAdd = () => { setForm(emptyForm); setEditItem(null); setShowForm(true); };
    const openEdit = (t) => { setForm({ ...t }); setEditItem(t.id); setShowForm(true); };
    const closeForm = () => setShowForm(false);

    const save = () => {
        if (!form.name.trim() || !form.amount) return;
        if (editItem) {
            setTypes(ts => ts.map(t => t.id === editItem ? { ...form, id: editItem } : t));
        } else {
            setTypes(ts => [...ts, { ...form, id: "al" + Date.now() }]);
        }
        setShowForm(false);
    };

    const remove = (id) => setTypes(ts => ts.filter(t => t.id !== id));
    const toggle = (id) => setTypes(ts => ts.map(t => t.id === id ? { ...t, active: !t.active } : t));

    const filteredEmps = employees.filter(e =>
        e.name.toLowerCase().includes(searchEmp.toLowerCase()) ||
        e.dept.toLowerCase().includes(searchEmp.toLowerCase())
    );

    const getEmpAllowances = (emp) => {
        return types.filter(t => {
            if (!t.active) return false;
            if (t.applicableTo === "all") return true;
            if (t.applicableTo === "position") return t.positionIds.includes(emp.familyId);
            if (t.applicableTo === "employee") return t.employeeIds.includes(emp.id);
            return false;
        });
    };

    const calcAmount = (t, emp) => {
        if (t.calcType === "percent") return Math.round(emp.salary * t.amount / 100);
        return t.amount;
    };

    const totalForEmp = (emp) => getEmpAllowances(emp).reduce((s, t) => s + calcAmount(t, emp), 0);

    const selectedEmp = employees.find(e => e.id === selectedEmpId);

    return (
        <div style={{ padding: "24px 28px", overflowY: "auto", flex: 1 }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: "0 0 4px", letterSpacing: "-0.5px" }}>Allowance Setup</h1>
                    <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>Define allowance types and control who receives them</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={openAdd}
                    style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", background: C.primary, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                >
                    <Icon C={C} n="plus" size={14} color="#fff" />
                    New Allowance
                </motion.button>
            </div>

            {/* Stat row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
                {[
                    { label: "Allowance Types", value: types.length, color: C.primary, icon: "tag" },
                    { label: "Active Types", value: types.filter(t => t.active).length, color: C.success, icon: "checkCircle" },
                    { label: "Applies to All", value: types.filter(t => t.applicableTo === "all" && t.active).length, color: C.info, icon: "users" },
                    { label: "Avg Allowance / Employee", value: "LKR " + (employees.length ? Math.round(employees.reduce((s, e) => s + totalForEmp(e), 0) / employees.length).toLocaleString() : 0), color: C.warning, icon: "wallet" },
                ].map((s) => (
                    <motion.div key={s.label} whileHover={{ y: -3 }} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px", boxShadow: C.shadow, position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: s.color, borderRadius: "12px 0 0 12px" }} />
                        <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 500, marginBottom: 6 }}>{s.label}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>{s.value}</div>
                    </motion.div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20, background: C.bg, borderRadius: 10, padding: 5, width: "fit-content", border: `1px solid ${C.border}` }}>
                {[["types", "tag", "Allowance Types"], ["employees", "users", "Employee View"]].map(([key, icon, label]) => (
                    <motion.button key={key} whileTap={{ scale: 0.97 }} onClick={() => setTab(key)}
                        style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, background: tab === key ? C.white : "transparent", color: tab === key ? C.primary : C.textMid, boxShadow: tab === key ? C.shadow : "none", transition: "all 0.15s" }}>
                        <Icon C={C} n={icon} size={14} color={tab === key ? C.primary : C.textMid} />
                        {label}
                    </motion.button>
                ))}
            </div>

            {/* TYPES TAB */}
            {tab === "types" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", boxShadow: C.shadow }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: C.tableHead }}>
                                    {["Allowance Name", "Category", "Calculation", "Amount", "Taxable", "Applies To", "Status", "Actions"].map(h => (
                                        <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {types.map((t) => (
                                        <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            style={{ background: C.tableRow, borderBottom: `1px solid ${C.borderLight}` }}>
                                            <td style={{ padding: "12px 16px" }}>
                                                <div style={{ fontWeight: 700, color: C.text, fontSize: 13 }}>{t.name}</div>
                                            </td>
                                            <td style={{ padding: "12px 16px" }}>
                                                <span style={{ fontSize: 12, fontWeight: 600, color: C.primary, background: C.primaryLight, border: `1px solid ${C.primaryMid}`, borderRadius: 6, padding: "3px 9px" }}>{t.category}</span>
                                            </td>
                                            <td style={{ padding: "12px 16px", fontSize: 13, color: C.textMid }}>
                                                {t.calcType === "percent" ? "% of Salary" : "Fixed Amount"}
                                            </td>
                                            <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: C.text }}>
                                                {t.calcType === "percent" ? `${t.amount}%` : `LKR ${Number(t.amount).toLocaleString()}`}
                                            </td>
                                            <td style={{ padding: "12px 16px" }}>
                                                <span style={{ fontSize: 12, fontWeight: 600, borderRadius: 6, padding: "3px 9px", background: t.taxable ? C.warningBg : C.successBg, color: t.taxable ? C.warning : C.success, border: `1px solid ${t.taxable ? C.warningBorder : C.successBorder}` }}>
                                                    {t.taxable ? "Taxable" : "Non-taxable"}
                                                </span>
                                            </td>
                                            <td style={{ padding: "12px 16px", fontSize: 13, color: C.textMid }}>
                                                {t.applicableTo === "all" ? "All Employees" : t.applicableTo === "position" ? `${t.positionIds.length} Position(s)` : `${t.employeeIds.length} Employee(s)`}
                                            </td>
                                            <td style={{ padding: "12px 16px" }}>
                                                <motion.button whileTap={{ scale: 0.95 }} onClick={() => toggle(t.id)}
                                                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 7, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600, background: t.active ? C.successBg : C.tableHead, color: t.active ? C.success : C.textMuted }}>
                                                    <Icon C={C} n={t.active ? "checkCircle" : "xCircle"} size={13} color={t.active ? C.success : C.textMuted} />
                                                    {t.active ? "Active" : "Inactive"}
                                                </motion.button>
                                            </td>
                                            <td style={{ padding: "12px 16px" }}>
                                                <div style={{ display: "flex", gap: 6 }}>
                                                    <motion.button whileHover={{ scale: 1.1 }} onClick={() => openEdit(t)} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                        <Icon C={C} n="edit" size={13} color={C.primary} />
                                                    </motion.button>
                                                    <motion.button whileHover={{ scale: 1.1 }} onClick={() => remove(t.id)} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.dangerBorder}`, background: C.dangerBg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                        <Icon C={C} n="trash" size={13} color={C.danger} />
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* EMPLOYEES TAB */}
            {tab === "employees" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
                    {/* Employee list */}
                    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", boxShadow: C.shadow, display: "flex", flexDirection: "column", maxHeight: 560 }}>
                        <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.borderLight}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px" }}>
                                <Icon C={C} n="search" size={13} color={C.textMuted} />
                                <input value={searchEmp} onChange={e => setSearchEmp(e.target.value)} placeholder="Search employees…"
                                    style={{ border: "none", background: "transparent", outline: "none", fontSize: 12.5, color: C.text, width: "100%", fontFamily: "inherit" }} />
                            </div>
                        </div>
                        <div style={{ overflowY: "auto", flex: 1 }}>
                            {filteredEmps.map(emp => (
                                <div key={emp.id} onClick={() => setSelectedEmpId(emp.id)}
                                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: "pointer", background: selectedEmpId === emp.id ? C.primaryLight : "transparent", borderBottom: `1px solid ${C.borderLight}`, transition: "background 0.12s" }}>
                                    <Avatar name={emp.name} size={34} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{emp.name}</div>
                                        <div style={{ fontSize: 11, color: C.textMuted }}>{emp.dept}</div>
                                    </div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: C.primary }}>{getEmpAllowances(emp).length}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Allowance detail */}
                    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", boxShadow: C.shadow }}>
                        {!selectedEmp ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, color: C.textMuted }}>
                                <Icon C={C} n="users" size={40} color={C.border} />
                                <div style={{ marginTop: 14, fontSize: 14, fontWeight: 600 }}>Select an employee to view allowances</div>
                            </div>
                        ) : (
                            <>
                                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.borderLight}`, display: "flex", alignItems: "center", gap: 14 }}>
                                    <Avatar name={selectedEmp.name} size={44} />
                                    <div>
                                        <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{selectedEmp.name}</div>
                                        <div style={{ fontSize: 12, color: C.textMuted }}>{selectedEmp.level} · {selectedEmp.dept}</div>
                                    </div>
                                    <div style={{ marginLeft: "auto", textAlign: "right" }}>
                                        <div style={{ fontSize: 11, color: C.textMuted }}>Total Monthly Allowance</div>
                                        <div style={{ fontSize: 20, fontWeight: 800, color: C.primary }}>LKR {totalForEmp(selectedEmp).toLocaleString()}</div>
                                    </div>
                                </div>
                                <div style={{ padding: 16 }}>
                                    {getEmpAllowances(selectedEmp).length === 0 ? (
                                        <div style={{ textAlign: "center", padding: 32, color: C.textMuted, fontSize: 13 }}>No active allowances assigned</div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                            {getEmpAllowances(selectedEmp).map(t => (
                                                <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: C.bg, borderRadius: 10, border: `1px solid ${C.borderLight}` }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                        <div style={{ width: 36, height: 36, borderRadius: 9, background: C.primaryLight, border: `1px solid ${C.primaryMid}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                            <Icon C={C} n="wallet" size={16} color={C.primary} />
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{t.name}</div>
                                                            <div style={{ fontSize: 11, color: C.textMuted }}>{t.category} · {t.taxable ? "Taxable" : "Non-taxable"} · Via {t.applicableTo === "all" ? "Global rule" : t.applicableTo === "position" ? "Position" : "Direct assign"}</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: "right" }}>
                                                        <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>LKR {calcAmount(t, selectedEmp).toLocaleString()}</div>
                                                        <div style={{ fontSize: 11, color: C.textMuted }}>{t.calcType === "percent" ? `${t.amount}% of salary` : "Fixed"}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            )}

            {/* FORM MODAL */}
            <AnimatePresence>
                {showForm && (
                    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeForm}
                            style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(8px)" }} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            style={{ position: "relative", width: "100%", maxWidth: 540, background: C.white, borderRadius: 20, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", overflow: "hidden" }}>
                            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.borderLight}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <h2 style={{ fontSize: 17, fontWeight: 800, color: C.text, margin: 0 }}>{editItem ? "Edit Allowance" : "New Allowance Type"}</h2>
                                <motion.button whileHover={{ scale: 1.1 }} onClick={closeForm} style={{ border: "none", background: C.bg, borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Icon C={C} n="close" size={16} color={C.textMid} />
                                </motion.button>
                            </div>
                            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                                {[
                                    { label: "Allowance Name *", el: <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Transport Allowance" style={inputStyle(C)} /> },
                                    { label: "Category", el: <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle(C)}>{ALLOWANCE_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select> },
                                    { label: "Calculation Type", el: <select value={form.calcType} onChange={e => setForm(f => ({ ...f, calcType: e.target.value }))} style={inputStyle(C)}><option value="fixed">Fixed Amount (LKR)</option><option value="percent">Percentage of Salary (%)</option></select> },
                                    { label: form.calcType === "percent" ? "Percentage (%)" : "Amount (LKR)", el: <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder={form.calcType === "percent" ? "e.g. 15" : "e.g. 8000"} style={inputStyle(C)} /> },
                                ].map(({ label, el }) => (
                                    <div key={label}>
                                        <label style={{ fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 6, display: "block" }}>{label}</label>
                                        {el}
                                    </div>
                                ))}
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 8, display: "block" }}>Applies To</label>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        {[["all", "All Employees"], ["position", "By Position"], ["employee", "Specific Employees"]].map(([v, l]) => (
                                            <motion.button key={v} whileTap={{ scale: 0.97 }} onClick={() => setForm(f => ({ ...f, applicableTo: v }))}
                                                style={{ flex: 1, padding: "8px 0", borderRadius: 9, border: `2px solid ${form.applicableTo === v ? C.primary : C.border}`, background: form.applicableTo === v ? C.primaryLight : C.white, color: form.applicableTo === v ? C.primary : C.textMid, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                                                {l}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                                {form.applicableTo === "position" && (
                                    <div>
                                        <label style={{ fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 8, display: "block" }}>Select Positions</label>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                            {jobFamilies.map(jf => (
                                                <motion.button key={jf.id} whileTap={{ scale: 0.96 }} onClick={() => setForm(f => ({ ...f, positionIds: f.positionIds.includes(jf.id) ? f.positionIds.filter(id => id !== jf.id) : [...f.positionIds, jf.id] }))}
                                                    style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${form.positionIds.includes(jf.id) ? C.primary : C.border}`, background: form.positionIds.includes(jf.id) ? C.primaryLight : C.white, color: form.positionIds.includes(jf.id) ? C.primary : C.textMid, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                                                    {jf.name}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {form.applicableTo === "employee" && (
                                    <div>
                                        <label style={{ fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 8, display: "block" }}>Select Employees</label>
                                        <div style={{ maxHeight: 160, overflowY: "auto", border: `1px solid ${C.border}`, borderRadius: 10 }}>
                                            {employees.map(emp => (
                                                <div key={emp.id} onClick={() => setForm(f => ({ ...f, employeeIds: f.employeeIds.includes(emp.id) ? f.employeeIds.filter(id => id !== emp.id) : [...f.employeeIds, emp.id] }))}
                                                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", cursor: "pointer", borderBottom: `1px solid ${C.borderLight}`, background: form.employeeIds.includes(emp.id) ? C.primaryLight : "transparent", transition: "background 0.1s" }}>
                                                    <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${form.employeeIds.includes(emp.id) ? C.primary : C.border}`, background: form.employeeIds.includes(emp.id) ? C.primary : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                        {form.employeeIds.includes(emp.id) && <Lucide.Check size={10} color="#fff" strokeWidth={3} />}
                                                    </div>
                                                    <Avatar name={emp.name} size={26} />
                                                    <div style={{ fontSize: 13, color: C.text }}>{emp.name} <span style={{ color: C.textMuted, fontSize: 11 }}>· {emp.dept}</span></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div onClick={() => setForm(f => ({ ...f, taxable: !f.taxable }))}
                                        style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${form.taxable ? C.primary : C.border}`, background: form.taxable ? C.primary : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                                        {form.taxable && <Lucide.Check size={11} color="#fff" strokeWidth={3} />}
                                    </div>
                                    <span style={{ fontSize: 13, color: C.text, cursor: "pointer" }} onClick={() => setForm(f => ({ ...f, taxable: !f.taxable }))}>Taxable allowance</span>
                                </div>
                            </div>
                            <div style={{ padding: "16px 24px", borderTop: `1px solid ${C.borderLight}`, display: "flex", justifyContent: "flex-end", gap: 10 }}>
                                <motion.button whileTap={{ scale: 0.97 }} onClick={closeForm} style={outlineBtnStyle(C)}>Cancel</motion.button>
                                <motion.button whileTap={{ scale: 0.97 }} onClick={save} style={primaryBtnStyle(C)}>
                                    <Icon C={C} n="save" size={14} color="#fff" />
                                    {editItem ? "Save Changes" : "Create Allowance"}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════
   2.  PERMISSIONS PAGE
   ═══════════════════════════════════════════════════════════════════ */

const MODULES = [
    { key: "dashboard", label: "Dashboard", icon: "layers", desc: "Overview stats and widgets" },
    { key: "timesheet", label: "Timesheet", icon: "calendar", desc: "Clock-in/out, attendance records" },
    { key: "leave", label: "Leave", icon: "calendar", desc: "Leave requests and approvals" },
    { key: "people", label: "People", icon: "users", desc: "Employee directory and profiles" },
    { key: "performance", label: "Performance", icon: "zap", desc: "Reviews, OKRs and feedback" },
    { key: "skills", label: "Skills & Talent", icon: "sparkle", desc: "Skill library, dev plans" },
    { key: "payroll", label: "Payroll", icon: "dollar", desc: "Salary, deductions, payslips" },
    { key: "reports", label: "Reports", icon: "receipt", desc: "Analytics and data exports" },
    { key: "org", label: "Org Structure", icon: "building", desc: "Org chart and hierarchy" },
    { key: "allowance", label: "Allowance", icon: "wallet", desc: "Allowance types and assignment" },
    { key: "devices", label: "Devices", icon: "settings", desc: "Biometric device management" },
    { key: "config", label: "Configurations", icon: "settings", desc: "System-wide settings" },
    { key: "settings", label: "Settings", icon: "settings", desc: "User preferences" },
];

const ACTIONS = [
    { key: "view", label: "View", icon: "eye", colorToken: "info" },
    { key: "create", label: "Create", icon: "plus", colorToken: "success" },
    { key: "edit", label: "Edit", icon: "edit", colorToken: "warning" },
    { key: "delete", label: "Delete", icon: "trash", colorToken: "danger" },
    { key: "export", label: "Export", icon: "download", colorToken: "primary" },
    { key: "approve", label: "Approve", icon: "checkCircle", colorToken: "info" },
];

/* Default permission matrix per job family */
const buildDefaultPermissions = (jobFamilies) => {
    const perms = {};
    jobFamilies.forEach(jf => {
        perms[jf.id] = {};
        MODULES.forEach(m => {
            perms[jf.id][m.key] = {};
            ACTIONS.forEach(a => {
                // Engineering, DevOps: full access except config
                if (["jf1", "jf6"].includes(jf.id)) {
                    perms[jf.id][m.key][a.key] = !["config", "allowance"].includes(m.key) || a.key === "view";
                }
                // Product: view most things, create/edit for people-related
                else if (jf.id === "jf2") {
                    perms[jf.id][m.key][a.key] = a.key === "view" || (["people", "performance", "skills"].includes(m.key) && ["create", "edit"].includes(a.key));
                }
                // HR Admin: full access
                else if (jf.id === "jf4") {
                    perms[jf.id][m.key][a.key] = true;
                }
                // Sales: limited access
                else if (jf.id === "jf3") {
                    perms[jf.id][m.key][a.key] = a.key === "view" && ["dashboard", "timesheet", "leave", "people", "performance", "skills"].includes(m.key);
                }
                // Finance: view all + full payroll/reports
                else if (jf.id === "jf5") {
                    perms[jf.id][m.key][a.key] = a.key === "view" || (["payroll", "reports", "allowance"].includes(m.key));
                }
                // QA, Design: basic access
                else {
                    perms[jf.id][m.key][a.key] = a.key === "view" && ["dashboard", "timesheet", "leave", "people", "performance", "skills"].includes(m.key);
                }
            });
        });
    });
    return perms;
};

export const PermissionsPage = ({ C, employees, jobFamilies }) => {
    const [tab, setTab] = useState("position");
    const [positionPerms, setPositionPerms] = useState(() => buildDefaultPermissions(jobFamilies));
    const [empOverrides, setEmpOverrides] = useState({});  // empId → { moduleKey: { actionKey: bool } }
    const [selectedPositionId, setSelectedPositionId] = useState(jobFamilies[0]?.id);
    const [selectedEmpId, setSelectedEmpId] = useState(null);
    const [searchEmp, setSearchEmp] = useState("");
    const [filterModule, setFilterModule] = useState("all");
    const [showSaved, setShowSaved] = useState(false);

    const togglePositionPerm = (moduleKey, actionKey) => {
        setPositionPerms(prev => ({
            ...prev,
            [selectedPositionId]: {
                ...prev[selectedPositionId],
                [moduleKey]: {
                    ...prev[selectedPositionId]?.[moduleKey],
                    [actionKey]: !prev[selectedPositionId]?.[moduleKey]?.[actionKey],
                }
            }
        }));
    };

    const toggleEmpOverride = (moduleKey, actionKey) => {
        if (!selectedEmpId) return;
        setEmpOverrides(prev => {
            const empPerms = prev[selectedEmpId] || {};
            const modPerms = empPerms[moduleKey] || {};
            // If override exists, remove it (revert to position default)
            const hasOverride = selectedEmpId in prev && moduleKey in prev[selectedEmpId] && actionKey in prev[selectedEmpId][moduleKey];
            if (hasOverride) {
                const updated = { ...empPerms, [moduleKey]: { ...modPerms } };
                delete updated[moduleKey][actionKey];
                if (Object.keys(updated[moduleKey]).length === 0) delete updated[moduleKey];
                return { ...prev, [selectedEmpId]: updated };
            } else {
                // Add override: flip from position default
                const emp = employees.find(e => e.id === selectedEmpId);
                const posId = emp?.familyId;
                const posDefault = positionPerms[posId]?.[moduleKey]?.[actionKey] ?? false;
                return {
                    ...prev,
                    [selectedEmpId]: {
                        ...empPerms,
                        [moduleKey]: {
                            ...modPerms,
                            [actionKey]: !posDefault,
                        }
                    }
                };
            }
        });
    };

    const getEffectivePerm = (empId, moduleKey, actionKey) => {
        const emp = employees.find(e => e.id === empId);
        const posId = emp?.familyId;
        const override = empOverrides[empId]?.[moduleKey]?.[actionKey];
        if (override !== undefined) return override;
        return positionPerms[posId]?.[moduleKey]?.[actionKey] ?? false;
    };

    const hasOverride = (empId, moduleKey, actionKey) => {
        return empOverrides[empId]?.[moduleKey]?.[actionKey] !== undefined;
    };

    const clearEmpOverrides = (empId) => {
        setEmpOverrides(prev => { const n = { ...prev }; delete n[empId]; return n; });
    };

    const saveAll = () => {
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2500);
    };

    const filteredEmps = employees.filter(e =>
        e.name.toLowerCase().includes(searchEmp.toLowerCase()) ||
        e.dept.toLowerCase().includes(searchEmp.toLowerCase())
    );

    const displayedModules = filterModule === "all" ? MODULES : MODULES.filter(m => m.key === filterModule);

    const selectedEmp = employees.find(e => e.id === selectedEmpId);
    const selectedPosition = jobFamilies.find(jf => jf.id === selectedPositionId);

    const countGranted = (posId) => {
        let count = 0;
        MODULES.forEach(m => ACTIONS.forEach(a => { if (positionPerms[posId]?.[m.key]?.[a.key]) count++; }));
        return count;
    };

    const countEmpOverrides = (empId) => {
        return Object.values(empOverrides[empId] || {}).reduce((s, mod) => s + Object.keys(mod).length, 0);
    };

    return (
        <div style={{ padding: "24px 28px", overflowY: "auto", flex: 1 }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: "0 0 4px", letterSpacing: "-0.5px" }}>Access & Permissions</h1>
                    <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>Control what each role and employee can view, create, edit, delete, export and approve</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <AnimatePresence>
                        {showSaved && (
                            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", background: C.successBg, border: `1px solid ${C.successBorder}`, borderRadius: 10, fontSize: 13, fontWeight: 600, color: C.success }}>
                                <Icon C={C} n="checkCircle" size={14} color={C.success} />
                                Permissions saved
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={saveAll}
                        style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", background: C.primary, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                        <Icon C={C} n="save" size={14} color="#fff" />
                        Save All Changes
                    </motion.button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20, background: C.bg, borderRadius: 10, padding: 5, width: "fit-content", border: `1px solid ${C.border}` }}>
                {[["position", "briefcase", "By Position / Role"], ["employee", "user", "By Employee"]].map(([key, icon, label]) => (
                    <motion.button key={key} whileTap={{ scale: 0.97 }} onClick={() => setTab(key)}
                        style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, background: tab === key ? C.white : "transparent", color: tab === key ? C.primary : C.textMid, boxShadow: tab === key ? C.shadow : "none", transition: "all 0.15s" }}>
                        <Icon C={C} n={icon} size={14} color={tab === key ? C.primary : C.textMid} />
                        {label}
                    </motion.button>
                ))}
            </div>

            {/* ── BY POSITION ────────────────────────────────────────────── */}
            {tab === "position" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16 }}>
                    {/* Position list */}
                    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", boxShadow: C.shadow, height: "fit-content" }}>
                        <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.borderLight}`, fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.6px" }}>Job Positions</div>
                        {jobFamilies.map(jf => (
                            <div key={jf.id} onClick={() => setSelectedPositionId(jf.id)}
                                style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", cursor: "pointer", background: selectedPositionId === jf.id ? C.primaryLight : "transparent", borderBottom: `1px solid ${C.borderLight}`, transition: "background 0.12s" }}>
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: jf.color, flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: selectedPositionId === jf.id ? C.primary : C.text }}>{jf.name}</div>
                                    <div style={{ fontSize: 11, color: C.textMuted }}>{countGranted(jf.id)} / {MODULES.length * ACTIONS.length} allowed</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Permission matrix */}
                    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", boxShadow: C.shadow }}>
                        {selectedPosition && (
                            <>
                                <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.borderLight}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: selectedPosition.color }} />
                                        <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{selectedPosition.name}</div>
                                        <span style={{ fontSize: 12, color: C.textMuted }}>— {employees.filter(e => e.familyId === selectedPositionId).length} employees</span>
                                    </div>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <motion.button whileTap={{ scale: 0.97 }}
                                            onClick={() => {
                                                setPositionPerms(prev => {
                                                    const updated = { ...prev[selectedPositionId] };
                                                    MODULES.forEach(m => { updated[m.key] = {}; ACTIONS.forEach(a => { updated[m.key][a.key] = true; }); });
                                                    return { ...prev, [selectedPositionId]: updated };
                                                });
                                            }}
                                            style={{ ...outlineBtnStyle(C), fontSize: 12, padding: "6px 12px" }}>
                                            Grant All
                                        </motion.button>
                                        <motion.button whileTap={{ scale: 0.97 }}
                                            onClick={() => {
                                                setPositionPerms(prev => {
                                                    const updated = { ...prev[selectedPositionId] };
                                                    MODULES.forEach(m => { updated[m.key] = {}; ACTIONS.forEach(a => { updated[m.key][a.key] = false; }); });
                                                    return { ...prev, [selectedPositionId]: updated };
                                                });
                                            }}
                                            style={{ ...dangerBtnStyle(C), fontSize: 12, padding: "6px 12px" }}>
                                            Revoke All
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Action legend */}
                                <div style={{ padding: "10px 20px", borderBottom: `1px solid ${C.borderLight}`, display: "flex", alignItems: "center", gap: 16 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginRight: 4 }}>Actions:</span>
                                    {ACTIONS.map(a => (
                                        <div key={a.key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C[a.colorToken] }} />
                                            <span style={{ fontSize: 11.5, fontWeight: 600, color: C.textMid }}>{a.label}</span>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ overflowX: "auto" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
                                        <thead>
                                            <tr style={{ background: C.tableHead }}>
                                                <th style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: `1px solid ${C.border}`, minWidth: 180 }}>Module</th>
                                                {ACTIONS.map(a => (
                                                    <th key={a.key} style={{ padding: "10px 12px", textAlign: "center", fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: `1px solid ${C.border}`, minWidth: 72 }}>
                                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                                                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: C[a.colorToken] }} />
                                                            {a.label}
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {MODULES.map((mod, idx) => (
                                                <tr key={mod.key} style={{ background: idx % 2 === 0 ? C.tableRow : C.tableHead, borderBottom: `1px solid ${C.borderLight}` }}>
                                                    <td style={{ padding: "11px 20px" }}>
                                                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{mod.label}</div>
                                                        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>{mod.desc}</div>
                                                    </td>
                                                    {ACTIONS.map(action => {
                                                        const granted = positionPerms[selectedPositionId]?.[mod.key]?.[action.key] ?? false;
                                                        return (
                                                            <td key={action.key} style={{ padding: "11px 12px", textAlign: "center" }}>
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.92 }}
                                                                    onClick={() => togglePositionPerm(mod.key, action.key)}
                                                                    title={`${granted ? "Revoke" : "Grant"} ${action.label} on ${mod.label}`}
                                                                    style={{
                                                                        width: 28, height: 28, borderRadius: 8, border: "none", cursor: "pointer",
                                                                        background: granted ? C[action.colorToken] + "22" : C.tableHead,
                                                                        display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto",
                                                                        transition: "all 0.15s",
                                                                        outline: granted ? `2px solid ${C[action.colorToken]}44` : "none",
                                                                    }}>
                                                                    {granted
                                                                        ? <Lucide.Check size={14} color={C[action.colorToken]} strokeWidth={2.5} />
                                                                        : <Lucide.X size={13} color={C.textMuted} strokeWidth={2} />
                                                                    }
                                                                </motion.button>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            )}

            {/* ── BY EMPLOYEE ──────────────────────────────────────────────── */}
            {tab === "employee" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16 }}>
                    {/* Employee list */}
                    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", boxShadow: C.shadow, display: "flex", flexDirection: "column", maxHeight: 620 }}>
                        <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.borderLight}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px" }}>
                                <Icon C={C} n="search" size={13} color={C.textMuted} />
                                <input value={searchEmp} onChange={e => setSearchEmp(e.target.value)} placeholder="Search employees…"
                                    style={{ border: "none", background: "transparent", outline: "none", fontSize: 12.5, color: C.text, width: "100%", fontFamily: "inherit" }} />
                            </div>
                        </div>
                        <div style={{ overflowY: "auto", flex: 1 }}>
                            {filteredEmps.map(emp => {
                                const overrideCount = countEmpOverrides(emp.id);
                                return (
                                    <div key={emp.id} onClick={() => setSelectedEmpId(emp.id)}
                                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: "pointer", background: selectedEmpId === emp.id ? C.primaryLight : "transparent", borderBottom: `1px solid ${C.borderLight}`, transition: "background 0.12s" }}>
                                        <Avatar name={emp.name} size={34} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{emp.name}</div>
                                            <div style={{ fontSize: 11, color: C.textMuted }}>{emp.level}</div>
                                        </div>
                                        {overrideCount > 0 && (
                                            <span style={{ fontSize: 10, fontWeight: 800, background: C.warningBg, color: C.warning, border: `1px solid ${C.warningBorder}`, borderRadius: 6, padding: "2px 6px" }}>
                                                {overrideCount} override{overrideCount > 1 ? "s" : ""}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Employee permission detail */}
                    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", boxShadow: C.shadow }}>
                        {!selectedEmp ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 360, color: C.textMuted }}>
                                <Icon C={C} n="shield" size={44} color={C.border} />
                                <div style={{ marginTop: 14, fontSize: 14, fontWeight: 600 }}>Select an employee to manage their permissions</div>
                                <div style={{ marginTop: 6, fontSize: 12, color: C.textMuted }}>Overrides are layered on top of the position defaults</div>
                            </div>
                        ) : (
                            <>
                                <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.borderLight}`, display: "flex", alignItems: "center", gap: 14 }}>
                                    <Avatar name={selectedEmp.name} size={42} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{selectedEmp.name}</div>
                                        <div style={{ fontSize: 12, color: C.textMuted }}>{selectedEmp.level} · {selectedEmp.dept} · Inherits from <span style={{ color: C.primary, fontWeight: 700 }}>{jobFamilies.find(jf => jf.id === selectedEmp.familyId)?.name}</span></div>
                                    </div>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        {countEmpOverrides(selectedEmp.id) > 0 && (
                                            <motion.button whileTap={{ scale: 0.97 }} onClick={() => clearEmpOverrides(selectedEmp.id)}
                                                style={{ ...outlineBtnStyle(C), fontSize: 12, padding: "6px 12px" }}>
                                                <Icon C={C} n="refresh" size={12} color={C.textMid} />
                                                Reset to Defaults
                                            </motion.button>
                                        )}
                                    </div>
                                </div>

                                {/* Legend */}
                                <div style={{ padding: "10px 20px", borderBottom: `1px solid ${C.borderLight}`, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                                    {[
                                        { dot: C.success, label: "Granted (inherited)" },
                                        { dot: C.warning, label: "Overridden (custom)" },
                                        { dot: C.border, label: "Denied" },
                                    ].map(({ dot, label }) => (
                                        <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <div style={{ width: 10, height: 10, borderRadius: 3, background: dot }} />
                                            <span style={{ fontSize: 11.5, color: C.textMid, fontWeight: 500 }}>{label}</span>
                                        </div>
                                    ))}
                                    <span style={{ fontSize: 11.5, color: C.textMuted, marginLeft: "auto" }}>Click any cell to toggle an override</span>
                                </div>

                                <div style={{ overflowX: "auto" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
                                        <thead>
                                            <tr style={{ background: C.tableHead }}>
                                                <th style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: `1px solid ${C.border}`, minWidth: 180 }}>Module</th>
                                                {ACTIONS.map(a => (
                                                    <th key={a.key} style={{ padding: "10px 12px", textAlign: "center", fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: `1px solid ${C.border}`, minWidth: 72 }}>
                                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                                                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: C[a.colorToken] }} />
                                                            {a.label}
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {MODULES.map((mod, idx) => (
                                                <tr key={mod.key} style={{ background: idx % 2 === 0 ? C.tableRow : C.tableHead, borderBottom: `1px solid ${C.borderLight}` }}>
                                                    <td style={{ padding: "11px 20px" }}>
                                                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{mod.label}</div>
                                                        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>{mod.desc}</div>
                                                    </td>
                                                    {ACTIONS.map(action => {
                                                        const effective = getEffectivePerm(selectedEmp.id, mod.key, action.key);
                                                        const isOverride = hasOverride(selectedEmp.id, mod.key, action.key);
                                                        let bg, borderColor, iconColor;
                                                        if (isOverride && effective) { bg = C.warningBg; borderColor = C.warningBorder; iconColor = C.warning; }
                                                        else if (isOverride && !effective) { bg = C.dangerBg; borderColor = C.dangerBorder; iconColor = C.danger; }
                                                        else if (effective) { bg = C.successBg; borderColor = C.successBorder; iconColor = C.success; }
                                                        else { bg = C.tableHead; borderColor = C.border; iconColor = C.textMuted; }

                                                        return (
                                                            <td key={action.key} style={{ padding: "11px 12px", textAlign: "center" }}>
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.92 }}
                                                                    onClick={() => toggleEmpOverride(mod.key, action.key)}
                                                                    title={`${isOverride ? "Remove override — " : ""}${effective ? "Currently granted" : "Currently denied"}`}
                                                                    style={{
                                                                        width: 28, height: 28, borderRadius: 8,
                                                                        border: `1px solid ${borderColor}`,
                                                                        background: bg, cursor: "pointer",
                                                                        display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto",
                                                                        transition: "all 0.15s",
                                                                        position: "relative",
                                                                    }}>
                                                                    {effective
                                                                        ? <Lucide.Check size={14} color={iconColor} strokeWidth={2.5} />
                                                                        : <Lucide.X size={13} color={iconColor} strokeWidth={2} />
                                                                    }
                                                                    {isOverride && (
                                                                        <div style={{ position: "absolute", top: -3, right: -3, width: 8, height: 8, borderRadius: "50%", background: C.warning, border: `1.5px solid ${C.white}` }} />
                                                                    )}
                                                                </motion.button>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

/* ─── Shared style helpers ───────────────────────────────────────── */
const inputStyle = (C) => ({
    padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 13,
    color: C.text, outline: "none", background: C.white, width: "100%",
    boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 0.15s",
});

const labelStyle = (C) => ({ fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 6, display: "block" });

const primaryBtnStyle = (C) => ({
    display: "flex", alignItems: "center", gap: 7, padding: "9px 18px",
    background: C.primary, color: "#fff", border: "none", borderRadius: 9,
    fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
});

const outlineBtnStyle = (C) => ({
    display: "flex", alignItems: "center", gap: 7, padding: "9px 16px",
    background: C.white, color: C.textMid, border: `1px solid ${C.border}`,
    borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
});

const dangerBtnStyle = (C) => ({
    display: "flex", alignItems: "center", gap: 7, padding: "9px 16px",
    background: C.dangerBg, color: C.danger, border: `1px solid ${C.dangerBorder}`,
    borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
});
