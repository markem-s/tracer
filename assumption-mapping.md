# Assumption Mapping — Motion Tracer

## Maker Perspective (Product / Platform)

### Known
- Arkem's structural capability is at L3.5–L4; intelligence capability is ~L1.5 — the gap is documented and measured
- No competitor offers real-time in-session event expansion; Palantir and ArcGIS both require context rebuilding for new entities
- The 10-device cap is a documented constraint blocking real-world event analysis
- The 15m Haversine threshold is the defensible co-location standard — tunable thresholds introduce report integrity risk

### Assumed (need validation)
- Expanding to 25–50 devices in Sprint 4 is the right increment — large enough to unblock operations, small enough to avoid rendering the UI unusable before density UX is solved
- The intelligence gap (L1.5) is addressable by Arkimedes without requiring a fundamental backend architecture change
- Analysts will tolerate a passive density warning banner rather than needing a blocking modal — the passive approach is less disruptive but untested at real session scale
- Silent truncation of Nearby Devices results is a trust-breaking event — the pre-disclosure model assumes analysts will act on the result count rather than just dismiss it

### Unknown
- At what device count does the map become operationally unusable for navigation, not just visually noisy — 30 is the current density warning threshold, but this is not validated
- Whether co-travel detection will be computationally feasible at 50-device session scale within acceptable latency
- Whether Arkimedes' pattern surfacing (proactive cards) will be read as helpful or as noise by analysts who are mid-investigation and in flow

---

## User Perspective (Analyst — validated through Carlos Rivera)

### Known
- The 10-device cap directly blocks real-world event analysis — confirmed by Carlos
- Analyst-controlled proximity parameters with no system-driven ranking is the trust foundation — Carlos called this "the most important sentence in the document"
- Temporal overlap must be optional: meeting windows are 15 minutes, logistics patterns span months. A fixed window breaks half of real use cases
- In-session expansion eliminates the workflow break analysts currently experience when a new device surfaces mid-analysis
- Visibility state and focus are independent axes of control — focusing a device must not override its view state, and clearing focus must not reset view states

### Assumed (need validation)
- Analysts will use the pre-add disclosure modal to make deliberate range choices (intersection / full range / cancel) rather than defaulting to "accept all" without reading it
- The focus status indicator ("▶ [device ID] · N dimmed") is sufficient transparency for restricted-tier sessions — the concern is operational, not cosmetic
- Analysts working at high device density prefer muted-but-visible dimmed devices over hidden ones — they need context, not clean screens
- Removing an individual device mid-session is a common enough action to warrant a first-class UI treatment (not an edge case)

### Unknown
- How analysts will behave when Arkimedes surfaces a co-travel pattern they hadn't noticed — will they trust it, investigate it, or dismiss it as noise
- Whether the session window adjustment inside Tracer (described as "the session window is a starting point, not a ceiling") will be used to extend beyond the original query range in practice, and what that means for report defensibility
- Whether analysts in restricted-tier environments have formal documentation requirements that the session summary export (A4) would need to satisfy — or whether the format is flexible

---

## Cross-cutting note

The clearest gap across both perspectives is the **intelligence-to-trust handoff**: the maker is building proactive pattern detection, but the user research establishes that analysts fundamentally distrust anything the system interprets on their behalf. The assumption that Arkimedes can surface patterns *without* triggering that distrust — through tone, framing, and dismissibility design — is the highest-stakes unvalidated assumption in the product.
