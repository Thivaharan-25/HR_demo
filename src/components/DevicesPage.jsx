/**
 * DevicesPage.jsx
 * Full end-to-end biometric hardware device management
 * Covers: Device Registry, Enrolment, Simulate Scan (clock-in/out),
 * Event Log, Template Deletion, Register Device, Consent flow
 *
 * Logically maps to BIOMETRIC_INTEGRATION_SPEC.md — System B
 */

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";

/* ─── Pull shared design tokens from parent via prop or fallback ─ */
// The component receives { C, employees, attendance, setAttendance }
// from App.jsx DataCtx. All colours come from C (the proxy).

/* ─────────────────────────────────────────────────────────────────
   INITIAL DEMO DATA
   Mirrors what you see in the screenshot + extended for full demo
   ───────────────────────────────────────────────────────────────── */
const INITIAL_DEVICES = [
  {
    id: "DEV001",
    name: "Main Entrance — HQ",
    model: "ZKTeco K40 Pro",
    manufacturer: "ZKTeco",
    type: "Fingerprint Scanner",
    typeCode: "fingerprint",
    location: "HQ London",
    branch: "HQ",
    ip: "192.168.1.101",
    protocol: "REST Push",
    status: "Online",
    lastHeartbeat: new Date(Date.now() - 2 * 60000), // 2 min ago
    eventsToday: 87,
    enrolled: ["EMP001", "EMP005", "EMP007", "EMP010", "EMP013"],
    hmacConfigured: true,
    liveSensitivity: "Medium",
    pinFallback: true,
    autoClockOut: "23:59",
    queueDepth: 0,
    firmwareVersion: "2.4.1",
    serialNumber: "ZK-K40-2024-00142",
    consentPending: [],
  },
  {
    id: "DEV002",
    name: "Exit Gate — HQ",
    model: "Suprema BioLite N2",
    manufacturer: "Suprema",
    type: "Face Recognition",
    typeCode: "face",
    location: "HQ London",
    branch: "HQ",
    ip: "192.168.1.102",
    protocol: "Suprema BioStar API",
    status: "Online",
    lastHeartbeat: new Date(Date.now() - 1 * 60000),
    eventsToday: 82,
    enrolled: ["EMP001", "EMP005", "EMP010", "EMP012"],
    hmacConfigured: true,
    liveSensitivity: "High",
    pinFallback: false,
    autoClockOut: "23:59",
    queueDepth: 0,
    firmwareVersion: "3.1.0",
    serialNumber: "SU-BL-2023-00889",
    consentPending: [],
  },
  {
    id: "DEV003",
    name: "Entrance — Colombo",
    model: "HikVision DS-K1T604",
    manufacturer: "HikVision",
    type: "Multi-Modal",
    typeCode: "multimodal",
    location: "Colombo Office",
    branch: "Colombo",
    ip: "10.0.1.50",
    protocol: "HikVision ISAPI",
    status: "Offline",
    lastHeartbeat: new Date(Date.now() - 2 * 60 * 60000), // 2 hours ago
    eventsToday: 0,
    enrolled: ["EMP015", "EMP008", "EMP014"],
    hmacConfigured: true,
    liveSensitivity: "Medium",
    pinFallback: true,
    autoClockOut: "23:59",
    queueDepth: 34, // queued offline events
    firmwareVersion: "1.9.2",
    serialNumber: "HK-DS-2024-00311",
    consentPending: [],
  },
  {
    id: "DEV004",
    name: "Canteen Terminal",
    model: "Anviz T5 Pro",
    manufacturer: "Anviz",
    type: "Fingerprint Scanner",
    typeCode: "fingerprint",
    location: "HQ London",
    branch: "HQ",
    ip: "192.168.1.105",
    protocol: "Anviz CloudClocking API",
    status: "Online",
    lastHeartbeat: new Date(Date.now() - 5 * 60000),
    eventsToday: 143,
    enrolled: ["EMP001", "EMP003", "EMP005", "EMP006", "EMP007", "EMP010", "EMP012"],
    hmacConfigured: true,
    liveSensitivity: "Low",
    pinFallback: true,
    autoClockOut: "23:59",
    queueDepth: 0,
    firmwareVersion: "2.0.5",
    serialNumber: "AV-T5-2023-00204",
    consentPending: [],
  },
];

// Simulated event log — per device
const generateEvents = (deviceId, count = 20) => {
  const types = ["clock_in", "clock_out", "pin_override", "liveness_failed", "match_failed"];
  const methods = ["fingerprint", "face"];
  const empIds = ["EMP001", "EMP003", "EMP005", "EMP007", "EMP010", "EMP012", "EMP015"];
  const events = [];
  for (let i = 0; i < count; i++) {
    const t = new Date(Date.now() - i * 18 * 60000);
    const eventType = i === 3 ? "liveness_failed" : i === 7 ? "pin_override" : (i % 2 === 0 ? "clock_in" : "clock_out");
    events.push({
      event_id: `EVT-${deviceId}-${i.toString().padStart(3,"0")}`,
      device_id: deviceId,
      employee_token: `TKN-${empIds[i % empIds.length]}-${deviceId}`,
      employee_name: ["James Perera","David Chen","Rayan Kumar","Arjun Mehta","Priya Nair","Tina Mendis","Leila Hassan"][i % 7],
      event_type: eventType,
      timestamp: t.toISOString(),
      match_score: eventType === "liveness_failed" ? null : Math.floor(85 + Math.random() * 14),
      match_method: methods[i % 2],
      liveness_check: eventType === "liveness_failed" ? "failed" : "passed",
      source_sync: i > 15 ? "late_sync" : "realtime",
      hmac_valid: true,
    });
  }
  return events;
};

/* ─── Sub-components ─────────────────────────────────────────── */

const DeviceTypeIcon = ({ type, size = 20, color }) => {
  if (type === "face") return <Lucide.ScanFace size={size} color={color} />;
  if (type === "multimodal") return <Lucide.Fingerprint size={size} color={color} />;
  return <Lucide.Fingerprint size={size} color={color} />;
};

