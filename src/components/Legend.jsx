// src/components/Legend.jsx
import { useMemo, useState } from "react";

/**
 * Legend
 * - 默认收起（只显示一个小按钮）
 * - 可浮在地图里（不会占一整条布局）
 * - 打开时限制尺寸，不会霸占地图
 */
export default function Legend({
  mode,
  defaultOpen = false,
  // 位置：top-left / top-right / bottom-left / bottom-right
  anchor = "top-left",
}) {
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

  const pos = (() => {
    const base = { position: "absolute", zIndex: 120, pointerEvents: "auto" };
    if (anchor === "top-right") return { ...base, right: 12, top: 12 };
    if (anchor === "bottom-left") return { ...base, left: 12, bottom: 12 };
    if (anchor === "bottom-right") return { ...base, right: 12, bottom: 12 };
    return { ...base, left: 12, top: 12 };
  })();

  // ✅ 打开也别太大，避免盖地图
  const card = {
    width: open ? 320 : 42,
    maxHeight: open ? 240 : 42,
    overflow: "hidden",
    background: "rgba(255,255,255,0.94)",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    boxShadow: "0 10px 26px rgba(0,0,0,0.12)",
    backdropFilter: "blur(8px)",
    transition: "width 180ms ease, max-height 180ms ease",
  };

  return (
    <div style={pos} aria-label="Legend">
      <div style={card}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: open ? 12 : 8 }}>
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
            <div style={{ fontWeight: 900, color: "#0f172a", flex: 1, lineHeight: 1.2 }}>
              {isRaw ? "Borough-average NO₂ (µg/m³)" : "Population burden (ratio)"}
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Collapse legend" : "Expand legend"}
            title={open ? "Collapse" : "Expand"}
            style={{
              marginLeft: "auto",
              width: 32,
              height: 32,
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              background: "white",
              cursor: "pointer",
              fontWeight: 900,
              fontSize: 18,
              lineHeight: "30px",
              color: "#0f172a",
            }}
          >
            {open ? "–" : "≡"}
          </button>
        </div>

        {/* Body */}
        {open && (
          <div style={{ padding: "0 12px 12px", overflowY: "auto", maxHeight: 240 }}>
            <div style={{ display: "grid", gap: 10 }}>
              {bands.map((b) => (
                <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 7,
                      background: b.color,
                      border: "1px solid rgba(0,0,0,0.06)",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontWeight: 800, color: "#334155", fontSize: 13 }}>{b.label}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12, fontSize: 12.6, color: "#475569", lineHeight: 1.45 }}>
              {isRaw ? (
                <>Higher values = worse borough-average air.</>
              ) : (
                <>
                  Ratio compares a borough’s exposure share with its population share.
                  <div style={{ marginTop: 6 }}>
                    <strong>1.0</strong> proportional • <strong>&gt; 1.0</strong> disproportionate • <strong>&lt; 1.0</strong> lower-than-expected
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}