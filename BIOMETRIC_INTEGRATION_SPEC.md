# Biometric Integration — End-to-End Technical & Functional Specification
**HR Platform BRD — Section 2.1.3 (Full Revised)**
Version 3.0 | March 2026 | Confidential – Internal Use Only

---

## Overview

The platform uses **two completely separate biometric systems** that serve different purposes, operate on different hardware, store data differently, and must never share templates or identity tokens. This separation is intentional for security, privacy, and regulatory compliance.

| System | Purpose | Where biometric lives | Who manages it |
|---|---|---|---|
| A — Mobile Biometric | App login + Remote/Hybrid clock-in | On device only (Secure Enclave / Keystore) | Employee |
| B — Hardware Device | Onsite clock-in / clock-out | On physical terminal only | HR Admin |

> ⚠️ **GDPR / PDPA Note (Critical for Production):** Biometric data is **Special Category personal data** under GDPR Art. 9 and equivalent under Sri Lanka's PDPA. Before any biometric enrollment, the platform **must** obtain explicit, separate, written consent from the employee. This consent must be: specific to purpose, freely given (no coercion), revocable at any time, and stored immutably with timestamp and version. Withdrawal of consent must trigger immediate template deletion from all devices.

---

## SYSTEM A — Mobile Biometric (App Login & Remote/Hybrid Clock-In)

### A.1 Purpose & Scope

Used exclusively for:
- Authenticating an employee into the mobile app (replaces password entry after first setup)
- Verifying identity when clocking in/out under **Remote** or **Hybrid** work modes via the mobile app

**Not used for:** onsite clock-in/out (that is System B only).

---

### A.2 How It Works — Technical Architecture

The mobile biometric system uses a **challenge-response + asymmetric key pair** model. The biometric template **never leaves the device.** The server never sees, stores, or processes any biometric data.

**Key concept:** The device holds a private key locked behind the biometric sensor. The server holds the matching public key. When the employee passes the biometric check on the device, the device uses the private key to sign a server-issued nonce. The server verifies the signature. That's the entire trust model.

#### Step-by-step setup (first enrolment):

1. Employee completes first login using email/password.
2. App prompts: *"Would you like to enable biometric login?"*
3. Employee taps **Enable** → OS biometric prompt shown (Face ID / Touch ID / Android Biometric).
4. On biometric success, device generates an **asymmetric key pair** (RSA-2048 or EC P-256):
   - Private key stored in **Secure Enclave** (iOS) or **Android Keystore** — hardware-backed, non-exportable.
   - Private key access requires biometric authentication on every use (no passthrough).
5. Device sends **only the public key** to the platform server, along with: `{ device_id, device_model, os_version, app_version, enrollment_timestamp }`.
6. Server stores: `{ employee_id, device_id, public_key, enrolled_at, status: active }` — this is the **Device Credential Record**.
7. App confirms: *"Biometric login enabled on this device."*

#### Step-by-step login / clock-in flow:

1. Employee opens app → taps **"Login with Biometric"** or initiates **"Clock In (Remote)"**.
2. App requests a **challenge nonce** from the server: `GET /auth/biometric/challenge` → server returns `{ nonce, expires_at (30 seconds) }`. Nonce is single-use and server-stored.
3. App triggers OS biometric prompt.
4. On success, device retrieves private key from Secure Enclave / Keystore and **signs the nonce**: `signature = sign(privateKey, nonce + timestamp + device_id)`.
5. App sends to server: `{ employee_id, device_id, nonce, signature, timestamp }`.
6. Server verifies:
   - Nonce exists and has not expired.
   - Nonce has not been used before (replay attack prevention).
   - Signature is valid against the stored public key for this device.
   - Device is still in `active` status (not revoked).
   - Timestamp is within ±60 seconds of server time.
7. On success: server marks nonce as consumed → issues JWT access token → proceeds with clock-in record creation.
8. On any failure: nonce consumed (cannot retry with same nonce) → new challenge required.