const StatusDot = ({ status }) => {
  const colors = { Online: "#10B981", Offline: "#EF4444", Warning: "#F59E0B" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <motion.span
        animate={status === "Online" ? { opacity: [1, 0.4, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
        style={{ width: 7, height: 7, borderRadius: "50%", background: colors[status] || "#94A3B8", display: "inline-block" }}
      />
      <span style={{ fontSize: 12, fontWeight: 700, color: colors[status] || "#94A3B8" }}>{status}</span>
    </span>
  );
};

const timeAgo = (date) => {
  if (!date) return "Never";
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};

/* ─── MAIN COMPONENT ─────────────────────────────────────────── */
export default function DevicesPage({ C, employees = [], onSimulateScan }) {
  const [devices, setDevices] = useState(INITIAL_DEVICES);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [modal, setModal] = useState(null); // "register" | "enrol" | "eventlog" | "configure" | "simulate" | "decommission" | "consent"
  const [eventLogs, setEventLogs] = useState(() => {
    const logs = {};
    INITIAL_DEVICES.forEach(d => { logs[d.id] = generateEvents(d.id); });
    return logs;
  });
  const [tick, setTick] = useState(0);

  // Simulate heartbeat ticking
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  // Live heartbeat simulation — online devices update lastHeartbeat
  useEffect(() => {
    setDevices(prev => prev.map(d =>
      d.status === "Online"
        ? { ...d, lastHeartbeat: new Date() }
        : d
    ));
  }, [tick]);

  const openModal = (type, device = null) => {
    setSelectedDevice(device);
    setModal(type);
  };
  const closeModal = () => { setModal(null); setSelectedDevice(null); };

  const handleSimulateScan = (device, empId, eventType) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;
    const token = `TKN-${empId}-${device.id}`;
    const matchScore = Math.floor(88 + Math.random() * 11);
    const event = {
      event_id: `EVT-${device.id}-${Date.now()}`,
      device_id: device.id,
      employee_token: token,
      employee_name: emp.name,
      event_type: eventType,
      timestamp: new Date().toISOString(),
      match_score: matchScore,
      match_method: device.typeCode === "face" ? "face" : "fingerprint",
      liveness_check: "passed",
      source_sync: "realtime",
      hmac_valid: true,
    };
    // Prepend to event log
    setEventLogs(prev => ({
      ...prev,
      [device.id]: [event, ...(prev[device.id] || [])],
    }));
    // Increment device events today
    setDevices(prev => prev.map(d =>
      d.id === device.id ? { ...d, eventsToday: d.eventsToday + 1 } : d
    ));
    // Notify parent to update attendance
    if (onSimulateScan) onSimulateScan(empId, eventType, device);
    return event;
  };

  const handleEnrolEmployee = (device, empId) => {
    setDevices(prev => prev.map(d =>
      d.id === device.id
        ? { ...d, enrolled: d.enrolled.includes(empId) ? d.enrolled : [...d.enrolled, empId] }
        : d
    ));
    // Add enrolment event to log
    const emp = employees.find(e => e.id === empId);
    const enrolEvent = {
      event_id: `ENROL-${device.id}-${Date.now()}`,
      device_id: device.id,
      employee_token: `TKN-${empId}-${device.id}`,
      employee_name: emp?.name || empId,
      event_type: "enrolment",
      timestamp: new Date().toISOString(),
      match_score: 97,
      match_method: device.typeCode === "face" ? "face" : "fingerprint",
      liveness_check: "passed",
      source_sync: "realtime",
      hmac_valid: true,
    };
    setEventLogs(prev => ({ ...prev, [device.id]: [enrolEvent, ...(prev[device.id] || [])] }));
  };

  const handleRemoveEnrolment = (device, empId) => {
    setDevices(prev => prev.map(d =>
      d.id === device.id
        ? { ...d, enrolled: d.enrolled.filter(id => id !== empId) }
        : d
    ));
  };

  const handleDecommission = (device) => {
    // Mark all enrolled as having templates deleted
    setDevices(prev => prev.map(d =>
      d.id === device.id ? { ...d, status: "Offline", enrolled: [], eventsToday: 0 } : d
    ));
    closeModal();
  };

  const handleRegisterDevice = (formData) => {
    const newDevice = {
      id: `DEV${String(devices.length + 1).padStart(3, "0")}`,
      ...formData,
      status: "Online",
      lastHeartbeat: new Date(),
      eventsToday: 0,
      enrolled: [],
      hmacConfigured: true,
      queueDepth: 0,
      consentPending: [],
    };
    setDevices(prev => [...prev, newDevice]);
    setEventLogs(prev => ({ ...prev, [newDevice.id]: [] }));
    closeModal();
  };

  // Counts
  const offlineCount = devices.filter(d => d.status === "Offline").length;
  const totalEvents = devices.reduce((s, d) => s + d.eventsToday, 0);
  const totalEnrolled = [...new Set(devices.flatMap(d => d.enrolled))].length;

  return (
    <div style={{ padding: "24px 28px", overflowY: "auto", flex: 1, fontFamily: "inherit" }}>
      {/* ── Page Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0, letterSpacing: "-0.4px" }}>Hardware Devices</h1>
          <p style={{ fontSize: 13, color: C.textMuted, margin: "4px 0 0" }}>
            {devices.length} biometric terminals registered · {offlineCount} offline
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 6px 20px rgba(99,102,241,0.3)" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => openModal("register")}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${C.primary}, #8A7CF0)`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
        >
          <Lucide.Plus size={15} color="#fff" />
          Register Device
        </motion.button>
      </div>

      {/* ── Stats Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
        {[
          { label: "Total Devices", value: String(devices.length), color: C.primary },
          { label: "Online", value: String(devices.filter(d => d.status === "Online").length), color: C.success },
          { label: "Events Today", value: String(totalEvents), color: C.info },
          { label: "Enrolled Employees", value: String(totalEnrolled), color: C.warning },
        ].map(s => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", position: "relative", overflow: "hidden", boxShadow: C.shadow }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: s.color, borderRadius: "12px 0 0 12px" }} />
            <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 500, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: C.text }}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Offline Alert Banner ── */}
      <AnimatePresence>
        {offlineCount > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ marginBottom: 18, padding: "12px 18px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Lucide.AlertTriangle size={16} color="#EF4444" />
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#DC2626" }}>
                  {devices.filter(d => d.status === "Offline").map(d => d.name).join(", ")} offline
                </span>
                <span style={{ fontSize: 12, color: "#B91C1C", marginLeft: 8 }}>
                  Employees at affected locations may need manual attendance logging.
                </span>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }}
              onClick={() => openModal("eventlog", devices.find(d => d.status === "Offline"))}
              style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #FECACA", background: C.white, color: "#DC2626", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              View Details
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Device Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {devices.map((device) => (
          <DeviceCard
            key={device.id}
            device={device}
            C={C}
            employees={employees}
            onConfigure={() => openModal("configure", device)}
            onEventLog={() => openModal("eventlog", device)}
            onEnrol={() => openModal("enrol", device)}
            onSimulate={() => openModal("simulate", device)}
            onDecommission={() => openModal("decommission", device)}
          />
        ))}
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {modal === "register" && (
          <RegisterDeviceModal C={C} onClose={closeModal} onSave={handleRegisterDevice} />
        )}
        {modal === "configure" && selectedDevice && (
          <ConfigureDeviceModal C={C} device={selectedDevice} onClose={closeModal}
            onSave={(updated) => { setDevices(prev => prev.map(d => d.id === updated.id ? updated : d)); closeModal(); }} />
        )}
        {modal === "eventlog" && selectedDevice && (
          <EventLogModal C={C} device={selectedDevice} events={eventLogs[selectedDevice.id] || []} onClose={closeModal} />
        )}
        {modal === "enrol" && selectedDevice && (
          <EnrolModal C={C} device={selectedDevice} employees={employees}
            onEnrol={(empId) => handleEnrolEmployee(selectedDevice, empId)}
            onRemove={(empId) => handleRemoveEnrolment(selectedDevice, empId)}
            onClose={closeModal} />
        )}
        {modal === "simulate" && selectedDevice && (
          <SimulateScanModal C={C} device={selectedDevice} employees={employees}
            onScan={(empId, eventType) => handleSimulateScan(selectedDevice, empId, eventType)}
            onClose={closeModal} />
        )}
        {modal === "decommission" && selectedDevice && (
          <DecommissionModal C={C} device={selectedDevice}
            onConfirm={() => handleDecommission(selectedDevice)}
            onClose={closeModal} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   DEVICE CARD
   ───────────────────────────────────────────────────────────────── */
function DeviceCard({ device, C, employees, onConfigure, onEventLog, onEnrol, onSimulate, onDecommission }) {
  const typeColors = { fingerprint: "#6366F1", face: "#3B82F6", multimodal: "#8B5CF6" };
  const typeColor = typeColors[device.typeCode] || C.primary;
  const enrolledNames = employees.filter(e => device.enrolled.includes(e.id));

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
      style={{ background: C.white, border: `1px solid ${device.status === "Offline" ? "#FECACA" : C.border}`, borderRadius: 14, overflow: "hidden", boxShadow: C.shadow, transition: "box-shadow 0.2s" }}>

      {/* Card Header */}
      <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${C.borderLight}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: typeColor + "18", border: `1.5px solid ${typeColor}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <DeviceTypeIcon type={device.typeCode} size={20} color={typeColor} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14.5, color: C.text, lineHeight: 1.2 }}>{device.name}</div>
              <div style={{ fontSize: 11.5, color: C.textMuted, marginTop: 2 }}>{device.model}</div>
            </div>
          </div>
          <StatusDot status={device.status} />
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: "14px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
        {[
          { label: "TYPE", value: device.type },
          { label: "IP ADDRESS", value: device.ip },
          { label: "LOCATION", value: device.location },
          { label: "LAST HEARTBEAT", value: timeAgo(device.lastHeartbeat) },
        ].map(f => (
          <div key={f.label}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>{f.label}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{f.value}</div>
          </div>
        ))}
      </div>

      {/* Enrolled employees strip */}
      <div style={{ padding: "0 20px 14px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
          ENROLLED ({device.enrolled.length})
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {enrolledNames.slice(0, 5).map(e => (
            <div key={e.id} title={e.name} style={{ width: 28, height: 28, borderRadius: 8, background: typeColor + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: typeColor }}>
              {e.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
            </div>
          ))}
          {device.enrolled.length > 5 && (
            <div style={{ width: 28, height: 28, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: C.textMuted }}>
              +{device.enrolled.length - 5}
            </div>
          )}
          {device.enrolled.length === 0 && <span style={{ fontSize: 11, color: C.textMuted, fontStyle: "italic" }}>No employees enrolled</span>}
        </div>
      </div>

      {/* Events + Queue */}
      <div style={{ padding: "10px 20px", background: C.bg, borderTop: `1px solid ${C.borderLight}`, display: "flex", alignItems: "center", gap: 16 }}>
        <div>
          <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, textTransform: "uppercase" }}>Events Today</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: device.eventsToday > 0 ? C.success : C.textMuted }}>{device.eventsToday}</div>
        </div>
        {device.queueDepth > 0 && (
          <div style={{ padding: "4px 10px", borderRadius: 20, background: "#FEF2F2", border: "1px solid #FECACA" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#EF4444" }}>⚠ {device.queueDepth} queued (offline)</span>
          </div>
        )}
        {device.hmacConfigured && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
            <Lucide.ShieldCheck size={12} color={C.success} />
            <span style={{ fontSize: 10, color: C.success, fontWeight: 600 }}>HMAC</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ padding: "12px 20px", display: "flex", gap: 8, borderTop: `1px solid ${C.borderLight}`, flexWrap: "wrap" }}>
        <ActionBtn icon={Lucide.Zap} label="Simulate Scan" color={C.success} onClick={onSimulate} disabled={device.status === "Offline"} C={C} />
        <ActionBtn icon={Lucide.UserPlus} label="Enrol" color={C.primary} onClick={onEnrol} C={C} />
        <ActionBtn icon={Lucide.List} label="Event Log" color={C.info} onClick={onEventLog} C={C} />
        <ActionBtn icon={Lucide.Settings2} label="Configure" color={C.textMid} onClick={onConfigure} C={C} />
        <ActionBtn icon={Lucide.Trash2} label="Decommission" color={C.danger} onClick={onDecommission} C={C} danger />
      </div>
    </motion.div>
  );
}

function ActionBtn({ icon: Icon, label, color, onClick, disabled, danger, C }) {
  return (
    <motion.button whileHover={!disabled ? { scale: 1.03 } : {}} whileTap={!disabled ? { scale: 0.97 } : {}}
      onClick={!disabled ? onClick : undefined}
      style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: `1px solid ${danger ? "#FECACA" : C.border}`, background: danger ? "#FEF2F2" : C.white, color: disabled ? C.textMuted : color, fontSize: 12, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1, fontFamily: "inherit", transition: "all 0.15s" }}>
      <Icon size={12} />
      {label}
    </motion.button>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MODAL SHELL
   ───────────────────────────────────────────────────────────────── */
function ModalShell({ title, subtitle, onClose, children, width = 560, C }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.45)", backdropFilter: "blur(8px)" }} />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        style={{ position: "relative", width: "100%", maxWidth: width, maxHeight: "90vh", background: C.white, borderRadius: 18, boxShadow: "0 24px 60px rgba(0,0,0,0.22)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 22px", borderBottom: `1px solid ${C.borderLight}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{subtitle}</div>}
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
            style={{ width: 30, height: 30, borderRadius: "50%", border: `1px solid ${C.border}`, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Lucide.X size={14} color={C.textMid} />
          </motion.button>
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>{children}</div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SIMULATE SCAN MODAL
   The core demo interaction — pick employee, pick event type,
   fire mock biometric scan, see the event payload.
   ───────────────────────────────────────────────────────────────── */
function SimulateScanModal({ device, employees, C, onScan, onClose }) {
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [eventType, setEventType] = useState("clock_in");
  const [lastEvent, setLastEvent] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null); // "success" | "liveness_fail" | "match_fail"

  const enrolledEmployees = employees.filter(e => device.enrolled.includes(e.id));

  const handleScan = async () => {
    if (!selectedEmp) return;
    setScanning(true);
    setScanResult(null);
    setLastEvent(null);
    // Simulate 1.2s processing
    await new Promise(r => setTimeout(r, 1200));
    const roll = Math.random();
    if (roll > 0.92) {
      setScanResult("liveness_fail");
      setScanning(false);
      return;
    }
    if (roll > 0.88) {
      setScanResult("match_fail");
      setScanning(false);
      return;
    }
    const event = onScan(selectedEmp, eventType);
    setLastEvent(event);
    setScanResult("success");
    setScanning(false);
  };

  return (
    <ModalShell title={`Simulate Scan — ${device.name}`} subtitle="Demo: trigger a mock biometric clock event" C={C} onClose={onClose} width={600}>
      <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Info banner */}
        <div style={{ padding: "12px 16px", background: C.infoBg, border: `1px solid ${C.infoBorder}`, borderRadius: 10, display: "flex", gap: 10 }}>
          <Lucide.Info size={16} color={C.info} style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12.5, color: C.info, lineHeight: 1.5 }}>
            In production, the physical terminal fires this event automatically when an employee scans. This button simulates that hardware event for demo purposes.
          </span>
        </div>

        {/* Select employee */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>Select Enrolled Employee</div>
          {enrolledEmployees.length === 0 && (
            <div style={{ padding: 14, background: C.bg, borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, color: C.textMuted, textAlign: "center" }}>
              No employees enrolled on this device. Use the Enrol button first.
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {enrolledEmployees.map(emp => (
              <motion.div key={emp.id} whileHover={{ x: 2 }} onClick={() => setSelectedEmp(emp.id)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${selectedEmp === emp.id ? C.primary : C.border}`, background: selectedEmp === emp.id ? C.primaryLight : C.white, cursor: "pointer", transition: "all 0.15s" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: C.primary, flexShrink: 0 }}>
                  {emp.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{emp.name}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{emp.level} · {emp.dept}</div>
                </div>
                {selectedEmp === emp.id && <Lucide.CheckCircle2 size={16} color={C.primary} />}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Event type toggle */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>Event Type</div>
          <div style={{ display: "flex", gap: 10 }}>
            {[["clock_in", "Clock In", Lucide.LogIn, C.success], ["clock_out", "Clock Out", Lucide.LogOut, C.danger]].map(([val, label, Icon2, col]) => (
              <motion.div key={val} whileHover={{ scale: 1.02 }} onClick={() => setEventType(val)}
                style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${eventType === val ? col : C.border}`, background: eventType === val ? col + "15" : C.white, cursor: "pointer", transition: "all 0.15s" }}>
                <Icon2 size={16} color={eventType === val ? col : C.textMuted} />
                <span style={{ fontSize: 13, fontWeight: 700, color: eventType === val ? col : C.textMid }}>{label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scan button */}
        <motion.button whileHover={!scanning && selectedEmp ? { scale: 1.02 } : {}} whileTap={!scanning && selectedEmp ? { scale: 0.97 } : {}}
          onClick={handleScan} disabled={!selectedEmp || scanning}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "13px", borderRadius: 12, border: "none", background: !selectedEmp || scanning ? C.border : `linear-gradient(135deg, ${C.primary}, #8A7CF0)`, color: "#fff", fontSize: 14, fontWeight: 700, cursor: !selectedEmp || scanning ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "background 0.2s" }}>
          {scanning
            ? <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} style={{ width: 18, height: 18, borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff" }} /> Processing scan…</>
            : <><Lucide.Fingerprint size={18} color="#fff" /> Fire Biometric Event</>}
        </motion.button>

        {/* Result */}
        <AnimatePresence>
          {scanResult === "success" && lastEvent && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: C.successBg, border: `1px solid ${C.successBorder}`, borderRadius: 12, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Lucide.CheckCircle2 size={18} color={C.success} />
                <span style={{ fontSize: 13, fontWeight: 800, color: C.success }}>Event Processed Successfully</span>
              </div>
              <EventPayloadView event={lastEvent} C={C} />
            </motion.div>
          )}
          {scanResult === "liveness_fail" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: 16, display: "flex", gap: 10 }}>
              <Lucide.ShieldAlert size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#DC2626" }}>Liveness Check Failed</div>
                <div style={{ fontSize: 12, color: "#B91C1C", marginTop: 4 }}>Anti-spoofing detected a photo or mask. Event logged. HR Admin alerted if this repeats.</div>
              </div>
            </motion.div>
          )}
          {scanResult === "match_fail" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: C.warningBg, border: `1px solid ${C.warningBorder}`, borderRadius: 12, padding: 16, display: "flex", gap: 10 }}>
              <Lucide.AlertTriangle size={18} color={C.warning} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.warning }}>Biometric Match Failed</div>
                <div style={{ fontSize: 12, color: "#92400E", marginTop: 4 }}>Template did not match. Employee may retry (3 attempts before PIN fallback).</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ModalShell>
  );
}

