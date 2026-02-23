import { useMemo, useState } from "react";

export default function Legend({
  mode,
  defaultOpen = false,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isRaw = mode === "raw";

  /* ===========================
     Color bands
  =========================== */

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
      { label: "< 0.8", color: "#e2e8f0" },
      { label: "0.8 – 0.95", color: "#fecaca" },
      { label: "0.95 – 1.05 ≈ proportional", color: "#fca5a5" },
      { label: "1.05 – 1.2", color: "#ef4444" },
      { label: "> 1.2", color: "#7f1d1d" },
    ],
    []
  );

  const bands = isRaw ? rawBands : burdenBands;

  /* ===========================
     Card style
  =========================== */

  const card = {
    width: open ? 280 : 44,
    maxHeight: open ? 260 : 44,
    overflow: "hidden",
    background: "rgba(255,255,255,0.96)",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    boxShadow: "0 10px 26px rgba(0,0,0,0.12)",
    backdropFilter: "blur(8px)",
    transition: "width 180ms ease, max-height 180ms ease",
  };

  /* ===========================
     Render
  =========================== */

  return (
    <div style={card} aria-label="Legend">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: open ? 12 : 8,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: isRaw ? "#2563eb" : "#ef4444",
          }}
        />

        {open && (
          <div
            style={{
              fontWeight: 900,
              color: "#0f172a",
              flex: 1,
            }}
          >
            {isRaw
              ? "Mean concentration (µg/m³)"
              : "Population-weighted burden"}
          </div>
        )}

        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            width: 32,
            height: 32,
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            background: "white",
            cursor: "pointer",
            fontWeight: 900,
            fontSize: 18,
          }}
        >
          {open ? "–" : "≡"}
        </button>
      </div>

      {/* Body */}
      {open && (
        <div style={{ padding: "0 12px 14px" }}>
          <div style={{ display: "grid", gap: 8 }}>
            {bands.map((b) => (
              <div
                key={b.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 7,
                    background: b.color,
                  }}
                />
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 13,
                    color: "#334155",
                  }}
                >
                  {b.label}
                </span>
              </div>
            ))}
          </div>

          {/* Explanation */}
          <div
            style={{
              marginTop: 14,
              fontSize: 12.5,
              color: "#475569",
              lineHeight: 1.4,
            }}
          >
            {isRaw
              ? "Darker shades indicate higher average NO₂ concentration."
              : "1.0 represents proportional exposure. Values above 1.0 indicate residents carry a disproportionate share of London’s pollution burden."}
          </div>
        </div>
      )}
    </div>
  );
}