---

### A.3 Multi-Device Support

- An employee can register **multiple devices** (e.g., personal phone + work phone). Each device gets its own key pair and Device Credential Record.
- HR Admin can view all registered devices per employee and revoke any individual device.
- Employee can also self-revoke a device in app Settings → Security → Registered Devices.

---

### A.4 Device Replacement / Phone Change

When an employee gets a new phone:

1. Old device's private key is hardware-locked and **cannot be transferred** (by design — this is the security guarantee).
2. Employee must re-enrol biometric on the new device using the standard enrolment flow after password login.
3. Old device record is automatically set to `status: inactive` when employee initiates new enrolment on a different device_id (or HR Admin can manually revoke it).
4. If employee lost the phone: HR Admin revokes the old device record → all signatures from that device_id are rejected. Employee re-enrols on new device.

---

### A.5 Failure Handling

| Scenario | System Response |
|---|---|
| Biometric match fails (1–2 attempts) | Show retry prompt |
| 3 consecutive failures in one session | Silent fallback to password/SSO for this session. Biometric not disabled yet. |
| 5 consecutive failures across sessions | Biometric disabled on this device. Employee must re-enrol via Settings after password login. HR Admin not notified (local device matter). |
| Nonce expired (>30s) | Request new challenge. Do not retry with old nonce. |
| Device clock out of sync (>60s drift) | Clock-in rejected with error: "Device time mismatch." Employee prompted to sync device clock. |
| Device Credential Record revoked | Signature verification fails. Employee falls back to password. |

---

### A.6 Biometric Consent — Mobile

Before the enrolment prompt is shown:
- App displays a **Biometric Consent Screen** with plain-language explanation of: what is stored (only a key pair — no biometric image), where it is stored (on device only), what it is used for, and how to revoke.
- Employee must tick **"I consent to biometric authentication"** and tap **Confirm**.
- Consent stored: `{ employee_id, device_id, consent_type: 'mobile_biometric', consented_at, ip, app_version }`.
- Consent can be withdrawn at any time from Settings → Security → Revoke Biometric Consent. Revoking consent deletes the Device Credential Record and disables the private key access.

---

## SYSTEM B — Hardware Biometric Device (Onsite Clock-In / Clock-Out)

### B.1 Purpose & Scope

Physical biometric terminals installed at office entrances, factory gates, or any onsite entry/exit point. These are the **sole mechanism** for recording onsite attendance. Employees do not use the mobile app to clock in when physically at the office.

---

### B.2 Supported Hardware

#### Device Types:
| Type | Standard | Notes |
|---|---|---|
| Fingerprint scanner (optical) | ANSI/ISO 19794-2 | Most common, cost-effective |
| Fingerprint scanner (capacitive) | ANSI/ISO 19794-2 | Higher accuracy, used in high-security sites |
| Face recognition terminal | ISO/IEC 19794-5 | IR-based, liveness detection required |
| Finger-vein / palm-vein reader | ISO/IEC 19794-6 | Premium option, highest spoof resistance |
| Multi-modal (fingerprint + face) | Both above | Recommended for high-throughput sites |

#### Supported Manufacturer SDKs (out-of-box):
- ZKTeco (ZKLib SDK)
- Suprema (BioStar 2 API)
- HikVision (ISAPI)
- Anviz (CloudClocking API)
- Generic REST adapter (for any manufacturer that supports REST push)

---

### B.3 Core Data Principle — What Is Stored Where

This is the most important design decision and must be preserved in production:

| Data | Device | Platform Server |
|---|---|---|
| Biometric template (actual fingerprint/face data) | ✅ Stored on device flash memory | ❌ NEVER stored |
| Employee token (UUID mapped to employee_id) | ✅ Stored on device alongside template | ✅ Stored (maps token → employee_id) |
| Match result / match score | ✅ Generated on device | ✅ Received via event payload |
| Clock event (in/out, timestamp, device_id) | ✅ Queued locally before send | ✅ Persisted as attendance record |
| Raw biometric image / scan | ❌ Never retained after match | ❌ Never received |

