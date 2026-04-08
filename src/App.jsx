import { useState, useMemo } from "react";

// ─── Design tokens (lo-fi greyscale) ────────────────────────────────────────
const c = {
  bg: "#0f0f0f",
  surface: "#1a1a1a",
  panel: "#222222",
  border: "#333333",
  borderLight: "#444444",
  text: "#e8e8e8",
  textMuted: "#888888",
  textDim: "#555555",
  accent: "#4a9eff",
  accentDim: "#2a5a99",
  warn: "#e8a020",
  danger: "#cc3333",
  success: "#44aa66",
  dimmed: "#2a2a2a",
  anchor: "#ff9f40",   // warm amber — distinct from accent blue
};

const btn = {
  base: {
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontFamily: "monospace",
    fontSize: 12,
    padding: "6px 14px",
  },
};

// ─── Device fixture data ─────────────────────────────────────────────────────
const MODELS    = ["SM-S921U", "motorola edge (2022)", "moto g power (2022)", "SM-S156V", "moto g stylus 5G", "iPhone 14 Pro", "Pixel 7a", "SM-A546U", "moto g 5G (2024)", "OnePlus 11"];
const LAST_SEEN = ["Aug 14, 9:43 AM", "Sep 15, 7:20 PM", "Sep 19, 11:03 PM", "Sep 23, 3:16 PM", "Sep 22, 1:45 PM", "Sep 21, 8:00 AM", "Sep 18, 4:30 PM", "Sep 17, 2:15 PM", "Sep 16, 9:00 AM", "Sep 14, 6:45 PM"];
const CARRIERS  = ["Verizon Wireless", "AT&T", "T-Mobile", "Cricket", "Boost Mobile", "Metro PCS", "US Cellular", "Spectrum Mobile", "Visible", "Mint Mobile"];
const OS_VER    = ["15", "14", "13", "12", "15", "14", "13", "15", "14", "12"];
const IPS       = ["174.218.17.90", "68.45.112.33", "107.77.201.5", "172.56.8.14", "24.130.88.201", "76.103.44.9", "98.214.55.77", "166.182.3.44", "50.243.18.6", "73.99.201.88"];
const APP_COUNTS = [1, 3, 7, 2, 5, 12, 4, 8, 1, 6];

const DEVICES_POOL = [
  { id: "D-001", label: "Device 001", model: "SM-S921U",            lastSeen: "Sep 23, 3:16 PM",  os: "15", carrier: "Verizon Wireless", ip: "174.218.17.90", appCount: 1,  sysVersion: "Android 15", color: "#4a9eff", range: [0, 72] },
  { id: "D-002", label: "Device 002", model: "motorola edge (2022)", lastSeen: "Sep 15, 7:20 PM",  os: "14", carrier: "AT&T",             ip: "68.45.112.33",  appCount: 3,  sysVersion: "Android 14", color: "#aaaaaa", range: [0, 72] },
  { id: "D-003", label: "Device 003", model: "moto g power (2022)", lastSeen: "Sep 19, 11:03 PM", os: "13", carrier: "T-Mobile",          ip: "107.77.201.5",  appCount: 7,  sysVersion: "Android 13", color: "#aaaaaa", range: [0, 72] },
  { id: "D-004", label: "Device 004", model: "SM-S156V",            lastSeen: "Aug 14, 9:43 AM",  os: "15", carrier: "Cricket",           ip: "172.56.8.14",   appCount: 2,  sysVersion: "Android 15", color: "#aaaaaa", range: [12, 72] },
  { id: "D-005", label: "Device 005", model: "moto g stylus 5G",    lastSeen: "Sep 22, 1:45 PM",  os: "14", carrier: "Boost Mobile",      ip: "24.130.88.201", appCount: 5,  sysVersion: "Android 14", color: "#aaaaaa", range: [0, 60] },
  ...Array.from({ length: 26 }, (_, i) => ({
    id: `D-${String(i + 6).padStart(3, "0")}`,
    label: `Device ${String(i + 6).padStart(3, "0")}`,
    model: MODELS[(i + 5) % MODELS.length],
    lastSeen: LAST_SEEN[(i + 5) % LAST_SEEN.length],
    os: OS_VER[(i + 5) % OS_VER.length],
    carrier: CARRIERS[(i + 5) % CARRIERS.length],
    ip: IPS[(i + 5) % IPS.length],
    appCount: APP_COUNTS[(i + 5) % APP_COUNTS.length],
    sysVersion: `Android ${OS_VER[(i + 5) % OS_VER.length]}`,
    color: "#aaaaaa",
    range: i % 5 === 0 ? [12, 60] : i % 7 === 0 ? [0, 48] : [0, 72],
  })),
];

const NEARBY_POOL = [
  { id: "N-101", label: "Device 101", inSession: false, range: [0, 72],   model: "SM-A546U",           lastSeen: "Sep 21, 8:00 AM",  nearbyAt: [{ date: "Sep 21, 2025", time: "08:04 AM", duration: "12 min" }, { date: "Sep 22, 2025", time: "02:17 PM", duration: "4 min" }] },
  { id: "N-102", label: "Device 102", inSession: false, range: [0, 72],   model: "Pixel 7a",            lastSeen: "Sep 18, 4:30 PM",  nearbyAt: [{ date: "Sep 18, 2025", time: "04:31 PM", duration: "27 min" }] },
  { id: "D-002", label: "Device 002", inSession: true,  range: [0, 72],   model: "motorola edge (2022)", lastSeen: "Sep 15, 7:20 PM", nearbyAt: [{ date: "Sep 15, 2025", time: "07:20 PM", duration: "8 min" }, { date: "Sep 17, 2025", time: "11:45 AM", duration: "3 min" }] },
  { id: "N-103", label: "Device 103", inSession: false, range: [36, 72],  model: "moto g 5G (2024)",    lastSeen: "Sep 16, 9:00 AM",  nearbyAt: [{ date: "Sep 16, 2025", time: "09:03 AM", duration: "6 min" }] },
  { id: "N-104", label: "Device 104", inSession: false, range: [80, 120], model: "OnePlus 11",           lastSeen: "Sep 14, 6:45 PM",  nearbyAt: [] },
  { id: "N-105", label: "Device 105", inSession: false, range: [0, 72],   model: "iPhone 14 Pro",        lastSeen: "Sep 22, 1:45 PM",  nearbyAt: [{ date: "Sep 22, 2025", time: "01:46 PM", duration: "19 min" }, { date: "Sep 23, 2025", time: "09:12 AM", duration: "2 min" }] },
];

// sessionWindow is now driven by state — set in session setup, not hardcoded

// Positions as viewport percentages [x%, y%] — centered around 50%/50% of the map
// Spread: ±30% on x, ±28% on y so dots fill the middle of the fullscreen canvas
const POSITIONS_PCT = {
  "D-001": [44, 42], "D-002": [52, 48], "D-003": [48, 55],
  "D-004": [58, 38], "D-005": [38, 58],
  "D-006": [62, 45], "D-007": [55, 62], "D-008": [41, 35],
  "D-009": [50, 30], "D-010": [34, 48], "D-011": [66, 55],
  "D-012": [57, 40], "D-013": [43, 65], "D-014": [70, 42],
  "D-015": [37, 60], "D-016": [53, 70], "D-017": [47, 38],
  "D-018": [64, 62], "D-019": [31, 52], "D-020": [59, 52],
  "D-021": [45, 72], "D-022": [68, 33], "D-023": [36, 42],
  "D-024": [54, 58], "D-025": [42, 28], "D-026": [72, 50],
  "D-027": [49, 45], "D-028": [39, 70], "D-029": [61, 68],
  "D-030": [29, 38], "D-031": [56, 35],
  "N-101": [74, 52], "N-102": [70, 40], "N-103": [60, 72],
  "N-104": [78, 62], "N-105": [46, 78],
};

