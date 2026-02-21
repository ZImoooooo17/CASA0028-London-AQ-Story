import React, { useMemo, useEffect, useRef } from "react";

function num(x, fallback = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

export default function BarRankChart({ data, mode, selectedId, onSelect, onHover }) {
  const itemRefs = useRef({});

  const list = useMemo(() => {
    if (!data?.features?.length) return [];

    if (mode === "weighted") {
      // 方案B：排序依据 totalExposure；显示 exposureIndex（Avg=100%）
      return [...data.features]
        .sort((a, b) => num(b.properties?.totalExposure) - num(a.properties?.totalExposure))
        .map((f) => {
          const idx = num(f.properties?.exposureIndex); // Avg=100
          return {
            id: f.id,
            name: f.properties?.LAD22NM || "Borough",
            display: `${idx.toFixed(0)}%`,
            barWidthPct: `${Math.min(idx / 2, 100)}%`, // 200% -> 100%宽；100% -> 50%宽
            isHigh: idx >= 120,
          };
        });
    }

    // raw：按 NO2 排
    return [...data.features]
      .sort((a, b) => num(b.properties?.NO2) - num(a.properties?.NO2))
      .map((f) => {
        const v = num(f.properties?.NO2);
        return {
          id: f.id,
          name: f.properties?.LAD22NM || "Borough",
          display: `${v.toFixed(1)} µg/m³`,
          barWidthPct: `${Math.min(v * 2, 100)}%`,
          isHigh: v >= 30,
        };
      });
  }, [data, mode]);

  useEffect(() => {
    if (selectedId && itemRefs.current[selectedId]) {
      itemRefs.current[selectedId].scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedId]);

  return (
    <div style={{ padding: 15, height: "100%", display: "flex", flexDirection: "column" }}>
      <h3
        style={{
          fontSize: 11,
          color: "#888",
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 20,
          position: "sticky",
          top: 0,
          background: "white",
          padding: "10px 0",
          zIndex: 10,
        }}
      >
        Ranking by {mode === "raw" ? "NO₂ Concentration" : "Population Burden"}
      </h3>

      <div style={{ flex: 1, position: "relative" }}>
        {mode === "weighted" && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
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
                top: -15,
                left: -20,
                fontSize: 9,
                color: "#94a3b8",
                fontWeight: "bold",
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
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: isSelected ? 700 : 500, color: isSelected ? "#007bff" : "#333" }}>
                    {item.name}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: item.isHigh ? "#ef4444" : "#64748b" }}>
                    {item.display}
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

      <div style={{ marginTop: 20, padding: 15, borderTop: "1px solid #eee", background: "#fdfdfd", borderRadius: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#64748b", marginBottom: 6, textTransform: "uppercase" }}>
          Methodology & Data
        </div>

        {mode === "weighted" ? (
          <p style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.5, margin: 0 }}>
            <strong>Population Burden</strong> ranks boroughs by <strong>total exposure</strong> (NO₂ × population).<br />
            Values shown as <strong>Exposure Index</strong> where <strong>Avg = 100%</strong>.<br />
            Map colors show <strong>Inequity ratio</strong> (burden share ÷ population share).
          </p>
        ) : (
          <p style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.5, margin: 0 }}>
            <strong>Raw NO₂</strong> ranks boroughs by borough-average concentration (µg/m³).
          </p>
        )}
      </div>
    </div>
  );
}