**Why this matters:** If the server is breached, no biometric data is exposed. The device holds templates; the server holds only tokens and events.

---

### B.4 Device Registration Flow (HR Admin)

1. HR Admin → System Configuration → Hardware Devices → **Register New Device**.
2. Form fields:
   - **Device Name** (e.g., "Main Entrance – HQ Floor 3")
   - **Device Type** (Fingerprint / Face / Multi-modal / Vein)
   - **Manufacturer & Model** (dropdown, determines SDK used)
   - **Serial Number** (physical device serial for asset tracking)
   - **Branch / Location** (linked to an org location record — determines geo-zone)
   - **LAN IP Address** (static IP of the device on the office network)
   - **API Key / SDK Credentials** (generated by device admin panel; entered here)
   - **Communication Protocol** (REST Push / MQTT / SDK)
3. Platform generates a **Device Secret** (HMAC-SHA256 key) unique to this device registration. This secret is entered into the device's configuration so it can sign outbound event payloads.
4. Platform sends a **test ping** to the device IP. On success → device status: `Online`. On failure → error with guidance.
5. Device appears in registry: Name, Location, Type, Status, Last Heartbeat, Today's Event Count.

> **Security note:** All communication between the device and platform must be over **TLS 1.2+**. The device must verify the server's TLS certificate (no self-signed certs in production). Each event payload must include an **HMAC-SHA256 signature** computed using the Device Secret, preventing spoofed events from unauthorised sources.

---

### B.5 Employee Biometric Consent — Hardware Device

Before any employee is enrolled on a hardware device:

1. HR Admin initiates enrolment for the employee.
2. Platform checks if the employee has an active **Hardware Biometric Consent** record. If not, platform sends the employee a **Consent Request notification** (in-app + email).
3. Employee reviews the consent screen:
   - What biometric is captured (fingerprint/face)
   - Where it is stored (on the physical device only, never on servers)
   - What it is used for (onsite attendance recording only)
   - Right to withdraw consent (templates will be deleted from device within 24 hours)
4. Employee taps **I Consent** → consent stored: `{ employee_id, consent_type: 'hardware_biometric', consented_at, device_ids: [], version }`.
5. HR Admin is notified that consent has been granted → enrolment can proceed.
6. **If employee does not consent**, HR Admin is notified. The employee cannot be enrolled. An alternative attendance method must be configured for this employee (PIN-only or manual HR entry).

---

### B.6 Employee Enrolment Flow (On Device)

After consent is obtained:

1. HR Admin → Employees → [Employee] → **Enrol on Device** → select target device(s).
2. Platform creates an **Enrolment Session**: `{ employee_id, device_id, session_token, expires_at (24 hours), status: pending }`.
3. Platform pushes the enrolment session to the device via the registered communication channel.
4. Device displays the employee's name and employee ID on its screen, ready to capture.
5. HR Admin or Site Admin calls the employee to the terminal.
6. Employee presents biometric (e.g., places finger 3 times for fingerprint; or looks at camera for face). Device averages scans for quality.
7. Device creates a biometric template and stores it internally with a link to a **Platform Token** (a UUID generated by the platform and sent as part of the enrolment session — this is the only identifier on the device that links to a real employee).
8. Device sends enrolment confirmation to platform: `{ session_token, employee_token (UUID), device_id, template_quality_score, enrolled_at }`.
9. Platform stores: `{ employee_id, device_id, employee_token, enrolled_at, status: active }` — this is the **Device Enrolment Record**.
10. Enrolment status on employee profile updates to: `Enrolled – [Device Name]`.

