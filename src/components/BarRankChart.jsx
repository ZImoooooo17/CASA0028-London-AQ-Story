import React, { useMemo, useEffect, useRef } from "react";

function num(x, fallback = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

export default function BarRankChart({ data, mode, selectedId, onSelect, onHover }) {
  const itemRefs = useRef({});

  const list = useMemo(() => {
    if (!data) return [];

    // ✅ 关键修复：weighted 模式排序必须跟显示一致（按 burdenRatio 排序）
    const sortKey = mode === "weighted" ? "burdenRatio" : "NO2";

    return [...data.features]
      .sort((a, b) => num(b.properties?.[sortKey]) - num(a.properties?.[sortKey]))
      .map((f) => {
        const value = mode === "weighted" ? num(f.properties?.burdenRatio) : num(f.properties?.NO2);
        return {
          id: f.id,
          name: f.properties?.LAD22NM,
          value,
          isHigh: mode === "weighted" ? value > 1 : value > 30,
        };
      });
  }, [data, mode]);

  useEffect(() => {
    if (selectedId && itemRefs.current[selectedId]) {
      itemRefs.current[selectedId].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedId]);

  return (
    <div style={{ padding: "15px", position: "relative", height: "100%", display: "flex", flexDirection: "column" }}>
      <h3
        style={{
          fontSize: "11px",
          color: "#888",
          textTransform: "uppercase",
          letterSpacing: "1px",
          marginBottom: "20px",
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
              left: "calc(50%)",
              top: 0,
              bottom: 0,
              width: "1px",
              borderLeft: "1px dashed #cbd5e0",
              zIndex: 0,
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "-15px",
                left: "-20px",
                fontSize: "9px",
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
            const displayValue =
              mode === "weighted" ? `${(item.value * 100).toFixed(0)}%` : item.value.toFixed(1);

            const isSelected = item.id === selectedId;

            return (
              <div
                key={item.id}
                ref={(el) => (itemRefs.current[item.id] = el)}
                onClick={() => onSelect(item.id)}
                onMouseEnter={() => onHover(item.id)}
                onMouseLeave={() => onHover(null)}
                style={{
                  padding: "8px 10px",
                  marginBottom: "4px",
                  cursor: "pointer",
                  borderRadius: "8px",
                  background: isSelected ? "#f0f7ff" : "transparent",
                  border: isSelected ? "1px solid #007bff" : "1px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      color: isSelected ? "#007bff" : "#333",
                      fontWeight: isSelected ? "700" : "500",
                    }}
                  >
                    {item.name}
                  </span>

                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: item.isHigh ? "#ef4444" : "#64748b",
                    }}
                  >
                    {displayValue}
                    {mode === "raw" ? " µg/m³" : ""}
                  </span>
                </div>

                <div style={{ height: "4px", background: "#f1f5f9", borderRadius: "2px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width:
                        mode === "weighted"
                          ? `${Math.min(item.value * 50, 100)}%` // 1.0 => 50%
                          : `${Math.min(item.value * 2, 100)}%`,
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

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          borderTop: "1px solid #eee",
          background: "#fdfdfd",
          borderRadius: "8px",
        }}
      >
        <div style={{ fontSize: "10px", fontWeight: "800", color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>
          Methodology & Data
        </div>
        <p style={{ fontSize: "10px", color: "#94a3b8", lineHeight: "1.5", margin: 0 }}>
          <strong>Burden Ratio</strong> = (Borough Exposure Share) / (Borough Population Share).<br />
          A ratio &gt; 1.0 indicates Environmental Inequity. Data: LAEI 2019 & ONS Census 2021.
        </p>
      </div>
    </div>
  );
}