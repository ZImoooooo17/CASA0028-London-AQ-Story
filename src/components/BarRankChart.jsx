import React, { useMemo, useEffect, useRef } from "react";

function num(x, fallback = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

function fmtPct01(x, digits = 1) {
  const n = Number(x);
  if (!Number.isFinite(n)) return null;
  return `${(n * 100).toFixed(digits)}%`;
}

export default function BarRankChart({ data, mode, selectedId, onSelect, onHover }) {
  const itemRefs = useRef({});

  const list = useMemo(() => {
    if (!data?.features?.length) return [];

    if (mode === "weighted") {
      return [...data.features]
        .sort((a, b) => num(b.properties?.totalExposure) - num(a.properties?.totalExposure))
        .map((f) => {
          const idx = num(f.properties?.exposureIndex);
          const bShare = f.properties?.burdenShare;
          const shareText = fmtPct01(bShare, 1);

          return {
            id: f.properties?.LAD22CD, // ✅ FIX: 用 LAD22CD
            name: f.properties?.LAD22NM || "Borough",
            displayPrimary: `${idx.toFixed(0)}%`,
            displaySecondary: shareText ? `${shareText} share` : null,
            barWidthPct: `${Math.min(idx / 2, 100)}%`,
            isHigh: idx >= 120,
          };
        })
        .filter((d) => !!d.id);
    }

    return [...data.features]
      .sort((a, b) => num(b.properties?.NO2) - num(a.properties?.NO2))
      .map((f) => {
        const v = num(f.properties?.NO2);
        return {
          id: f.properties?.LAD22CD, // ✅ FIX: 用 LAD22CD
          name: f.properties?.LAD22NM || "Borough",
          displayPrimary: `${v.toFixed(1)} µg/m³`,
          displaySecondary: null,
          barWidthPct: `${Math.min(v * 2, 100)}%`,
          isHigh: v >= 30,
        };
      })
      .filter((d) => !!d.id);
  }, [data, mode]);

  useEffect(() => {
    if (selectedId && itemRefs.current[selectedId]) {
      itemRefs.current[selectedId].scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedId]);

  const title = mode === "raw" ? "Ranking by NO₂ Concentration" : "Ranking by Total Exposure";
  const subtitle =
    mode === "raw"
      ? "Borough mean concentration (µg/m³)."
      : "Population burden ordering: NO₂ × population (Exposure Index shown; Avg = 100%).";

  return (
    <div style={{ padding: 15, height: "100%", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "white",
          padding: "10px 0 12px",
          zIndex: 10,
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        <h3
          style={{
            fontSize: 11,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: 1,
            margin: 0,
            fontWeight: 900,
          }}
        >
          {title}
        </h3>
        <div style={{ marginTop: 6, fontSize: 11.5, color: "#94a3b8", lineHeight: 1.35 }}>{subtitle}</div>

        {mode === "weighted" && (
          <div style={{ marginTop: 6, fontSize: 11.5, color: "#94a3b8", lineHeight: 1.35 }}>
            Map color shows <strong>burden ratio</strong> (burden share ÷ population share), not the share itself.
          </div>
        )}
      </div>

      <div style={{ flex: 1, position: "relative", paddingTop: 10 }}>
        {mode === "weighted" && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 10,
              bottom: 0,
              width: 1,
              borderLeft: "1px dashed #cbd5e0",
              zIndex: 0,
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: -14,
                left: -22,
                fontSize: 9,
                color: "#94a3b8",
                fontWeight: 900,
              }}
            >
              AVG (100%)
            </span>
          </div>
        )}

        <div style={{ position: "relative", zIndex: 1 }}>
          {list.map((item) => {
            const isSelected = item.id === selectedId;

            return (
              <div
                key={item.id}
                ref={(el) => (itemRefs.current[item.id] = el)}
                onClick={() => onSelect?.(item.id)}
                onMouseEnter={() => onHover?.(item.id)}
                onMouseLeave={() => onHover?.(null)}
                style={{
                  padding: "8px 10px",
                  marginBottom: 4,
                  cursor: "pointer",
                  borderRadius: 8,
                  background: isSelected ? "#f0f7ff" : "transparent",
                  border: isSelected ? "1px solid #007bff" : "1px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, gap: 10 }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? "#007bff" : "#333",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 220,
                    }}
                  >
                    {item.name}
                  </span>

                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: item.isHigh ? "#ef4444" : "#64748b",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {mode === "weighted" && item.displaySecondary
                      ? `${item.displayPrimary} · ${item.displaySecondary}`
                      : item.displayPrimary}
                  </span>
                </div>

                <div style={{ height: 4, background: "#f1f5f9", borderRadius: 2, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: item.barWidthPct,
                      background: isSelected ? "#007bff" : item.isHigh ? "#ef4444" : "#94a3b8",
                      transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 14, padding: 14, borderTop: "1px solid #eee", background: "#fdfdfd", borderRadius: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: "#64748b", marginBottom: 6, textTransform: "uppercase" }}>
          Methodology & Data
        </div>

        {mode === "weighted" ? (
          <p style={{ fontSize: 10.5, color: "#94a3b8", lineHeight: 1.5, margin: 0 }}>
            <strong>Total Exposure</strong> ranks boroughs by <strong>NO₂ × population</strong>.
            <br />
            Values shown as <strong>Exposure Index</strong> where <strong>Avg = 100%</strong>.
            <br />
            <strong>Share</strong> is each borough’s fraction of total exposure (not what map color encodes).
            <br />
            Map color encodes <strong>burden ratio</strong> = burden share ÷ population share.
          </p>
        ) : (
          <p style={{ fontSize: 10.5, color: "#94a3b8", lineHeight: 1.5, margin: 0 }}>
            <strong>Raw NO₂</strong> ranks boroughs by borough-average concentration (µg/m³).
          </p>
        )}
      </div>
    </div>
  );
}