function EventPayloadView({ event, C }) {
  const fields = [
    ["event_id", event.event_id],
    ["device_id", event.device_id],
    ["employee_token", event.employee_token],
    ["event_type", event.event_type],
    ["timestamp_utc", event.timestamp],
    ["match_score", event.match_score ? `${event.match_score} / 100` : "—"],
    ["match_method", event.match_method],
    ["liveness_check", event.liveness_check],
    ["hmac_valid", event.hmac_valid ? "✓ Valid" : "✗ Invalid"],
    ["source_sync", event.source_sync],
  ];
  return (
    <div style={{ background: "#0F172A", borderRadius: 10, padding: 14, fontFamily: "monospace", fontSize: 11.5 }}>
      <div style={{ color: "#6366F1", marginBottom: 6, fontWeight: 700 }}>// Inbound Event Payload</div>
      {fields.map(([k, v]) => (
        <div key={k} style={{ display: "flex", gap: 8, marginBottom: 3 }}>
          <span style={{ color: "#A5B4FC", minWidth: 140 }}>{k}:</span>
          <span style={{ color: k === "event_type" ? "#34D399" : k === "hmac_valid" ? "#34D399" : "#E2E8F0" }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   EVENT LOG MODAL
   ───────────────────────────────────────────────────────────────── */
function EventLogModal({ device, events, C, onClose }) {
  const [filter, setFilter] = useState("All");
  const eventTypes = ["All", "clock_in", "clock_out", "enrolment", "pin_override", "liveness_failed", "match_failed", "late_sync"];
  const filtered = filter === "All" ? events : events.filter(e => e.event_type === filter || e.source_sync === filter);

  const typeColors = {
    clock_in: C.success, clock_out: C.info, enrolment: C.primary,
    pin_override: C.warning, liveness_failed: C.danger, match_failed: C.danger,
  };

  return (
    <ModalShell title={`Event Log — ${device.name}`} subtitle={`${events.length} total events · ${device.status}`} C={C} onClose={onClose} width={740}>
      <div style={{ padding: "16px 22px" }}>
        {/* Filter pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {eventTypes.map(t => (
            <motion.button key={t} whileHover={{ scale: 1.02 }} onClick={() => setFilter(t)}
              style={{ padding: "4px 12px", borderRadius: 20, border: `1px solid ${filter === t ? C.primary : C.border}`, background: filter === t ? C.primaryLight : C.white, color: filter === t ? C.primary : C.textMid, fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.12s" }}>
              {t}
            </motion.button>
          ))}
        </div>
        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.tableHead }}>
                {["Timestamp", "Employee", "Event Type", "Match Score", "Method", "Sync", "HMAC"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 10.5, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((ev) => (
                <tr key={ev.event_id}>
                  <td style={{ padding: "9px 12px", fontSize: 11.5, color: C.textMuted, fontFamily: "monospace", borderBottom: `1px solid ${C.borderLight}` }}>
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </td>
                  <td style={{ padding: "9px 12px", fontSize: 12.5, fontWeight: 600, color: C.text, borderBottom: `1px solid ${C.borderLight}` }}>
                    {ev.employee_name || "—"}
                  </td>
                  <td style={{ padding: "9px 12px", borderBottom: `1px solid ${C.borderLight}` }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: (typeColors[ev.event_type] || C.textMid) + "18", color: typeColors[ev.event_type] || C.textMid, border: `1px solid ${(typeColors[ev.event_type] || C.border)}33` }}>
                      {ev.event_type}
                    </span>
                  </td>
                  <td style={{ padding: "9px 12px", fontSize: 12.5, fontWeight: 700, color: ev.match_score > 90 ? C.success : ev.match_score ? C.warning : C.danger, borderBottom: `1px solid ${C.borderLight}` }}>
                    {ev.match_score ? `${ev.match_score}%` : "—"}
                  </td>
                  <td style={{ padding: "9px 12px", fontSize: 12, color: C.textMid, borderBottom: `1px solid ${C.borderLight}` }}>{ev.match_method || "—"}</td>
                  <td style={{ padding: "9px 12px", borderBottom: `1px solid ${C.borderLight}` }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: ev.source_sync === "late_sync" ? C.warning : C.success }}>{ev.source_sync}</span>
                  </td>
                  <td style={{ padding: "9px 12px", borderBottom: `1px solid ${C.borderLight}` }}>
                    <Lucide.ShieldCheck size={13} color={ev.hmac_valid ? C.success : C.danger} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 24, textAlign: "center", color: C.textMuted, fontSize: 13 }}>No events match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ModalShell>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ENROL MODAL
   ───────────────────────────────────────────────────────────────── */
function EnrolModal({ device, employees, C, onEnrol, onRemove, onClose }) {
  const [tab, setTab] = useState("enrolled"); // "enrolled" | "add"
  const [search, setSearch] = useState("");
  const [consentChecked, setConsentChecked] = useState({});
  const [enrolled, setEnrolled] = useState(device.enrolled);

  const enrolledEmps = employees.filter(e => enrolled.includes(e.id));
  const unenrolled = employees.filter(e => !enrolled.includes(e.id) &&
    (e.name.toLowerCase().includes(search.toLowerCase()) || e.dept.toLowerCase().includes(search.toLowerCase()))
  );

  const handleEnrol = (empId) => {
    if (!consentChecked[empId]) return;
    onEnrol(empId);
    setEnrolled(prev => [...prev, empId]);
  };
  const handleRemove = (empId) => {
    onRemove(empId);
    setEnrolled(prev => prev.filter(id => id !== empId));
  };

  return (
    <ModalShell title={`Enrol Employees — ${device.name}`} subtitle={`${enrolled.length} enrolled · ${device.type}`} C={C} onClose={onClose} width={600}>
      <div style={{ padding: 22 }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 18, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
          {[["enrolled", `Enrolled (${enrolled.length})`], ["add", "Add Employee"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ flex: 1, padding: "9px 14px", border: "none", background: tab === key ? C.primary : C.white, color: tab === key ? "#fff" : C.textMid, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
              {label}
            </button>
          ))}
        </div>

        {tab === "enrolled" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {enrolledEmps.length === 0 && <div style={{ padding: 20, textAlign: "center", color: C.textMuted, fontSize: 13 }}>No employees enrolled yet.</div>}
            {enrolledEmps.map(emp => (
              <div key={emp.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.white }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: C.primary, flexShrink: 0 }}>
                  {emp.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{emp.name}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{emp.level} · {emp.dept} · Token: TKN-{emp.id}-{device.id}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginRight: 8 }}>
                  <Lucide.ShieldCheck size={12} color={C.success} />
                  <span style={{ fontSize: 10, color: C.success, fontWeight: 600 }}>Consented</span>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} onClick={() => handleRemove(emp.id)}
                  style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid #FECACA", background: "#FEF2F2", color: "#DC2626", fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Remove
                </motion.button>
              </div>
            ))}
          </div>
        )}

        {tab === "add" && (
          <div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees…"
              style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 13, outline: "none", background: C.bg, color: C.text, fontFamily: "inherit", marginBottom: 12, boxSizing: "border-box" }} />

            {/* GDPR Consent Note */}
            <div style={{ padding: "10px 14px", background: C.warningBg, border: `1px solid ${C.warningBorder}`, borderRadius: 9, marginBottom: 14, display: "flex", gap: 8 }}>
              <Lucide.AlertTriangle size={14} color={C.warning} style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 12, color: "#92400E", lineHeight: 1.5 }}>
                Biometric data is Special Category personal data. You must confirm the employee has given explicit consent before enrolment. Check the box next to each employee to confirm.
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {unenrolled.map(emp => (
                <div key={emp.id} style={{ padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.white }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: C.textMid, flexShrink: 0 }}>
                      {emp.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{emp.name}</div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>{emp.level} · {emp.dept}</div>
                    </div>
                    <motion.button whileHover={consentChecked[emp.id] ? { scale: 1.02 } : {}} onClick={() => handleEnrol(emp.id)}
                      disabled={!consentChecked[emp.id]}
                      style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: consentChecked[emp.id] ? C.primary : C.border, color: "#fff", fontSize: 12, fontWeight: 700, cursor: consentChecked[emp.id] ? "pointer" : "not-allowed", opacity: consentChecked[emp.id] ? 1 : 0.5, fontFamily: "inherit" }}>
                      Enrol
                    </motion.button>
                  </div>
                  {/* Consent checkbox */}
                  <div style={{ marginTop: 10, display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <input type="checkbox" id={`consent-${emp.id}`} checked={!!consentChecked[emp.id]} onChange={e => setConsentChecked(prev => ({ ...prev, [emp.id]: e.target.checked }))}
                      style={{ marginTop: 2, accentColor: C.primary, flexShrink: 0 }} />
                    <label htmlFor={`consent-${emp.id}`} style={{ fontSize: 11.5, color: C.textMid, lineHeight: 1.5, cursor: "pointer" }}>
                      I confirm that <strong>{emp.name}</strong> has given explicit written consent for biometric enrolment on this device. Biometric template will be stored on the device only, never on the server.
                    </label>
                  </div>
                </div>
              ))}
              {unenrolled.length === 0 && <div style={{ padding: 20, textAlign: "center", color: C.textMuted, fontSize: 13 }}>All employees already enrolled or no matches.</div>}
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

/* ─────────────────────────────────────────────────────────────────
   CONFIGURE DEVICE MODAL
   ───────────────────────────────────────────────────────────────── */
function ConfigureDeviceModal({ device, C, onClose, onSave }) {
  const [form, setForm] = useState({
    liveSensitivity: device.liveSensitivity,
    pinFallback: device.pinFallback,
    autoClockOut: device.autoClockOut,
    heartbeatInterval: "5",
  });
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <ModalShell title={`Configure — ${device.name}`} subtitle={device.model} C={C} onClose={onClose} width={500}>
      <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Device info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: 14, background: C.bg, borderRadius: 10, border: `1px solid ${C.border}` }}>
          {[["Serial", device.serialNumber], ["IP Address", device.ip], ["Firmware", device.firmwareVersion], ["Protocol", device.protocol]].map(([l, v]) => (
            <div key={l}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>{l}</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text, fontFamily: "monospace" }}>{v}</div>
            </div>
          ))}
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>Liveness Check Sensitivity</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["Low", "Medium", "High"].map(opt => (
              <button key={opt} onClick={() => setF("liveSensitivity", opt)}
                style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1.5px solid ${form.liveSensitivity === opt ? C.primary : C.border}`, background: form.liveSensitivity === opt ? C.primaryLight : C.white, color: form.liveSensitivity === opt ? C.primary : C.textMid, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: C.bg, borderRadius: 10, border: `1px solid ${C.border}` }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>PIN Fallback</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>Allow PIN entry if biometric fails 3× in a row</div>
          </div>
          <motion.div whileTap={{ scale: 0.95 }} onClick={() => setF("pinFallback", !form.pinFallback)}
            style={{ width: 44, height: 24, borderRadius: 12, background: form.pinFallback ? C.primary : C.border, display: "flex", alignItems: "center", padding: "0 3px", cursor: "pointer", transition: "background 0.2s", justifyContent: form.pinFallback ? "flex-end" : "flex-start" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
          </motion.div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Auto Clock-Out Time</div>
          <input type="time" value={form.autoClockOut} onChange={e => setF("autoClockOut", e.target.value)}
            style={{ padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 13, outline: "none", background: C.bg, color: C.text, fontFamily: "inherit", width: "100%", boxSizing: "border-box" }} />
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>If an employee clocks in but does not clock out, auto-clock-out at this time.</div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Heartbeat Interval (minutes)</div>
          <input type="number" min={1} max={60} value={form.heartbeatInterval} onChange={e => setF("heartbeatInterval", e.target.value)}
            style={{ padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 13, outline: "none", background: C.bg, color: C.text, fontFamily: "inherit", width: "100%", boxSizing: "border-box" }} />
        </div>

        {/* HMAC rotation */}
        <div style={{ padding: "12px 16px", background: C.warningBg, border: `1px solid ${C.warningBorder}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Rotate HMAC Secret</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>Invalidates current secret immediately. Device will need re-configuration.</div>
          </div>
          <motion.button whileHover={{ scale: 1.02 }}
            style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.warningBorder}`, background: C.white, color: C.warning, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            Rotate
          </motion.button>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, borderTop: `1px solid ${C.borderLight}`, paddingTop: 16 }}>
          <motion.button whileHover={{ scale: 1.02 }} onClick={onClose}
            style={{ padding: "8px 18px", borderRadius: 9, border: `1px solid ${C.border}`, background: C.white, color: C.textMid, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Cancel
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => onSave({ ...device, ...form })}
            style={{ padding: "8px 20px", borderRadius: 9, border: "none", background: C.primary, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            Save Configuration
          </motion.button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ─────────────────────────────────────────────────────────────────
   REGISTER DEVICE MODAL
   ───────────────────────────────────────────────────────────────── */
function RegisterDeviceModal({ C, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "", model: "", manufacturer: "ZKTeco", type: "Fingerprint Scanner", typeCode: "fingerprint",
    location: "", branch: "HQ", ip: "", protocol: "REST Push",
    liveSensitivity: "Medium", pinFallback: true, autoClockOut: "23:59",
    firmwareVersion: "", serialNumber: "",
  });
  const [step, setStep] = useState(1);
  const [testResult, setTestResult] = useState(null); // null | "success" | "fail"
  const [testing, setTesting] = useState(false);
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const manufacturers = ["ZKTeco", "Suprema", "HikVision", "Anviz", "Custom/Generic"];
  const protocols = ["REST Push", "Suprema BioStar API", "HikVision ISAPI", "Anviz CloudClocking API", "MQTT"];
  const types = [
    { label: "Fingerprint Scanner", code: "fingerprint" },
    { label: "Face Recognition", code: "face" },
    { label: "Multi-Modal (Fingerprint + Face)", code: "multimodal" },
    { label: "Vein Reader", code: "vein" },
  ];

  const handleTestPing = async () => {
    setTesting(true);
    setTestResult(null);
    await new Promise(r => setTimeout(r, 1500));
    setTestResult(form.ip ? "success" : "fail");
    setTesting(false);
  };

  const isStep1Valid = form.name && form.manufacturer && form.type && form.location && form.ip;

  return (
    <ModalShell title="Register New Device" subtitle={`Step ${step} of 2`} C={C} onClose={onClose} width={580}>
      <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Step indicator */}
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2].map(n => (
            <div key={n} style={{ flex: 1, height: 4, borderRadius: 2, background: n <= step ? C.primary : C.border, transition: "background 0.3s" }} />
          ))}
        </div>

        {step === 1 && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Device Name <span style={{ color: C.danger }}>*</span></div>
                <input value={form.name} onChange={e => setF("name", e.target.value)} placeholder="e.g. Main Entrance — HQ"
                  style={{ padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 13, outline: "none", background: C.bg, color: C.text, fontFamily: "inherit", width: "100%", boxSizing: "border-box" }} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Manufacturer</div>
                <select value={form.manufacturer} onChange={e => setF("manufacturer", e.target.value)}
                  style={{ padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 13, outline: "none", background: C.bg, color: C.text, fontFamily: "inherit", width: "100%", boxSizing: "border-box" }}>
                  {manufacturers.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Model</div>
                <input value={form.model} onChange={e => setF("model", e.target.value)} placeholder="e.g. ZKTeco K40 Pro"
                  style={{ padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 13, outline: "none", background: C.bg, color: C.text, fontFamily: "inherit", width: "100%", boxSizing: "border-box" }} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Device Type <span style={{ color: C.danger }}>*</span></div>
                <select value={form.type} onChange={e => { const t = types.find(x => x.label === e.target.value); setF("type", e.target.value); if (t) setF("typeCode", t.code); }}
                  style={{ padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 13, outline: "none", background: C.bg, color: C.text, fontFamily: "inherit", width: "100%", boxSizing: "border-box" }}>
                  {types.map(t => <option key={t.code}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Location / Branch <span style={{ color: C.danger }}>*</span></div>
                <input value={form.location} onChange={e => setF("location", e.target.value)} placeholder="e.g. HQ London"
                  style={{ padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 13, outline: "none", background: C.bg, color: C.text, fontFamily: "inherit", width: "100%", boxSizing: "border-box" }} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>LAN IP Address <span style={{ color: C.danger }}>*</span></div>
                <input value={form.ip} onChange={e => setF("ip", e.target.value)} placeholder="192.168.1.xxx"
                  style={{ padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 13, outline: "none", background: C.bg, color: C.text, fontFamily: "inherit", width: "100%", boxSizing: "border-box" }} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Communication Protocol</div>
                <select value={form.protocol} onChange={e => setF("protocol", e.target.value)}
                  style={{ padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 13, outline: "none", background: C.bg, color: C.text, fontFamily: "inherit", width: "100%", boxSizing: "border-box" }}>
                  {protocols.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Serial Number</div>
                <input value={form.serialNumber} onChange={e => setF("serialNumber", e.target.value)} placeholder="Device serial"
                  style={{ padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 13, outline: "none", background: C.bg, color: C.text, fontFamily: "inherit", width: "100%", boxSizing: "border-box" }} />
              </div>
            </div>

            {/* Test ping */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <motion.button whileHover={!testing ? { scale: 1.02 } : {}} onClick={handleTestPing} disabled={!form.ip || testing}
                style={{ padding: "8px 16px", borderRadius: 9, border: `1px solid ${C.border}`, background: C.white, color: C.textMid, fontSize: 13, fontWeight: 600, cursor: form.ip ? "pointer" : "not-allowed", opacity: form.ip ? 1 : 0.5, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7 }}>
                {testing ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${C.border}`, borderTopColor: C.primary }} /> : <Lucide.Wifi size={14} />}
                Test Connection
              </motion.button>
              {testResult === "success" && <span style={{ fontSize: 12, color: C.success, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><Lucide.CheckCircle2 size={14} /> Device reachable</span>}
              {testResult === "fail" && <span style={{ fontSize: 12, color: C.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><Lucide.XCircle size={14} /> Could not reach device</span>}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", borderTop: `1px solid ${C.borderLight}`, paddingTop: 14 }}>
              <motion.button whileHover={isStep1Valid ? { scale: 1.02 } : {}} onClick={() => isStep1Valid && setStep(2)} disabled={!isStep1Valid}
                style={{ padding: "9px 22px", borderRadius: 9, border: "none", background: isStep1Valid ? C.primary : C.border, color: "#fff", fontSize: 13, fontWeight: 700, cursor: isStep1Valid ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
                Next: Configuration →
              </motion.button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>Liveness Sensitivity</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["Low", "Medium", "High"].map(opt => (
                  <button key={opt} onClick={() => setF("liveSensitivity", opt)}
                    style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1.5px solid ${form.liveSensitivity === opt ? C.primary : C.border}`, background: form.liveSensitivity === opt ? C.primaryLight : C.white, color: form.liveSensitivity === opt ? C.primary : C.textMid, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: C.bg, borderRadius: 10, border: `1px solid ${C.border}` }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>PIN Fallback</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>Allow PIN entry when biometric fails 3× in a row</div>
              </div>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => setF("pinFallback", !form.pinFallback)}
                style={{ width: 44, height: 24, borderRadius: 12, background: form.pinFallback ? C.primary : C.border, display: "flex", alignItems: "center", padding: "0 3px", cursor: "pointer", transition: "background 0.2s", justifyContent: form.pinFallback ? "flex-end" : "flex-start" }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff" }} />
              </motion.div>
            </div>

            <div style={{ padding: "12px 16px", background: C.successBg, border: `1px solid ${C.successBorder}`, borderRadius: 10, display: "flex", gap: 8 }}>
              <Lucide.ShieldCheck size={14} color={C.success} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 12, color: C.success, lineHeight: 1.5 }}>
                A unique HMAC-SHA256 Device Secret will be generated and assigned automatically. All inbound events will be validated against this secret to prevent spoofed clock-in events.
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${C.borderLight}`, paddingTop: 14 }}>
              <motion.button whileHover={{ scale: 1.02 }} onClick={() => setStep(1)}
                style={{ padding: "9px 18px", borderRadius: 9, border: `1px solid ${C.border}`, background: C.white, color: C.textMid, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                ← Back
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => onSave(form)}
                style={{ padding: "9px 22px", borderRadius: 9, border: "none", background: C.primary, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Register Device
              </motion.button>
            </div>
          </>
        )}
      </div>
    </ModalShell>
  );
}

/* ─────────────────────────────────────────────────────────────────
   DECOMMISSION MODAL
   ───────────────────────────────────────────────────────────────── */
function DecommissionModal({ device, C, onConfirm, onClose }) {
  const [typed, setTyped] = useState("");
  const confirmed = typed === device.name;

  return (
    <ModalShell title="Decommission Device" subtitle="This action cannot be undone" C={C} onClose={onClose} width={480}>
      <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ padding: "14px 16px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, display: "flex", gap: 10 }}>
          <Lucide.AlertTriangle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 13, color: "#991B1B", lineHeight: 1.6 }}>
            <strong>This will:</strong><br />
            • Send template deletion commands to the device for all {device.enrolled.length} enrolled employees<br />
            • Mark the device as decommissioned<br />
            • Preserve all event log history for audit purposes<br />
            • Cannot be reversed — employees must be re-enrolled on a new device
          </div>
        </div>

        <div style={{ padding: "12px 16px", background: C.bg, borderRadius: 10, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.4px" }}>GDPR Compliance</div>
          <div style={{ fontSize: 12.5, color: C.textMid, lineHeight: 1.5 }}>
            Template deletion confirmations must be received within 72 hours. Offline devices will receive the deletion command on reconnection.
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
            Type <strong style={{ fontFamily: "monospace" }}>{device.name}</strong> to confirm
          </div>
          <input value={typed} onChange={e => setTyped(e.target.value)} placeholder={device.name}
            style={{ padding: "9px 12px", border: `1px solid ${confirmed ? C.danger : C.border}`, borderRadius: 9, fontSize: 13, outline: "none", background: C.bg, color: C.text, fontFamily: "monospace", width: "100%", boxSizing: "border-box" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <motion.button whileHover={{ scale: 1.02 }} onClick={onClose}
            style={{ padding: "8px 18px", borderRadius: 9, border: `1px solid ${C.border}`, background: C.white, color: C.textMid, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Cancel
          </motion.button>
          <motion.button whileHover={confirmed ? { scale: 1.02 } : {}} whileTap={confirmed ? { scale: 0.97 } : {}} onClick={confirmed ? onConfirm : undefined} disabled={!confirmed}
            style={{ padding: "8px 20px", borderRadius: 9, border: "none", background: confirmed ? "#EF4444" : C.border, color: "#fff", fontSize: 13, fontWeight: 700, cursor: confirmed ? "pointer" : "not-allowed", opacity: confirmed ? 1 : 0.5, fontFamily: "inherit" }}>
            Decommission & Delete Templates
          </motion.button>
        </div>
      </div>
    </ModalShell>
  );
}
