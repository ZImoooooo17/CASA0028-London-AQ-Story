// src/components/Legend.jsx
import { useMemo, useState } from "react";

export default function Legend({ mode, defaultOpen = false, position = "left" }) {
  const [open, setOpen] = useState(defaultOpen);

  const isRaw = mode === "raw";

  const rawBands = useMemo(
    () => [
      { label: "< 24", color: "#eff6ff" },
      { label: "24 – 28", color: "#bfdbfe" },
      { label: "28 – 32", color: "#60a5fa" },
      { label: "32 – 36", color: "#2563eb" },
      { label: "> 36", color: "#1e3a8a" },
    ],
    []
  );

  const burdenBands = useMemo(
    () => [
      { label: "< 0.8", color: "#3182ce" },
      { label: "0.8 – 0.95", color: "#93c5fd" },
      { label: "0.95 – 1.05", color: "#cbd5e0" },
      { label: "1.05 – 1.2", color: "#fca5a5" },
      { label: "> 1.2", color: "#e53e3e" },
    ],
    []
  );

  const bands = isRaw ? rawBands : burdenBands;

  const containerStyle = {
    position: "absolute",
    bottom: 12,
    zIndex: 2000,
    width: open ? 340 : 52,
    maxHeight: open ? 220 : 52,
    overflow: "hidden",
    background: "rgba(255,255,255,0.94)",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
    backdropFilter: "blur(8px)",
    transition: "width 200ms ease, max-height 200ms ease",
    pointerEvents: "auto",
    ...(position === "right" ? { right: 12 } : { left: 12 }),
  };

  return (
    <div style={containerStyle} aria-label="Legend">
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: open ? 12 : 10 }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: isRaw ? "#2563eb" : "#e53e3e",
            flexShrink: 0,
          }}
        />
        {open && (
          <div style={{ fontWeight: 900, letterSpacing: "-0.2px", flex: 1, color: "#0f172a" }}>
            {isRaw ? "Borough-average NO₂ (µg/m³)" : "Population burden (ratio)"}
          </div>
        )}

        <button
          onClick={() => setOpen((v) => !v)}
          title={open ? "Hide legend" : "Show legend"}
          aria-label={open ? "Hide legend" : "Show legend"}
          style={{
            marginLeft: "auto",
            border: "1px solid #e2e8f0",
            background: "white",
            borderRadius: 10,
            width: 32,
            height: 32,
            cursor: "pointer",
            fontWeight: 900,
            fontSize: 18,
            lineHeight: "30px",
            color: "#0f172a",
          }}
        >
          {open ? "–" : "?"}
        </button>
      </div>

      {open && (
        <div style={{ padding: "0 12px 12px", overflow: "auto", maxHeight: 220 }}>
          <div style={{ display: "grid", gap: 10 }}>
            {bands.map((it) => (
              <div
                key={it.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 13,
                  color: "#334155",
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 6,
                    background: it.color,
                    border: "1px solid rgba(0,0,0,0.06)",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontWeight: 800 }}>{it.label}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12, fontSize: 12.5, color: "#475569", lineHeight: 1.5 }}>
            {isRaw ? (
              <>
                <strong>Average View</strong> shows borough mean NO₂ concentration (µg/m³).
                <div style={{ marginTop: 6, opacity: 0.9 }}>Higher values = worse average air.</div>
                <div style={{ marginTop: 6, opacity: 0.9 }}>
                  Tip: switch to <strong>Burden View</strong> to see where population exposure reshapes risk.
                </div>
              </>
            ) : (
              <>
                <strong>Burden View</strong> encodes <strong>burden ratio</strong> = burden share ÷ population share.
                <div style={{ marginTop: 6, opacity: 0.9 }}>
                  <strong>1.0</strong> = proportional
                </div>
                <div style={{ marginTop: 6, opacity: 0.9 }}>
                  <strong>&gt; 1.0</strong> = disproportionate exposure • <strong>&lt; 1.0</strong> = lower-than-expected burden
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}