#### Bulk Enrolment:
- HR Admin can queue multiple employees for a single enrolment session.
- Device shows each queued employee's name in sequence. Site Admin calls them forward.
- Each employee scans and is enrolled. Platform processes confirmations in order.

#### Multi-Device Enrolment:
- Employee can be enrolled on multiple terminals (e.g., main gate + parking entrance + canteen).
- Each device gets its own `employee_token` UUID — the same employee has different tokens on different devices.
- Platform maps all tokens for an employee: `[{ device_id_1, token_1 }, { device_id_2, token_2 }]`.
- This means even if a device is stolen, the token alone cannot identify the employee without the platform's mapping.

---

### B.7 Onsite Clock-In / Clock-Out Flow (End to End)

#### Clock-In:

1. Employee approaches terminal and presents biometric (finger / face).
2. Device performs **1:N local match** against all enrolled templates in its internal memory. **No network required for the match itself.** Device is self-contained for identification.
3. On successful match, device retrieves the `employee_token` linked to the matched template.
4. Device builds an event payload:
```json
{
  "event_id": "uuid-v4-unique-per-event",
  "device_id": "device-uuid",
  "employee_token": "employee-uuid-on-this-device",
  "event_type": "clock_in",
  "timestamp_utc": "2026-03-14T08:47:22Z",
  "match_score": 94,
  "match_method": "fingerprint",
  "liveness_check": "passed",
  "hmac_signature": "sha256-of-payload-using-device-secret"
}
```
5. Device sends payload to platform via configured protocol (REST POST / MQTT publish).
6. Device shows success indicator to employee (green light / beep / display message).

#### Platform Processing (server-side):

1. Validate HMAC signature against Device Secret → reject if invalid (prevents spoofed events).
2. Check `event_id` uniqueness → reject if already processed (prevents duplicate records from network retries).
3. Check `timestamp_utc` is within ±5 minutes of server time → reject if outside window (prevents replay attacks).
4. Look up `employee_token` in Device Enrolment Records → resolve to `employee_id`.
5. Verify employee is `Active` (not terminated, not on suspension).
6. Verify `device_id` matches the registered device for this employee token.
7. Check for existing open clock-in for today (prevent double clock-in):
   - If open clock-in exists: log a `Duplicate Clock-In Detected` event, notify HR, do not create second record.
8. Create **Attendance Record**:
```json
{
  "attendance_id": "uuid",
  "employee_id": "...",
  "date": "2026-03-14",
  "mode": "Onsite",
  "source": "hardware_biometric",
  "device_id": "...",
  "device_name": "Main Entrance – HQ",
  "location": "HQ – Colombo",
  "clock_in_utc": "2026-03-14T08:47:22Z",
  "clock_out_utc": null,
  "match_score": 94,
  "match_method": "fingerprint",
  "liveness_check": "passed",
  "status": "open",
  "flags": []
}
```
9. Apply **Late Arrival** check: if `clock_in` > `shift_start + grace_period` → add `LATE_ARRIVAL` flag.
10. Push real-time notification to employee's mobile app: *"Clocked in at Main Entrance – HQ · 08:47 AM"*.
11. Update employee's live status on HR dashboard.

#### Clock-Out:

1–6. Same as clock-in steps 1–6, with `event_type: "clock_out"`.
7. Platform finds open attendance record for employee for today.
8. Updates record: `clock_out_utc`, `status: "closed"`, calculates `total_work_hours`.
9. Applies checks:
   - **Short Hours:** `total_work_hours < required_shift_hours − threshold` → flag `SHORT_HOURS`.
   - **Early Departure:** `clock_out < shift_end − threshold` → flag `EARLY_DEPARTURE`, prompt employee for reason note via app.
10. Pushes notification to employee: *"Clocked out · Total: 8h 12m"*.

---

### B.8 Event Delivery & Reliability