// POSITIONS stays as a lazy lookup — resolved at render time against actual container size
const POSITIONS = POSITIONS_PCT;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function rangeOverlap(a, b) {
  return Math.max(a[0], b[0]) < Math.min(a[1], b[1]);
}
function rangeMatch(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

// Compute co-location events between working set devices (devices with known positions)
function computeMeetingPoints(devices) {
  const pts = [];
  const positioned = devices.filter(d => POSITIONS[d.id]);
  for (let i = 0; i < positioned.length; i++) {
    for (let j = i + 1; j < positioned.length; j++) {
      const a = positioned[i], b = positioned[j];
      const ax = POSITIONS[a.id][0], ay = POSITIONS[a.id][1];
      const bx = POSITIONS[b.id][0], by = POSITIONS[b.id][1];
      const dist = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
      // Threshold: within ~12% distance units (positions are now in % of viewport)
      if (dist < 12 && rangeOverlap(a.range, b.range)) {
        const overlapStart = Math.max(a.range[0], b.range[0]);
        const overlapEnd   = Math.min(a.range[1], b.range[1]);
        pts.push({
          x: Math.round((ax + bx) / 2),
          y: Math.round((ay + by) / 2),
          devices: [a.id, b.id],
          timeRange: [overlapStart, overlapEnd],
        });
      }
    }
  }
  return pts;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Tag({ children, color = c.accentDim }) {
  return (
    <span style={{ background: color, color: c.text, borderRadius: 3, padding: "2px 6px", fontSize: 10, fontFamily: "monospace" }}>
      {children}
    </span>
  );
}

function Divider() {
  return <div style={{ borderTop: `1px solid ${c.border}`, margin: "12px 0" }} />;
}

function Label({ children }) {
  return <div style={{ fontSize: 10, color: c.textMuted, fontFamily: "monospace", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>{children}</div>;
}

function Note({ children, color = c.warn }) {
  return (
    <div style={{ background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 4, padding: "8px 10px", fontSize: 11, color, fontFamily: "monospace", marginTop: 8 }}>
      {children}
    </div>
  );
}

// ─── Map canvas (lo-fi) ──────────────────────────────────────────────────────
function MapCanvas({ devices, focusedId, workingSet, showMeetingPoints, deviceViews = {}, hoveredId, onHoverDevice, sessionWindow = [0, 72] }) {
  const workingSetIds = new Set((workingSet || []).map(d => d.id));
  const hasWorkingSet = workingSet && workingSet.length > 0;

  // Meeting points computed only over working set members (or all if no working set)
  const meetingPoints = useMemo(() => {
    if (!showMeetingPoints) return [];
    const scope = hasWorkingSet ? (workingSet || []) : devices;
    return computeMeetingPoints(scope);
  }, [showMeetingPoints, workingSet, devices, hasWorkingSet]);

  const [hoveredPt, setHoveredPt] = useState(null);

  return (
    <div style={{ background: c.surface, position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      {/* Grid lines — evenly spaced as percentages */}
      {[12.5, 25, 37.5, 50, 62.5, 75, 87.5].map(pct => (
        <div key={pct} style={{ position: "absolute", left: `${pct}%`, top: 0, bottom: 0, borderLeft: `1px solid ${c.border}`, opacity: 0.3 }} />
      ))}
      {[20, 40, 60, 80].map(pct => (
        <div key={pct} style={{ position: "absolute", top: `${pct}%`, left: 0, right: 0, borderTop: `1px solid ${c.border}`, opacity: 0.3 }} />
      ))}

      {/* Trace lines — SVG with viewBox 0 0 100 100 so % values map directly */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
           viewBox="0 0 100 100" preserveAspectRatio="none">
        {devices.map((d, i) => {
          const pos  = POSITIONS[d.id];
          const next = devices[i + 1] ? POSITIONS[devices[i + 1].id] : null;
          if (!pos || !next) return null;
          const isFocused = d.id === focusedId;
          const inWorking = hasWorkingSet ? workingSetIds.has(d.id) : true;
          const isMuted   = (deviceViews[d.id] || "visible") === "muted";
          const isDimmed  = (focusedId && !isFocused) || (hasWorkingSet && !inWorking) || isMuted;
          return (
            <line key={d.id + "-line"}
              x1={pos[0]} y1={pos[1]} x2={next[0]} y2={next[1]}
              stroke={isFocused ? c.anchor : isDimmed ? c.dimmed : "#555"}
              strokeWidth={isFocused ? 0.3 : 0.15}
              strokeDasharray={isMuted ? "0.4 0.6" : isDimmed ? "0.6 0.6" : "none"}
              opacity={isMuted ? 0.25 : isDimmed ? 0.2 : 0.8}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

        {/* Meeting point diamonds */}
        {meetingPoints.map((pt, i) => (
          <g key={i}
            onMouseEnter={() => setHoveredPt(pt)}
            onMouseLeave={() => setHoveredPt(null)}
            style={{ cursor: "default" }}
          >
            <polygon
              points={`${pt.x},${pt.y - 1.2} ${pt.x + 1.2},${pt.y} ${pt.x},${pt.y + 1.2} ${pt.x - 1.2},${pt.y}`}
              fill="none"
              stroke="#aaaaaa"
              strokeWidth={0.25}
              opacity={0.6}
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ))}
      </svg>

      {/* Device dots — positioned as % of container */}
      {devices.map(d => {
        const pos = POSITIONS[d.id];
        if (!pos) return null;
        const isFocused = d.id === focusedId;
        const isHovered = d.id === hoveredId && !isFocused;
        const inWorking = hasWorkingSet ? workingSetIds.has(d.id) : true;
        const isMuted   = (deviceViews[d.id] || "visible") === "muted";
        const isDimmed  = (focusedId && !isFocused) || (hasWorkingSet && !inWorking) || isMuted;
        const size = isFocused ? 14 : isHovered ? 14 : 10;
        return (
          <div
            key={d.id}
            onMouseEnter={() => onHoverDevice && onHoverDevice(d.id)}
            onMouseLeave={() => onHoverDevice && onHoverDevice(null)}
            style={{
              position: "absolute",
              left: `calc(${pos[0]}% - ${size / 2}px)`,
              top:  `calc(${pos[1]}% - ${size / 2}px)`,
              width: size, height: size,
              borderRadius: isFocused ? 2 : "50%",
              background: isFocused ? c.anchor : isHovered ? c.text : isDimmed ? c.dimmed : "#666",
              border: `2px solid ${isFocused ? c.anchor : isHovered ? c.text : isDimmed ? c.border : "#888"}`,
              boxShadow: isHovered ? `0 0 0 3px ${c.text}33` : "none",
              opacity: isMuted ? 0.25 : isDimmed ? 0.2 : 1,
              transition: "all 0.15s",
              zIndex: isFocused ? 4 : isHovered ? 3 : 1,
              cursor: "default",
            }}
            title={`${d.label}${isFocused ? " [FOCUSED]" : ""}`}
          />
        );
      })}

      {/* Meeting point tooltip */}
      {hoveredPt && (
        <div style={{
          position: "absolute",
          left: `calc(${hoveredPt.x}% + 12px)`,
          top:  `calc(${hoveredPt.y}% - 20px)`,
          background: c.panel,
          border: `1px solid ${c.border}`,
          borderRadius: 4,
          padding: "6px 10px",
          fontSize: 10,
          color: c.textMuted,
          fontFamily: "monospace",
          zIndex: 20,
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}>
          {hoveredPt.devices.join(" + ")}<br />
          {hoveredPt.timeRange[0]}h – {hoveredPt.timeRange[1]}h<br />
          <span style={{ color: c.textDim }}>within 15 m</span>
        </div>
      )}

      {/* Canvas labels */}
      <div style={{ position: "absolute", bottom: 8, left: 8, fontSize: 10, color: c.textDim, fontFamily: "monospace" }}>
        LO-FI MAP CANVAS — {devices.length} device{devices.length !== 1 ? "s" : ""} loaded
        {focusedId && <span style={{ color: c.anchor }}> · FOCUSED: {focusedId}</span>}
        {hasWorkingSet && <span style={{ color: c.anchor }}> · WORKING SET: {workingSet.length}</span>}
      </div>

      {showMeetingPoints && meetingPoints.length > 0 && (
        <div style={{ position: "absolute", top: 8, left: 8, background: `#aaaaaa18`, border: `1px solid #aaaaaa44`, borderRadius: 4, padding: "3px 8px", fontSize: 10, color: c.textMuted, fontFamily: "monospace" }}>
          ◇ {meetingPoints.length} co-location event{meetingPoints.length !== 1 ? "s" : ""} — hover to inspect
        </div>
      )}

      {focusedId && (
        <div style={{ position: "absolute", top: 8, right: 8, background: `${c.anchor}22`, border: `1px solid ${c.anchor}44`, borderRadius: 4, padding: "4px 8px", fontSize: 10, color: c.anchor, fontFamily: "monospace" }}>
          ▶ {focusedId} · {devices.length - 1} dimmed
        </div>
      )}
    </div>
  );
}

// ─── Density warning banner ──────────────────────────────────────────────────
function DensityWarning({ count, onDismiss }) {
  return (
    <div style={{ background: `${c.warn}15`, border: `1px solid ${c.warn}55`, borderRadius: 6, padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ fontSize: 11, color: c.warn, fontFamily: "monospace" }}>
        ⚠ {count} devices loaded — high density may affect map readability. Click a device to focus it and begin reducing.
      </div>
      <button onClick={onDismiss} style={{ ...btn.base, background: "transparent", color: c.warn, border: `1px solid ${c.warn}55`, fontSize: 10 }}>
        Dismiss
      </button>
    </div>
  );
}

// ─── Proximity config + results ──────────────────────────────────────────────
const RESULT_CAP = 100;

function NearbyDevicesPanel({ sessionDevices, focusedId, sessionWindow = [0, 72], onAddDevice, onPromoteWorkingSet, onClose }) {
  const [step, setStep] = useState("config"); // config | count | running | results
  const [temporalOn, setTemporalOn] = useState(false);
  const [timeWindowValue, setTimeWindowValue] = useState("");
  const [timeWindowUnit, setTimeWindowUnit] = useState("hours");
  const timeWindow = timeWindowValue ? `${timeWindowValue} ${timeWindowUnit}` : "";
  const [results, setResults] = useState([]);
  const [pendingAdd, setPendingAdd] = useState(null);
  const [previewCount, setPreviewCount] = useState(null);
  const [sortKey, setSortKey] = useState("distance"); // distance | time | id

  const focusedDevice = sessionDevices.find(d => d.id === focusedId);

  // Simulate pre-query count — temporal window active triggers large count to demo truncation warning
  function checkCount() {
    const simulated = (temporalOn && timeWindow) ? NEARBY_POOL.length : 340;
    setPreviewCount(simulated);
    setStep("count");
  }

  function runQuery() {
    setStep("running");
    setTimeout(() => {
      const r = NEARBY_POOL.filter(d => !d.inSession || sessionDevices.find(s => s.id === d.id));
      setResults(r);
      setStep("results");
    }, 900);
  }

  function handleAdd(device) {
    if (sessionDevices.find(d => d.id === device.id)) return;
    const match   = rangeMatch(device.range, sessionWindow);
    const overlap = rangeOverlap(device.range, sessionWindow);
    if (!overlap)      setPendingAdd({ device, type: "zero" });
    else if (!match)   setPendingAdd({ device, type: "mismatch" });
    else               onAddDevice(device);
  }

  function confirmAdd(mode) {
    if (mode === "cancel" || pendingAdd.type === "zero") { setPendingAdd(null); return; }
    onAddDevice(pendingAdd.device);
    setPendingAdd(null);
  }

  // "Reduce to working set" — focused device + all addable results
  function handlePromote() {
    const workingIds = new Set([focusedId]);
    results.forEach(d => {
      if (rangeOverlap(d.range, sessionWindow)) workingIds.add(d.id);
    });
    onPromoteWorkingSet([...workingIds]);
    onClose();
  }

  const totalResults = NEARBY_POOL.length;
  const shown = results.length;
  const addableCount = results.filter(d => !sessionDevices.find(s => s.id === d.id) && rangeOverlap(d.range, sessionWindow)).length;

  return (
    <div style={{ background: c.panel, border: `1px solid ${c.border}`, borderRadius: 6, padding: 16, position: "relative", display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}>
      {/* Timeline alignment modal */}
      {pendingAdd && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
          <div style={{ background: c.surface, border: `1px solid ${c.warn}`, borderRadius: 6, padding: 20, width: 340 }}>
            {pendingAdd.type === "zero" ? (
              <>
                <div style={{ fontSize: 13, color: c.danger, fontFamily: "monospace", marginBottom: 8 }}>⛔ No data overlap</div>
                <div style={{ fontSize: 11, color: c.text, fontFamily: "monospace", marginBottom: 12 }}>
                  {pendingAdd.device.label} has no data within the active session window ({sessionWindow[0]}–{sessionWindow[1]}h). Adding this device would produce an empty trace.
                </div>
                <Note color={c.danger}>Device cannot be added — no data overlap with session window.</Note>
                <div style={{ marginTop: 12 }}>
                  <button onClick={() => setPendingAdd(null)} style={{ ...btn.base, background: c.surface, color: c.text, border: `1px solid ${c.border}` }}>Close</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 13, color: c.warn, fontFamily: "monospace", marginBottom: 8 }}>⚠ Data range mismatch</div>
                <div style={{ fontSize: 11, color: c.text, fontFamily: "monospace", marginBottom: 4 }}>
                  {pendingAdd.device.label} data range: <b style={{ color: c.warn }}>{pendingAdd.device.range[0]}h – {pendingAdd.device.range[1]}h</b>
                </div>
                <div style={{ fontSize: 11, color: c.text, fontFamily: "monospace", marginBottom: 12 }}>
                  Session window: <b style={{ color: c.accent }}>{sessionWindow[0]}h – {sessionWindow[1]}h</b>
                </div>
                <Label>How would you like to add this device?</Label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                  <button onClick={() => confirmAdd("intersection")} style={{ ...btn.base, background: `${c.accent}22`, color: c.accent, border: `1px solid ${c.accent}44`, textAlign: "left" }}>
                    Add with intersection only — show data where it exists, grey elsewhere
                  </button>
                  <button onClick={() => confirmAdd("full")} style={{ ...btn.base, background: c.surface, color: c.text, border: `1px solid ${c.border}`, textAlign: "left" }}>
                    Add full available range — extends outside session window
                  </button>
                  <button onClick={() => confirmAdd("cancel")} style={{ ...btn.base, background: "transparent", color: c.textMuted, border: `1px solid ${c.border}`, textAlign: "left" }}>
                    Cancel — do not add
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: c.text, fontFamily: "monospace", fontWeight: "bold" }}>NEARBY DEVICES ENGINE</div>
        <button onClick={onClose} style={{ ...btn.base, background: "transparent", color: c.textMuted, border: "none", fontSize: 16 }}>×</button>
      </div>

      {/* Focused device context */}
      {focusedDevice && (
        <div style={{ background: `${c.anchor}15`, border: `1px solid ${c.anchor}44`, borderRadius: 4, padding: "7px 10px", fontSize: 11, color: c.anchor, fontFamily: "monospace", marginBottom: 12 }}>
          ▶ Querying from: {focusedDevice.label}
        </div>
      )}

      {step === "config" && (
        <>
          <Label>Spatial proximity — always active</Label>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{
              background: c.panel, border: `1px solid ${c.border}`,
              borderRadius: 4, padding: "6px 12px",
              fontFamily: "monospace", fontSize: 12, color: c.textMuted,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ color: c.text, fontWeight: "bold" }}>15 m</span>
              <span style={{ color: c.textDim }}>fixed · Haversine formula</span>
            </div>
            <span style={{ fontSize: 10, color: c.textDim, fontFamily: "monospace" }}>radius is system-defined</span>
          </div>

          <Divider />

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div
              onClick={() => setTemporalOn(!temporalOn)}
              style={{ width: 32, height: 18, background: temporalOn ? c.accent : c.border, borderRadius: 9, cursor: "pointer", position: "relative", transition: "background 0.2s" }}
            >
              <div style={{ position: "absolute", top: 2, left: temporalOn ? 14 : 2, width: 14, height: 14, background: "#fff", borderRadius: "50%", transition: "left 0.2s" }} />
            </div>
            <Label>Temporal overlap — optional</Label>
          </div>

          {temporalOn && (
            <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 8, paddingLeft: 8 }}>
              <input
                type="number"
                min="1"
                placeholder="e.g. 6"
                value={timeWindowValue}
                onChange={e => setTimeWindowValue(e.target.value)}
                style={{
                  background: c.surface, border: `1px solid ${c.accent}44`,
                  borderRadius: "4px 0 0 4px", borderRight: "none",
                  color: c.text, fontFamily: "monospace", fontSize: 12,
                  padding: "6px 10px", width: 80, outline: "none",
                }}
              />
              <select
                value={timeWindowUnit}
                onChange={e => setTimeWindowUnit(e.target.value)}
                style={{
                  background: c.panel, border: `1px solid ${c.accent}44`,
                  borderRadius: "0 4px 4px 0",
                  color: c.text, fontFamily: "monospace", fontSize: 12,
                  padding: "6px 10px", cursor: "pointer", outline: "none",
                }}
              >
                {["minutes", "hours", "days", "weeks", "months", "years"].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          )}

          <Note>Query is analyst-initiated only. No background pre-fetch occurs.</Note>

          <div style={{ marginTop: 12 }}>
            <button
              onClick={checkCount}
              style={{ ...btn.base, background: c.accent, color: "#fff" }}
            >
              Find Nearby Devices
            </button>
          </div>
        </>
      )}

      {step === "count" && previewCount !== null && (
        <>
          {previewCount > RESULT_CAP ? (
            <div style={{ background: `${c.warn}12`, border: `1px solid ${c.warn}55`, borderRadius: 4, padding: "12px 14px", marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: c.warn, fontFamily: "monospace", marginBottom: 6 }}>
                ⚠ {previewCount} devices found
              </div>
              <div style={{ fontSize: 11, color: c.text, fontFamily: "monospace", marginBottom: 10 }}>
                Results will be capped at {RESULT_CAP}. Devices beyond the cap will not be returned — they are not missing, but they are not visible in this query.
              </div>
              <div style={{ fontSize: 11, color: c.warn, fontFamily: "monospace", marginBottom: 12 }}>
                Showing {RESULT_CAP} of {previewCount} — refine radius or add temporal filter to reduce the set.
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={runQuery} style={{ ...btn.base, background: `${c.warn}22`, color: c.warn, border: `1px solid ${c.warn}55` }}>
                  Proceed with cap ({RESULT_CAP} results)
                </button>
                <button onClick={() => setStep("config")} style={{ ...btn.base, background: "transparent", color: c.textMuted, border: `1px solid ${c.border}` }}>
                  ← Refine parameters
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background: `${c.success}12`, border: `1px solid ${c.success}44`, borderRadius: 4, padding: "12px 14px", marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: c.success, fontFamily: "monospace", marginBottom: 6 }}>
                {previewCount} device{previewCount !== 1 ? "s" : ""} found
              </div>
              <div style={{ fontSize: 11, color: c.text, fontFamily: "monospace", marginBottom: 12 }}>
                All results within cap ({RESULT_CAP}). Query will return the full set.
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={runQuery} style={{ ...btn.base, background: c.accent, color: "#fff" }}>
                  Run query →
                </button>
                <button onClick={() => setStep("config")} style={{ ...btn.base, background: "transparent", color: c.textMuted, border: `1px solid ${c.border}` }}>
                  ← Back
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {step === "running" && (
        <div style={{ padding: "24px 0", textAlign: "center", color: c.textMuted, fontFamily: "monospace", fontSize: 12 }}>
          <div style={{ marginBottom: 8 }}>Querying from {focusedDevice?.label || "focused device"}…</div>
          <Tag color={c.accentDim}>running</Tag>
        </div>
      )}

      {step === "results" && (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}>
          <div style={{ fontSize: 11, color: c.textMuted, fontFamily: "monospace", marginBottom: 10, flexShrink: 0 }}>
            {shown} of {totalResults} results{temporalOn && timeWindow ? ` · temporal: ${timeWindow}` : ""} · 15 m radius
          </div>

          {/* Sort selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 10, color: c.textMuted, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1 }}>Sort by</span>
            {[
              { key: "distance", label: "Distance" },
              { key: "time",     label: "Temporal overlap" },
              { key: "id",       label: "Device ID" },
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => setSortKey(opt.key)}
                style={{
                  ...btn.base,
                  padding: "4px 10px",
                  fontSize: 10,
                  background: sortKey === opt.key ? `${c.accent}22` : "transparent",
                  color:      sortKey === opt.key ? c.accent : c.textMuted,
                  border:    `1px solid ${sortKey === opt.key ? c.accent + "66" : c.border}`,
                }}
              >
                {opt.label}
                {sortKey === opt.key && <span style={{ marginLeft: 4, opacity: 0.7 }}>▲</span>}
              </button>
            ))}
          </div>
          <Note color={c.textMuted}>Sorted by analyst choice — no system ranking applied. Proximity signal is always the query basis.</Note>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10, flex: 1, minHeight: 0, overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: `${c.border} transparent` }}>
            {[...results].sort((a, b) => {
              if (sortKey === "id")   return a.id.localeCompare(b.id);
              if (sortKey === "time") return (b.range[1] - b.range[0]) - (a.range[1] - a.range[0]);
              const pa = POSITIONS[a.id], pb = POSITIONS[b.id];
              if (!pa && !pb) return 0;
              if (!pa) return 1;
              if (!pb) return -1;
              const anchor = POSITIONS[Object.keys(POSITIONS)[0]];
              const da = Math.hypot(pa[0] - anchor[0], pa[1] - anchor[1]);
              const db = Math.hypot(pb[0] - anchor[0], pb[1] - anchor[1]);
              return da - db;
            }).map(d => {
              const inSession = !!sessionDevices.find(s => s.id === d.id);
              const noOverlap = !rangeOverlap(d.range, sessionWindow);
              const events = d.nearbyAt || [];
              return (
                <div key={d.id} style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 6, overflow: "hidden" }}>
                  {/* Top row: label + badges + add button */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px 4px" }}>
                    <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: "bold", color: c.text, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                      {d.id}
                      {inSession && <Tag color="#333">in session</Tag>}
                      {noOverlap && <Tag color={c.danger}>no overlap</Tag>}
                      {!inSession && !noOverlap && !rangeMatch(d.range, sessionWindow) && <Tag color={`${c.warn}55`}>partial range</Tag>}
                    </div>
                    <button
                      onClick={() => handleAdd(d)}
                      disabled={inSession}
                      style={{ ...btn.base, background: inSession ? c.border : `${c.accent}22`, color: inSession ? c.textDim : c.accent, border: `1px solid ${inSession ? c.border : c.accent + "44"}`, cursor: inSession ? "not-allowed" : "pointer", fontSize: 11, flexShrink: 0 }}
                    >
                      {inSession ? "In session" : "Add"}
                    </button>
                  </div>

                  {/* Model */}
                  <div style={{ padding: "0 12px 6px", fontSize: 11, color: c.textMuted, fontFamily: "monospace" }}>
                    {d.model || "—"}
                  </div>

                  {/* Co-location events */}
                  {events.length > 0 && (
                    <div style={{ borderTop: `1px solid ${c.border}`, padding: "6px 12px 8px", display: "flex", flexDirection: "column", gap: 3 }}>
                      <span style={{ fontSize: 9, color: c.textDim, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Nearby at</span>
                      {events.map((ev, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 10, color: c.textMuted, fontFamily: "monospace" }}>📍 {ev.date}</span>
                          <span style={{ fontSize: 10, color: c.text, fontFamily: "monospace" }}>{ev.time}</span>
                          <span style={{ fontSize: 9, color: c.textDim, fontFamily: "monospace" }}>· {ev.duration}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {events.length === 0 && !noOverlap && (
                    <div style={{ borderTop: `1px solid ${c.border}`, padding: "6px 12px 8px" }}>
                      <span style={{ fontSize: 10, color: c.textDim, fontFamily: "monospace" }}>No co-location events detected</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Reduce to working set */}
          <Divider />
          <div style={{ background: `${c.anchor}10`, border: `1px solid ${c.anchor}44`, borderRadius: 4, padding: "10px 12px" }}>
            <div style={{ fontSize: 11, color: c.anchor, fontFamily: "monospace", marginBottom: 8 }}>
              ▶ Isolate working set — focused device + nearby results + visible devices
            </div>
            <div style={{ fontSize: 10, color: c.textMuted, fontFamily: "monospace", marginBottom: 10 }}>
              Suppresses muted and hidden devices. No data is discarded — suppression is visual only.
            </div>
            <button
              onClick={handlePromote}
              style={{ ...btn.base, background: `${c.anchor}22`, color: c.anchor, border: `1px solid ${c.anchor}44` }}
            >
              Isolate working set →
            </button>
          </div>

          <div style={{ marginTop: 10, flexShrink: 0 }}>
            <button onClick={() => setStep("config")} style={{ ...btn.base, background: "transparent", color: c.textMuted, border: `1px solid ${c.border}`, fontSize: 11 }}>← Refine parameters</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Device scroll panel ─────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "id-asc",  label: "ID ↑" },
  { value: "id-desc", label: "ID ↓" },
  { value: "last-seen", label: "Last seen" },
  { value: "status",  label: "Status" },
];

// ─── Device info panel ───────────────────────────────────────────────────────
function DeviceInfoPanel({ device, onClose, focusedId, onSetFocus }) {
  if (!device) return null;
  const isFocused = device.id === focusedId;
  const fields = [
    { label: "ID",             value: device.id },
    { label: "DEVICE MODEL",   value: device.model || "—" },
    { label: "OS VERSION",     value: device.os || "—" },
    { label: "CARRIER",        value: device.carrier || "—" },
    { label: "LAST BACKUP",    value: device.lastSeen || "—" },
    { label: "APP COUNT",      value: device.appCount != null ? `${device.appCount} app${device.appCount !== 1 ? "s" : ""}` : "—" },
    { label: "SYSTEM VERSION", value: device.sysVersion || "—" },
  ];
  return (
    <div style={{ background: c.surface, border: `1px solid ${isFocused ? c.anchor + "88" : c.border}`, borderRadius: 6, overflow: "hidden", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "10px 12px", borderBottom: `1px solid ${c.border}`, gap: 8, flexShrink: 0 }}>
        <button onClick={onClose} style={{ ...btn.base, background: "transparent", color: c.textDim, border: "none", padding: "2px 4px", fontSize: 13 }}>←</button>
        <span style={{ flex: 1, fontSize: 12, color: c.text, fontFamily: "monospace", fontWeight: "bold" }}>Device Details</span>
        <button
          onClick={() => onSetFocus(device.id)}
          style={{ ...btn.base, fontSize: 10, padding: "4px 10px", background: isFocused ? `${c.anchor}22` : c.panel, color: isFocused ? c.anchor : c.textMuted, border: `1px solid ${isFocused ? c.anchor + "55" : c.border}` }}
        >
          {isFocused ? "▶ Focused" : "Focus"}
        </button>
        <button onClick={onClose} style={{ ...btn.base, background: "transparent", color: c.textDim, border: "none", padding: "2px 4px", fontSize: 15 }}>×</button>
      </div>

      {/* Fields */}
      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: `${c.border} transparent` }}>
        {fields.map(({ label, value }, i) => (
          <div key={label} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 16px",
            borderBottom: i < fields.length - 1 ? `1px solid ${c.border}` : "none",
            background: i % 2 === 0 ? "transparent" : `${c.panel}55`,
          }}>
            <span style={{ fontSize: 10, color: c.textDim, fontFamily: "monospace", letterSpacing: "0.06em" }}>{label}</span>
            <span style={{ fontSize: 13, color: c.text, fontFamily: "monospace" }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Footer — IP */}
      <div style={{ padding: "8px 16px", borderTop: `1px solid ${c.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: c.panel, flexShrink: 0 }}>
        <span style={{ fontSize: 9, color: c.textDim, fontFamily: "monospace" }}>IP UPDATED: {device.lastSeen || "—"}</span>
        <span style={{ fontSize: 11, color: c.textMuted, fontFamily: "monospace" }}>{device.ip || "—"}</span>
      </div>
    </div>
  );
}

// ─── Carousel view ───────────────────────────────────────────────────────────
function CarouselPanel({ sessionDevices, focusedId, onSetFocus }) {
  const [idx, setIdx] = useState(0);
  const total = sessionDevices.length;
  if (total === 0) return null;
  const d = sessionDevices[Math.min(idx, total - 1)];
  const isFocused = d.id === focusedId;
  const fields = [
    { label: "ID",             value: d.id },
    { label: "DEVICE MODEL",   value: d.model || "—" },
    { label: "OS VERSION",     value: d.os || "—" },
    { label: "CARRIER",        value: d.carrier || "—" },
    { label: "LAST BACKUP",    value: d.lastSeen || "—" },
    { label: "APP COUNT",      value: d.appCount != null ? `${d.appCount} app${d.appCount !== 1 ? "s" : ""}` : "—" },
    { label: "SYSTEM VERSION", value: d.sysVersion || "—" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      {/* Fields — same layout as DeviceInfoPanel */}
      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: `${c.border} transparent` }}>
        {fields.map(({ label, value }, i) => (
          <div key={label} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 16px",
            borderBottom: `1px solid ${c.border}`,
            background: i % 2 === 0 ? "transparent" : `${c.panel}55`,
          }}>
            <span style={{ fontSize: 10, color: c.textDim, fontFamily: "monospace", letterSpacing: "0.06em" }}>{label}</span>
            <span style={{ fontSize: 13, color: c.text, fontFamily: "monospace" }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Footer: IP + nav + focus */}
      <div style={{ borderTop: `1px solid ${c.border}`, background: c.panel, flexShrink: 0 }}>
        {/* IP row */}
        <div style={{ padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${c.border}` }}>
          <span style={{ fontSize: 9, color: c.textDim, fontFamily: "monospace" }}>IP UPDATED: {d.lastSeen || "—"}</span>
          <span style={{ fontSize: 11, color: c.textMuted, fontFamily: "monospace" }}>{d.ip || "—"}</span>
        </div>
        {/* Nav + focus row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px" }}>
          <button
            onClick={() => setIdx(i => Math.max(0, i - 1))}
            disabled={idx === 0}
            style={{ ...btn.base, padding: "4px 10px", background: "transparent", color: idx === 0 ? c.textDim : c.textMuted, border: `1px solid ${c.border}` }}
          >‹</button>
          <span style={{ fontSize: 10, color: c.textDim, fontFamily: "monospace", minWidth: 40, textAlign: "center" }}>{idx + 1} / {total}</span>
          <button
            onClick={() => setIdx(i => Math.min(total - 1, i + 1))}
            disabled={idx === total - 1}
            style={{ ...btn.base, padding: "4px 10px", background: "transparent", color: idx === total - 1 ? c.textDim : c.textMuted, border: `1px solid ${c.border}` }}
          >›</button>
          <button
            onClick={() => onSetFocus(d.id)}
            style={{
              ...btn.base, flex: 1,
              background: isFocused ? `${c.anchor}22` : "transparent",
              color: isFocused ? c.anchor : c.textMuted,
              border: `1px solid ${isFocused ? c.anchor + "55" : c.border}`,
              fontSize: 11,
            }}
          >
            {isFocused ? "▶ Focused" : "◎ Set as focus"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Unified device panel — list / carousel / working set ────────────────────
function DevicePanel({
  sessionDevices, focusedId, deviceViews,
  hasWorkingSet, workingSetForDisplay,
  onSetFocus, onCycleView, onRemoveDevice, onSelectDevice, getView,
  sessionWindow, onClearWorkingSet,
  hoveredId, onHoverDevice,
}) {
  const [view, setView] = useState("list"); // "list" | "carousel" | "working-set"

  // Auto-switch to working-set when one is promoted
  const prevHas = useState(hasWorkingSet)[0];
  if (hasWorkingSet && !prevHas) setView("working-set");

  const deviceCount = view === "working-set" ? (hasWorkingSet ? workingSetForDisplay.length : 0) : sessionDevices.length;

  // Icon SVGs inline as text symbols
  const ICON_LIST     = "⊞";
  const ICON_CAROUSEL = "◫";
  const ICON_WORKING  = "◈";

  const viewButtons = [
    { id: "list",        icon: ICON_LIST,     title: "List view" },
    { id: "carousel",    icon: ICON_CAROUSEL, title: "Carousel view" },
    { id: "working-set", icon: ICON_WORKING,  title: "Working set", disabled: !hasWorkingSet },
  ];

  return (
    <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 6, overflow: "hidden", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", padding: "8px 10px", borderBottom: `1px solid ${c.border}`, gap: 8, flexShrink: 0 }}>

        {/* View toggle group */}
        <div style={{ display: "flex", background: c.panel, borderRadius: 5, border: `1px solid ${c.border}`, overflow: "hidden" }}>
          {viewButtons.map(vb => {
            const isActive = view === vb.id;
            return (
              <button
                key={vb.id}
                onClick={() => !vb.disabled && setView(vb.id)}
                title={vb.title}
                disabled={vb.disabled}
                style={{
                  ...btn.base,
                  padding: "5px 9px", borderRadius: 0,
                  background: isActive ? c.borderLight : "transparent",
                  color: vb.disabled ? c.textDim : isActive ? c.text : c.textMuted,
                  fontSize: 13, border: "none",
                  cursor: vb.disabled ? "default" : "pointer",
                  borderRight: `1px solid ${c.border}`,
                }}
              >
                {vb.icon}
              </button>
            );
          })}
        </div>

        {/* Device count label */}
        <span style={{ flex: 1, fontSize: 12, fontWeight: "bold", color: c.text, fontFamily: "monospace", textAlign: "center" }}>
          {deviceCount} Device{deviceCount !== 1 ? "s" : ""}
        </span>

        {/* Context menu */}
        <button
          onClick={() => {}}
          title="Panel options"
          style={{ ...btn.base, padding: "4px 7px", background: "transparent", color: c.textDim, border: "none", fontSize: 14 }}
        >
          ⋮
        </button>

        {/* Close / collapse — noop placeholder */}
        <button
          onClick={() => {}}
          title="Close panel"
          style={{ ...btn.base, padding: "4px 7px", background: "transparent", color: c.textDim, border: "none", fontSize: 14 }}
        >
          ×
        </button>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {view === "list" && (
        <DeviceScrollPanel
          sessionDevices={sessionDevices}
          focusedId={focusedId}
          deviceViews={deviceViews}
          hasWorkingSet={hasWorkingSet}
          workingSetForDisplay={workingSetForDisplay}
          onSetFocus={onSetFocus}
          onCycleView={onCycleView}
          onRemoveDevice={onRemoveDevice}
          onSelectDevice={onSelectDevice}
          getView={getView}
          sessionWindow={sessionWindow}
          embedded={true}
          hoveredId={hoveredId}
          onHoverDevice={onHoverDevice}
        />
      )}

      {view === "carousel" && (
        <CarouselPanel
          sessionDevices={sessionDevices}
          focusedId={focusedId}
          onSetFocus={onSetFocus}
        />
      )}

      {view === "working-set" && hasWorkingSet && (
        <WorkingSetPanel
          workingSet={workingSetForDisplay}
          sessionDevices={sessionDevices}
          focusedId={focusedId}
          onClear={() => { onClearWorkingSet(); setView("list"); }}
          onSelectDevice={onSelectDevice}
          sessionWindow={sessionWindow}
          embedded={true}
        />
      )}

      {view === "working-set" && !hasWorkingSet && (
        <div style={{ padding: "24px 16px", textAlign: "center", fontSize: 11, color: c.textDim, fontFamily: "monospace" }}>
          No working set yet — focus a device and run Nearby Devices to build one.
        </div>
      )}
      </div>{/* end content */}
    </div>
  );
}

function DeviceScrollPanel({
  sessionDevices, focusedId, deviceViews,
  hasWorkingSet, workingSetForDisplay,
  onSetFocus, onCycleView, onRemoveDevice, onSelectDevice, getView,
  sessionWindow = [0, 72], embedded = false,
  hoveredId, onHoverDevice,
}) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const filtered = [...sessionDevices].sort((a, b) => {
    if (sortBy === "id-asc")   return a.id.localeCompare(b.id);
    if (sortBy === "id-desc")  return b.id.localeCompare(a.id);
    if (sortBy === "last-seen") return (a.lastSeen || "").localeCompare(b.lastSeen || "");
    if (sortBy === "status")   return getView(a.id).localeCompare(getView(b.id));
    return 0;
  }).filter(d => {
    if (search === "") return true;
    return d.id.toLowerCase().includes(search.toLowerCase()) ||
           d.label.toLowerCase().includes(search.toLowerCase());
  });


  const wrap = (content) => embedded
    ? <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}>{content}</div>
    : <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 6, overflow: "hidden", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>{content}</div>;

  return wrap(
    <>
      {/* ── Header ── */}
      <div style={{ padding: "10px 12px 0", borderBottom: `1px solid ${c.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          {focusedId
            ? <span style={{ fontSize: 10, color: c.anchor, fontFamily: "monospace" }}>▶ {focusedId} · focused</span>
            : <span style={{ fontSize: 10, color: c.textDim, fontFamily: "monospace" }}>no device focused</span>
          }
        </div>

        {/* Search + Sort row */}
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: c.textDim, pointerEvents: "none" }}>⌕</span>
            <input
              type="text"
              placeholder="Search device ID or label…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", boxSizing: "border-box",
                background: c.panel, border: `1px solid ${c.border}`,
                borderRadius: 4, color: c.text,
                fontFamily: "monospace", fontSize: 11,
                padding: "5px 8px 5px 24px",
                outline: "none",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: c.textDim, cursor: "pointer", fontSize: 12, padding: 0 }}>×</button>
            )}
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              background: c.panel, border: `1px solid ${c.border}`,
              borderRadius: 4, color: c.textMuted,
              fontFamily: "monospace", fontSize: 11,
              padding: "5px 8px", outline: "none", cursor: "pointer",
              flexShrink: 0,
            }}
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* ── Scrollable list ── */}
      <div style={{
        overflowY: "auto",
        flex: 1,
        paddingTop: 8,
        scrollbarWidth: "thin",
        scrollbarColor: `${c.border} transparent`,
      }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "16px 12px", fontSize: 11, color: c.textDim, fontFamily: "monospace", textAlign: "center" }}>
            No devices match "{search}"
          </div>
        ) : (
          filtered.map((d, i) => {
            const isFocused = d.id === focusedId;
            const isHovered = d.id === hoveredId && !isFocused;
            const isPartial = d.range[0] > sessionWindow[0] || d.range[1] < sessionWindow[1];
            const inWorking = hasWorkingSet ? workingSetForDisplay.find(w => w.id === d.id) : true;
            const view      = getView(d.id);
            const viewColor = VIEW_COLORS[view];

            return (
              <div
                key={d.id}
                onClick={() => onSelectDevice && onSelectDevice(d.id)}
                onMouseEnter={() => onHoverDevice && onHoverDevice(d.id)}
                onMouseLeave={() => onHoverDevice && onHoverDevice(null)}
                style={{
                  margin: "0 8px 6px",
                  borderRadius: 6,
                  border: `1px solid ${isFocused ? c.anchor + "88" : isHovered ? c.borderLight : c.border}`,
                  background: isFocused ? `${c.anchor}0e` : isHovered ? c.borderLight + "33" : c.panel,
                  opacity: view === "hidden" ? 0.3 : hasWorkingSet && !inWorking ? 0.4 : 1,
                  transition: "opacity 0.15s, border-color 0.15s, background 0.15s",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
              >
                {/* Top row: ID + actions */}
                <div style={{ display: "flex", alignItems: "center", padding: "8px 10px 4px" }}>
                  {/* Focus indicator dot */}
                  <div style={{
                    width: 8, height: 8, borderRadius: isFocused ? 2 : "50%",
                    background: isFocused ? c.anchor : "#555",
                    flexShrink: 0, marginRight: 8,
                  }} />

                  {/* Device ID */}
                  <span style={{
                    flex: 1,
                    color: isFocused ? c.anchor : c.text,
                    fontSize: 13, fontWeight: "bold",
                    letterSpacing: "0.03em",
                    fontFamily: "monospace",
                  }}>
                    {isFocused ? "▶ " : ""}{d.id}
                  </span>

                  {/* Partial badge */}
                  {isPartial && (
                    <span style={{ fontSize: 9, color: c.warn, fontFamily: "monospace", marginRight: 6 }}>partial</span>
                  )}

                  {/* View cycle */}
                  <button
                    onClick={e => { e.stopPropagation(); onCycleView(d.id); }}
                    title={`${view} — click to cycle`}
                    style={{
                      ...btn.base,
                      padding: "2px 6px", fontSize: 9,
                      background: view !== "visible" ? `${viewColor}20` : "transparent",
                      color: viewColor,
                      border: `1px solid ${view !== "visible" ? viewColor + "55" : c.border}`,
                      borderRadius: 3,
                      marginLeft: 4,
                    }}
                  >
                    {view === "visible" ? "View" : view === "muted" ? "Muted" : "Hidden"}
                  </button>

                  {/* Focus mode */}
                  <button
                    onClick={e => { e.stopPropagation(); onSetFocus(d.id); }}
                    title={isFocused ? "Clear focus" : "Set as focus device"}
                    style={{
                      ...btn.base,
                      padding: "2px 6px", fontSize: 11,
                      background: "transparent",
                      color: isFocused ? c.anchor : c.textDim,
                      border: "none",
                    }}
                  >
                    ◎
                  </button>

                  {/* Flag */}
                  <button
                    onClick={e => e.stopPropagation()}
                    title="Flag device"
                    style={{
                      ...btn.base,
                      padding: "2px 6px", fontSize: 11,
                      background: "transparent",
                      color: c.textDim,
                      border: "none",
                    }}
                  >
                    ⚑
                  </button>

                  {/* Context menu */}
                  <button
                    onClick={e => e.stopPropagation()}
                    title="Open context menu"
                    style={{
                      ...btn.base,
                      padding: "2px 6px", fontSize: 13,
                      background: "transparent",
                      color: c.textDim,
                      border: "none",
                    }}
                  >
                    ⋮
                  </button>
                </div>

                {/* Bottom row: model + last seen */}
                <div style={{ padding: "0 10px 8px 26px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: c.textMuted, fontFamily: "monospace" }}>{d.model || "—"}</span>
                  <span style={{ fontSize: 10, color: c.textDim }}>·</span>
                  <span style={{ fontSize: 10, color: c.textDim, fontFamily: "monospace" }}>⊙ {d.lastSeen || "—"}</span>
                  <span style={{ marginLeft: "auto", fontSize: 9, color: c.textDim }}>›</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{ padding: "6px 12px", borderTop: `1px solid ${c.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 9, color: c.textDim, fontFamily: "monospace" }}>
          {filtered.length < sessionDevices.length
            ? `${filtered.length} of ${sessionDevices.length} shown`
            : `${sessionDevices.length} device${sessionDevices.length !== 1 ? "s" : ""}`}
        </span>
        {!focusedId && (
          <span style={{ fontSize: 9, color: c.textDim, fontFamily: "monospace" }}>click name → focus device</span>
        )}
      </div>
    </>
  );
}

// ─── Working set panel ───────────────────────────────────────────────────────
function WorkingSetPanel({ workingSet, sessionDevices, focusedId, onClear, onSelectDevice, sessionWindow = [0, 72], embedded = false }) {
  const inner = (
    <>
      {/* Header */}
      <div style={{ padding: "10px 12px 8px", borderBottom: `1px solid ${c.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 10, color: c.textMuted, fontFamily: "monospace" }}>{workingSet.length} of {sessionDevices.length} devices · full opacity</span>
        <button onClick={onClear} style={{ ...btn.base, background: "transparent", color: c.textMuted, border: `1px solid ${c.border}`, fontSize: 10 }}>Clear</button>
      </div>

      {/* Cards */}
      <div style={{ overflowY: "auto", flex: 1, minHeight: 0, paddingTop: 8, scrollbarWidth: "thin", scrollbarColor: `${c.border} transparent` }}>
        {workingSet.map(d => {
          const isFocused = d.id === focusedId;
          const isPartial = d.range[0] > sessionWindow[0] || d.range[1] < sessionWindow[1];
          return (
            <div key={d.id} style={{
              margin: "0 8px 6px",
              borderRadius: 6,
              border: `1px solid ${isFocused ? c.anchor + "88" : c.border}`,
              background: isFocused ? `${c.anchor}0e` : c.panel,
              overflow: "hidden",
            }}>
              {/* Top row: dot + ID + partial badge */}
              <div style={{ display: "flex", alignItems: "center", padding: "8px 10px 4px", gap: 8 }}>
                <div style={{
                  width: 8, height: 8, flexShrink: 0,
                  borderRadius: isFocused ? 2 : "50%",
                  background: isFocused ? c.anchor : "#555",
                }} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: "bold", color: isFocused ? c.anchor : c.text, fontFamily: "monospace" }}>
                  {isFocused ? "▶ " : ""}{d.id}
                </span>
                {isFocused && <Tag color={`${c.anchor}44`}>focused</Tag>}
                {isPartial && <span style={{ fontSize: 9, color: c.warn, fontFamily: "monospace" }}>partial</span>}
              </div>

              {/* Bottom row: model + last seen — click to open detail */}
              <button
                onClick={() => onSelectDevice && onSelectDevice(d.id)}
                style={{ ...btn.base, width: "100%", padding: "0 10px 8px 26px", display: "flex", alignItems: "center", gap: 8, background: "transparent", borderRadius: 0, textAlign: "left", cursor: "pointer" }}
              >
                <span style={{ fontSize: 11, color: c.textMuted, fontFamily: "monospace" }}>{d.model || "—"}</span>
                <span style={{ fontSize: 10, color: c.textDim }}>·</span>
                <span style={{ fontSize: 10, color: c.textDim, fontFamily: "monospace" }}>⊙ {d.lastSeen || "—"}</span>
                <span style={{ marginLeft: "auto", fontSize: 9, color: c.textDim }}>›</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div style={{ padding: "8px 12px", borderTop: `1px solid ${c.border}`, flexShrink: 0 }}>
        <Note color={c.textDim}>Focused device + nearby results + visible devices. {sessionDevices.length - workingSet.length} suppressed — no data removed.</Note>
      </div>
    </>
  );
  if (embedded) return <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}>{inner}</div>;
  return <div style={{ background: c.surface, border: `1px solid ${c.anchor}55`, borderRadius: 6, overflow: "hidden" }}>{inner}</div>;
}

// ─── View state cycle: visible → muted → hidden → visible ───────────────────
const VIEW_CYCLE = { visible: "muted", muted: "hidden", hidden: "visible" };
const VIEW_LABELS = { visible: "View", muted: "Muted", hidden: "Hidden" };
const VIEW_COLORS = { visible: c.success, muted: c.warn, hidden: c.danger };

// ─── Main prototype ──────────────────────────────────────────────────────────
export default function TracerPrototype() {
  const [step, setStep] = useState("session");
  const [sessionDevices, setSessionDevices] = useState(DEVICES_POOL.slice(0, 3));
  const [showDensityWarning, setShowDensityWarning] = useState(false);
  const [densityDismissed, setDensityDismissed] = useState(false);
  const [activePanel, setActivePanel] = useState(null); // null | "nearby"
  const [focusedId, setFocusedId] = useState(null); // focused device — pivot for queries + visual isolation
  const [workingSet, setWorkingSet] = useState([]); // promoted subset; empty = all
  const [showMeetingPoints, setShowMeetingPoints] = useState(false);
  const [deviceViews, setDeviceViews] = useState({}); // id → "visible"|"muted"|"hidden"
  const [selectedDeviceId, setSelectedDeviceId] = useState(null); // device info panel
  const [hoveredId, setHoveredId] = useState(null); // mutual hover: card ↔ map dot
  const [sessionWindow, setSessionWindow] = useState([0, 72]); // set from query builder before entering Tracer
  const [timelineCollapsed, setTimelineCollapsed] = useState(false);

  const hasWorkingSet = workingSet.length > 0;
  const windowDuration = sessionWindow[1] - sessionWindow[0];

  function getView(id) { return deviceViews[id] || "visible"; }

  function cycleView(id) {
    setDeviceViews(prev => ({ ...prev, [id]: VIEW_CYCLE[prev[id] || "visible"] }));
  }


  function addDeviceToSession(count) {
    const next = DEVICES_POOL.slice(0, count);
    setSessionDevices(next);
    setWorkingSet([]);
    setDeviceViews({});
    setFocusedId(null);
    if (count > 30 && !densityDismissed) setShowDensityWarning(true);
    else setShowDensityWarning(false);
  }

  function handleAddNearby(device) {
    if (!sessionDevices.find(d => d.id === device.id)) {
      const newDevice = { id: device.id, label: device.label, color: "#aaaaaa", range: device.range };
      const updated = [...sessionDevices, newDevice];
      setSessionDevices(updated);
      if (updated.length > 30 && !densityDismissed) setShowDensityWarning(true);
    }
  }

  function handlePromoteWorkingSet(ids) {
    const idSet = new Set(ids);
    // Also include all explicitly visible devices (view state = "visible", not default)
    sessionDevices.forEach(d => {
      if (deviceViews[d.id] === "visible") idSet.add(d.id);
    });
    const promoted = sessionDevices.filter(d => idSet.has(d.id));
    const nearbyAdded = NEARBY_POOL
      .filter(d => idSet.has(d.id) && !sessionDevices.find(s => s.id === d.id) && rangeOverlap(d.range, sessionWindow))
      .map(d => ({ id: d.id, label: d.label, color: "#aaaaaa", range: d.range }));
    setWorkingSet([...promoted, ...nearbyAdded]);
  }

  function handleSetFocus(deviceId) {
    // Toggle: clicking the already-focused device clears focus
    setFocusedId(prev => prev === deviceId ? null : deviceId);
  }

  function handleRemoveDevice(deviceId) {
    const updated = sessionDevices.filter(d => d.id !== deviceId);
    setSessionDevices(updated);
    if (focusedId === deviceId) setFocusedId(null);
    setWorkingSet(prev => prev.filter(d => d.id !== deviceId));
    setDeviceViews(prev => { const next = { ...prev }; delete next[deviceId]; return next; });
  }

  // Only non-hidden devices are passed to map/timeline
  const displayDevices = sessionDevices.filter(d => getView(d.id) !== "hidden");

  const workingSetForDisplay = hasWorkingSet
    ? sessionDevices.filter(d => workingSet.find(w => w.id === d.id))
    : [];

  return (
    <div style={{ background: c.bg, minHeight: "100vh", color: c.text, fontFamily: "monospace", padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: "bold", color: c.text }}>TRACER</div>
          <div style={{ fontSize: 10, color: c.textMuted }}>Event Intelligence Layer — Lo-fi Prototype</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <Tag color={c.accentDim}>{sessionDevices.length} / 100 devices</Tag>
          <Tag color="#2a3a4a">{sessionWindow[0]}h – {sessionWindow[1]}h</Tag>
          {focusedId && <Tag color={`${c.anchor}55`}>▶ {focusedId}</Tag>}
          {hasWorkingSet && <Tag color={`${c.anchor}44`}>working set: {workingSet.length}</Tag>}
          {step === "tracer" && (
            <button onClick={() => { setStep("session"); setFocusedId(null); setActivePanel(null); setWorkingSet([]); setShowMeetingPoints(false); }}
              style={{ ...btn.base, background: c.surface, color: c.textMuted, border: `1px solid ${c.border}`, fontSize: 11 }}>
              Exit Tracer Mode
            </button>
          )}
        </div>
      </div>

      {/* ── STEP 1: Session setup ── */}
      {step === "session" && (
        <div style={{ maxWidth: 600 }}>

          {/* Query builder time window — carried over from map context */}
          <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 6, padding: 20, marginBottom: 12 }}>
            <Label>Query builder — time window</Label>
            <div style={{ fontSize: 11, color: c.textMuted, fontFamily: "monospace", marginBottom: 12 }}>
              Time window is set in the query builder before opening Tracer. Select a preset to simulate different investigation contexts.
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {[
                { label: "24h", window: [0, 24] },
                { label: "48h", window: [0, 48] },
                { label: "72h", window: [0, 72] },
                { label: "7 days", window: [0, 168] },
                { label: "30 days", window: [0, 720] },
              ].map(({ label, window }) => {
                const active = sessionWindow[0] === window[0] && sessionWindow[1] === window[1];
                return (
                  <button key={label} onClick={() => setSessionWindow(window)}
                    style={{ ...btn.base, background: active ? `${c.accent}22` : c.panel, color: active ? c.accent : c.text, border: `1px solid ${active ? c.accent : c.border}` }}>
                    {label}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 10, color: c.textDim, fontFamily: "monospace" }}>
              Active window: <span style={{ color: c.accent }}>0h – {sessionWindow[1]}h ({windowDuration}h total)</span>
              {windowDuration >= 168 && <span style={{ color: c.warn }}> · Long window — partial ranges more likely</span>}
            </div>
          </div>

          {/* Device cohort */}
          <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 6, padding: 20, marginBottom: 16 }}>
            <Label>Load devices into session</Label>
            <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 16 }}>Select a cohort size to simulate loading devices. Warning appears above 30.</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[1, 3, 5, 31].map(n => (
                <button key={n} onClick={() => addDeviceToSession(n)}
                  style={{ ...btn.base, background: sessionDevices.length === n ? `${c.accent}22` : c.panel, color: sessionDevices.length === n ? c.accent : c.text, border: `1px solid ${sessionDevices.length === n ? c.accent : c.border}` }}>
                  {n === 31 ? "Load 31 devices ⚠" : `Load ${n} device${n > 1 ? "s" : ""}`}
                </button>
              ))}
            </div>

            {showDensityWarning && !densityDismissed && (
              <div style={{ marginTop: 12 }}>
                <DensityWarning count={sessionDevices.length} onDismiss={() => { setShowDensityWarning(false); setDensityDismissed(true); }} />
              </div>
            )}
          </div>

          <button onClick={() => setStep("tracer")}
            style={{ ...btn.base, background: c.accent, color: "#fff", fontSize: 13, padding: "10px 24px" }}>
            Enter Tracer Mode →
          </button>
        </div>
      )}

      {/* ── STEP 2: Tracer — fullscreen ── */}
      {step === "tracer" && (
        <div style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10 }}>

          {/* ── Full-bleed map ── */}
          <div style={{ position: "absolute", inset: 0 }}>
            <MapCanvas
              devices={displayDevices}
              focusedId={focusedId}
              workingSet={hasWorkingSet ? workingSetForDisplay : null}
              showMeetingPoints={showMeetingPoints}
              deviceViews={deviceViews}
              hoveredId={hoveredId}
              onHoverDevice={setHoveredId}
              sessionWindow={sessionWindow}
            />
          </div>

          {/* ── Arkem toolbar — floating top bar ── */}
          <div style={{
            position: "absolute", top: 16, left: 16, right: 352,
            background: "rgba(10,10,10,0.98)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            display: "flex", alignItems: "center",
            padding: "0 12px",
            height: 48,
            zIndex: 15,
          }}>
            {/* Left section: Arkem logo */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                <rect width="20" height="20" rx="4" fill={c.anchor} />
                <path d="M5 14L10 6L15 14H12L10 10.5L8 14H5Z" fill="#0a0a0a" />
              </svg>
              <span style={{ fontSize: 11, fontWeight: 600, color: c.text, fontFamily: "'IBM Plex Sans', sans-serif", letterSpacing: "0.04em" }}>ARKEM</span>
            </div>

            {/* Center section: search input */}
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <div style={{ position: "relative", width: "100%", maxWidth: 320 }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#525252", pointerEvents: "none" }}>⌕</span>
                <input
                  type="text"
                  placeholder="Search by address, property, etc."
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "#0D0D0D",
                    border: "1px solid #1E1E1E",
                    borderRadius: 6,
                    color: c.text,
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: 11,
                    padding: "7px 12px 7px 28px",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Right section: action buttons */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
              {/* Button group 1 — single */}
              <button style={{
                width: 32, height: 32, borderRadius: 6,
                background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
                color: c.textMuted, fontSize: 14, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'IBM Plex Sans', sans-serif",
              }} title="Add layer">+</button>

              <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.06)", margin: "0 4px" }} />

              {/* Button group 2 — pair */}
              {["◇", "⊕"].map((icon, i) => (
                <button key={i} style={{
                  width: 32, height: 32, borderRadius: 6,
                  background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
                  color: c.textMuted, fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'IBM Plex Sans', sans-serif",
                }} title="Action">{icon}</button>
              ))}

              <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.06)", margin: "0 4px" }} />

              {/* Button group 3 — pair */}
              {["⚙", "⋯"].map((icon, i) => (
                <button key={i} style={{
                  width: 32, height: 32, borderRadius: 6,
                  background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
                  color: c.textMuted, fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'IBM Plex Sans', sans-serif",
                }} title="Action">{icon}</button>
              ))}
            </div>
          </div>

          {/* ── Session toolbar — inline with Arkem toolbar, over device panel ── */}
          <div style={{
            position: "absolute", top: 16, right: 16,
            width: 320,
            background: "rgba(10,10,10,0.98)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            display: "flex", alignItems: "center",
            padding: "0 6px",
            height: 48,
            zIndex: 15,
            gap: 2,
          }}>
            {/* Device count */}
            <button style={{
              ...btn.base, display: "flex", alignItems: "center", gap: 5,
              background: "transparent", border: "none",
              color: c.accent, fontSize: 11, padding: "6px 8px",
              cursor: "default", flexShrink: 0,
            }}>
              <span style={{ fontSize: 13 }}>⊞</span>
              <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 500 }}>{sessionDevices.length}</span>
            </button>

            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.06)", flexShrink: 0 }} />

            {/* Time range */}
            <button style={{
              ...btn.base, display: "flex", alignItems: "center", gap: 5,
              background: "transparent", border: "none",
              color: c.textMuted, fontSize: 11, padding: "6px 8px",
              cursor: "default", flexShrink: 0,
            }}>
              <span style={{ fontSize: 12 }}>⏱</span>
              <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 500 }}>{sessionWindow[0]}–{sessionWindow[1]}h</span>
            </button>

            <div style={{ flex: 1 }} />

            {/* Nearby devices */}
            <button
              onClick={() => setActivePanel(activePanel === "nearby" ? null : "nearby")}
              disabled={!focusedId}
              title={focusedId ? `Find devices near ${focusedId}` : "Focus a device first"}
              style={{
                ...btn.base, display: "flex", alignItems: "center", gap: 5,
                background: activePanel === "nearby" ? `${c.anchor}22` : "transparent",
                border: `1px solid ${activePanel === "nearby" ? c.anchor + "55" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 6,
                color: activePanel === "nearby" ? c.anchor : focusedId ? c.text : c.textDim,
                fontSize: 11, padding: "5px 8px",
                cursor: focusedId ? "pointer" : "not-allowed",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 12 }}>◎</span>
              <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 500 }}>Nearby</span>
            </button>

            {/* Co-location toggle */}
            <button
              onClick={() => setShowMeetingPoints(v => !v)}
              style={{
                ...btn.base, display: "flex", alignItems: "center", gap: 5,
                background: showMeetingPoints ? "rgba(170,170,170,0.12)" : "transparent",
                border: `1px solid ${showMeetingPoints ? "rgba(170,170,170,0.33)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 6,
                color: showMeetingPoints ? "#aaaaaa" : c.textMuted,
                fontSize: 11, padding: "5px 8px",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 12 }}>◇</span>
              <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 500 }}>Co-loc</span>
            </button>

            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.06)", flexShrink: 0 }} />

            {/* Exit tracer */}
            <button
              onClick={() => { setStep("session"); setFocusedId(null); setActivePanel(null); setWorkingSet([]); setShowMeetingPoints(false); }}
              style={{
                ...btn.base, display: "flex", alignItems: "center", gap: 5,
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 6,
                color: c.textMuted,
                fontSize: 11, padding: "5px 8px",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 12 }}>✕</span>
              <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 500 }}>Exit</span>
            </button>
          </div>

          {/* ── Density warning — floating above timeline ── */}
          {showDensityWarning && !densityDismissed && (
            <div style={{ position: "absolute", bottom: timelineCollapsed ? 72 : 220, left: 16, right: 352, zIndex: 20, transition: "bottom 0.2s ease" }}>
              <DensityWarning count={sessionDevices.length} onDismiss={() => { setShowDensityWarning(false); setDensityDismissed(true); }} />
            </div>
          )}

          {/* ── Right panel — floating, below session toolbar ── */}
          <div style={{
            position: "absolute", top: 80, right: 16, bottom: 16,
            width: 320,
            display: "flex", flexDirection: "column",
          }}>
            {activePanel === "nearby" ? (
              <NearbyDevicesPanel
                sessionDevices={sessionDevices}
                focusedId={focusedId}
                sessionWindow={sessionWindow}
                onAddDevice={handleAddNearby}
                onPromoteWorkingSet={handlePromoteWorkingSet}
                onClose={() => setActivePanel(null)}
              />
            ) : selectedDeviceId ? (
              <DeviceInfoPanel
                device={[...sessionDevices, ...NEARBY_POOL].find(d => d.id === selectedDeviceId)}
                focusedId={focusedId}
                onSetFocus={handleSetFocus}
                onClose={() => setSelectedDeviceId(null)}
              />
            ) : (
              <DevicePanel
                sessionDevices={sessionDevices}
                focusedId={focusedId}
                deviceViews={deviceViews}
                hasWorkingSet={hasWorkingSet}
                workingSetForDisplay={workingSetForDisplay}
                onSetFocus={handleSetFocus}
                onCycleView={cycleView}
                onRemoveDevice={handleRemoveDevice}
                onSelectDevice={setSelectedDeviceId}
                getView={getView}
                sessionWindow={sessionWindow}
                onClearWorkingSet={() => setWorkingSet([])}
                hoveredId={hoveredId}
                onHoverDevice={setHoveredId}
              />
            )}
          </div>

          {/* ── Device timeline panel — floating bottom ── */}
          <div style={{
            position: "absolute", bottom: 16, left: 16, right: 352,
            background: `${c.bg}dd`, backdropFilter: "blur(8px)",
            border: `1px solid ${c.border}`, borderRadius: 8,
            overflow: "hidden",
          }}>
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "7px 12px", borderBottom: timelineCollapsed ? "none" : `1px solid ${c.border}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => setTimelineCollapsed(v => !v)}
                  style={{
                    ...btn.base,
                    padding: "2px 6px", fontSize: 10,
                    background: "transparent", border: "none",
                    color: c.textDim, cursor: "pointer",
                    transition: "transform 0.15s",
                    transform: timelineCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                  }}
                >▾</button>
                <span style={{ fontSize: 10, color: c.textMuted, fontFamily: "monospace", fontWeight: "bold" }}>
                  TIMELINE
                </span>
                {timelineCollapsed && (
                  <span style={{ fontSize: 9, color: c.textDim, fontFamily: "monospace" }}>
                    {displayDevices.length} device{displayDevices.length !== 1 ? "s" : ""} · {sessionWindow[0]}h–{sessionWindow[1]}h
                  </span>
                )}
              </div>
              {!timelineCollapsed && (
                <div style={{ display: "flex", gap: 16 }}>
                  {/* Axis tick labels */}
                  {[0, 0.25, 0.5, 0.75, 1].map(pct => {
                    const val = sessionWindow[0] + pct * (sessionWindow[1] - sessionWindow[0]);
                    return (
                      <span key={pct} style={{ fontSize: 9, color: c.textDim, fontFamily: "monospace" }}>
                        {Math.round(val)}h
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Rows — scrollable if many devices */}
            {!timelineCollapsed && <div style={{
              maxHeight: 160, overflowY: "auto",
              scrollbarWidth: "thin", scrollbarColor: `${c.border} transparent`,
            }}>
              {displayDevices.map(d => {
                const total     = sessionWindow[1] - sessionWindow[0];
                const leftPct   = ((d.range[0] - sessionWindow[0]) / total) * 100;
                const widthPct  = ((d.range[1] - d.range[0]) / total) * 100;
                const isFocused = d.id === focusedId;
                const isHovered = d.id === hoveredId;

                return (
                  <div
                    key={d.id}
                    onMouseEnter={() => setHoveredId(d.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      display: "flex", alignItems: "center",
                      padding: "3px 12px",
                      background: isFocused ? `${c.anchor}0e` : isHovered ? `${c.borderLight}22` : "transparent",
                      borderBottom: `1px solid ${c.border}33`,
                      gap: 10,
                      transition: "background 0.1s",
                    }}
                  >
                    {/* Device ID label */}
                    <span style={{
                      fontSize: 9, fontFamily: "monospace",
                      color: isFocused ? c.anchor : isHovered ? c.text : c.textDim,
                      width: 52, flexShrink: 0,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {isFocused ? "▶ " : ""}{d.id}
                    </span>

                    {/* Track area */}
                    <div style={{ flex: 1, position: "relative", height: 20, display: "flex", alignItems: "center" }}>
                      {/* Background rail */}
                      <div style={{
                        position: "absolute", inset: "50% 0", height: 1,
                        background: c.border, transform: "translateY(-50%)",
                      }} />
                      {/* Active range bar */}
                      <div style={{
                        position: "absolute",
                        left: `${Math.max(0, leftPct)}%`,
                        width: `${Math.min(widthPct, 100 - Math.max(0, leftPct))}%`,
                        height: isFocused ? 5 : isHovered ? 4 : 3,
                        top: "50%", transform: "translateY(-50%)",
                        background: isFocused ? c.anchor : isHovered ? c.text : c.borderLight,
                        borderRadius: 2,
                        transition: "height 0.1s, background 0.1s",
                      }} />
                      {/* Start cap dot */}
                      <div style={{
                        position: "absolute",
                        left: `calc(${Math.max(0, leftPct)}% - 3px)`,
                        top: "50%", transform: "translateY(-50%)",
                        width: 6, height: 6, borderRadius: "50%",
                        background: isFocused ? c.anchor : isHovered ? c.text : c.borderLight,
                        transition: "background 0.1s",
                      }} />
                    </div>

                    {/* Duration label */}
                    <span style={{
                      fontSize: 9, fontFamily: "monospace",
                      color: isFocused ? c.anchor : c.textDim,
                      width: 32, flexShrink: 0, textAlign: "right",
                    }}>
                      {d.range[1] - d.range[0]}h
                    </span>
                  </div>
                );
              })}
            </div>}
          </div>

        </div>
      )}
    </div>
  );
}