#### Device-Side Queuing:
- If the device cannot reach the platform (network down), events are written to the **device's internal event queue** (persistent flash storage, not RAM).
- Device retries delivery: first attempt after 30 seconds, then exponential backoff (1 min, 2 min, 4 min) up to a max of 30 minutes between retries.
- Queue holds up to 10,000 events (sufficient for days of offline operation at most sites).

#### Platform-Side Queue Processing (when device reconnects):
- Device sends queued events in **chronological order**.
- Each event processed individually with full validation.
- Events with `timestamp_utc` within ±4 hours of server receive time: processed normally, marked `source_sync: realtime`.
- Events with timestamp gap > 4 hours: processed but flagged `source_sync: late_sync` → HR Admin review required.
- Duplicate `event_id` values: silently deduplicated (device may retry sending the same event).
- HR Admin receives a **Late Sync Alert** summarising how many events were synced late and for which employees.

#### Heartbeat:
- Device sends a heartbeat ping every 5 minutes (configurable): `{ device_id, timestamp, queue_depth, firmware_version, storage_free_pct }`.
- If no heartbeat received for 10 minutes: device status → `Warning`. HR Admin notified.
- If no heartbeat for 30 minutes: device status → `Offline`. HR Admin receives alert. Fallback procedures activated (see B.11).

---

### B.9 Security Controls

| Control | Implementation |
|---|---|
| Transport security | TLS 1.2+ for all device ↔ platform communication |
| Event authenticity | HMAC-SHA256 on every payload using per-device secret |
| Anti-replay | `event_id` deduplication + timestamp window validation |
| Token anonymisation | `employee_token` is a UUID with no PII — device cannot identify an employee from the token alone |
| Template isolation | Biometric templates stored only on device; never transmitted |
| Device secret rotation | HR Admin can rotate a device's HMAC secret from the admin panel; old secret invalidated immediately |
| TLS certificate pinning | Platform mobile app and device firmware pin the server certificate (optional, recommended for production) |
| Physical access | Device admin panel protected by separate PIN; platform credentials never stored on device in plaintext |

---

### B.10 Employee Termination & Template Deletion

When an employee is terminated or their biometric consent is withdrawn:

1. HR Admin terminates employee (or employee withdraws consent).
2. Platform immediately sets all Device Enrolment Records for this employee to `status: revoked`.
3. Platform sends a **Template Deletion Command** to each device where the employee is enrolled:
   - Command payload: `{ command: "delete_template", employee_token: "...", issued_at: "...", hmac: "..." }`
4. Device deletes the template linked to the employee_token from its internal storage.
5. Device sends **Deletion Confirmation**: `{ employee_token, deleted_at, device_id }`.
6. Platform records: `{ employee_id, device_id, template_deleted_at, confirmed: true }`.
7. If device is offline when deletion is commanded: deletion command queued on platform. When device reconnects, deletion command delivered before processing any new events. Deletion confirmed before device resumes normal operation.
8. **Audit trail** records the full deletion lifecycle — required for GDPR compliance (right to erasure).

> ⚠️ **Production Requirement:** Template deletion confirmation must be obtained within **72 hours** of termination (GDPR-aligned). If a device is offline beyond this window, HR Admin receives an escalating alert and the device must be manually inspected.

---

### B.11 Failure & Fallback Handling

| Scenario | Response |
|---|---|
| Match failure (1–2 attempts) | Device shows retry prompt |
| 3 consecutive match failures | Device offers fallback: **PIN Entry** (if HR Admin has enabled PIN fallback for this device) |
| PIN entry succeeds | Event logged as `source: pin_override_biometric_failure`. HR Admin notified. |
| PIN entry also fails | Employee must contact HR Admin for manual attendance entry. |
| Liveness check fails (face terminal) | Match rejected. Event logged as `liveness_check: failed`. If same employee triggers 3+ liveness failures in a day → HR Admin alerted (potential spoofing attempt). |
| Device hardware failure | HR Admin receives `Device Offline` alert. HR Admin can manually log attendance for affected employees via Attendance Corrections flow for the affected period. |
| Device offline during employee termination | Deletion command queued. HR Admin alerted. Device flagged `pending_deletion_commands`. |
| Network partition (device on LAN, platform unreachable) | Device queues events. Employees can still clock in/out normally. Sync occurs on reconnection. |
| Device storage full | HR Admin alerted. Oldest synced events purged from device queue first. Unsynced events are never purged automatically — alerts escalate until device is serviced. |

---

### B.12 HR Admin — Device Management Panel

**Device Registry View (table):**
- Device Name, Location, Type, Manufacturer, Status (Online / Warning / Offline / Error), Last Heartbeat timestamp, Today's Event Count, Enrolled Employees Count, Pending Deletion Commands

**Per-Device Actions:**
- Test Ping
- View Event Log (filterable: date, employee, event type, match result, source)
- View Enrolled Employees (with enrolment date, status, template quality score)
- Rotate HMAC Secret
- Configure: heartbeat interval, PIN fallback (on/off), liveness sensitivity (Low/Medium/High), auto-clock-out window
- Decommission Device (triggers bulk template deletion for all enrolled employees on this device)

**Enrolment Management:**
- Enrol employee on device
- Re-enrol (if template quality degraded — e.g., employee had injury affecting fingerprint)
- Remove enrolment (triggers template deletion command)
- Transfer enrolment to replacement device

---

### B.13 Role Access — Hardware Biometric (Complete)

| Feature / Action | Employee | HR Admin / Sys Admin | Org Owner |
|---|---|---|---|
| View own enrolment status | ✓ (read only) | ✓ | ✓ |
| Grant / withdraw biometric consent | ✓ | ✓ (on behalf if incapacitated) | ✓ |
| Register new device | ✗ | ✓ | ✓ |
| Enrol employee on device | ✗ | ✓ | ✓ |
| Remove employee enrolment | ✗ | ✓ | ✓ |
| View device registry & status | ✗ | ✓ | ✓ |
| View device event log | ✗ | ✓ | ✓ |
| Configure device settings | ✗ | ✓ | ✓ |
| Rotate device HMAC secret | ✗ | ✓ | ✓ |
| Trigger template deletion | ✗ | ✓ | ✓ |
| Decommission device | ✗ | ✓ | ✓ |
| View biometric consent audit log | ✗ | ✓ | ✓ |
| Export device event report | ✗ | ✓ | ✓ |

---

## DEMO vs PRODUCTION NOTES

This section documents what the **demo simulates** vs what a **real production build** would implement, so the transition is clear.

| Aspect | Demo Behaviour | Production Implementation |
|---|---|---|
| Mobile biometric | Simulated with mock challenge-response using browser localStorage | Real FIDO2/WebAuthn or platform biometric API (Face ID / Touch ID / Android Biometric) |
| Hardware device events | Simulated via a "Simulate Scan" button in the admin panel | Real device pushes events via REST/MQTT with HMAC authentication |
| Device template storage | Not applicable (no real device) | Device firmware manages templates in encrypted flash storage |
| HMAC validation | Skipped in demo | Every inbound event validated against per-device HMAC secret |
| TLS certificate pinning | Not applicable | Required in production; pinned cert deployed with device firmware |
| GDPR consent records | Stored in demo localStorage/state | Immutable database records with full audit trail |
| Template deletion | Simulated (remove enrolment record) | Real deletion command sent to device firmware; confirmation required |
| Heartbeat monitoring | Simulated with 30-second polling | Real-time WebSocket or MQTT subscription from device |
| Manufacturer SDK | Not applicable | ZKTeco / Suprema / HikVision SDK integrated via adapter layer |

---

*End of Biometric Integration Specification — Section 2.1.3 (Revised)*
*This document supersedes the biometric sections in HR_final.docx Version 2.0*
