import React, { useMemo, useEffect, useRef } from "react";

export default function BarRankChart({ data, mode, selectedId, onSelect, onHover }) {
  // 1. 用于自动滚动的 Ref
  const itemRefs = useRef({});

  const list = useMemo(() => {
    if (!data) return [];
    
    // 根据模式决定排序字段
    const key = mode === "weighted" ? "totalExposure" : "NO2";
    
    return [...data.features]
      .sort((a, b) => (b.properties[key] || 0) - (a.properties[key] || 0))
      .map(f => ({
        id: f.id,
        name: f.properties.LAD22NM,
        // value 在 weighted 模式下是 burdenRatio，在 raw 模式下是浓度
        value: mode === "weighted" ? f.properties.burdenRatio : f.properties.NO2,
        isHigh: mode === "weighted" ? f.properties.burdenRatio > 1 : f.properties.NO2 > 30
      }));
  }, [data, mode]);

  // 2. 监听选中项变化，执行自动滚动
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
      {/* Sticky Header */}
      <h3 style={{ 
        fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "1px", 
        marginBottom: "20px", position: "sticky", top: 0, background: "white", padding: "10px 0", zIndex: 10 
      }}>
        Ranking by {mode === "raw" ? "NO₂ Concentration" : "Population Burden"}
      </h3>

      <div style={{ flex: 1, position: "relative" }}>
        {/* Average 标记线 (仅在 Weighted 模式显示) */}
        {mode === "weighted" && (
          <div style={{
            position: "absolute",
            left: "calc(50%)", 
            top: 0,
            bottom: 0,
            width: "1px",
            borderLeft: "1px dashed #cbd5e0",
            zIndex: 0,
            pointerEvents: "none"
          }}>
            <span style={{ position: "absolute", top: "-15px", left: "-20px", fontSize: "9px", color: "#94a3b8", fontWeight: "bold" }}>
              AVG (100%)
            </span>
          </div>
        )}
        
        <div style={{ position: "relative", zIndex: 1 }}>
          {list.map((item) => {
            const displayValue = mode === "weighted" 
              ? `${(item.value * 100).toFixed(0)}%` 
              : item.value.toFixed(1);

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
                  transition: "all 0.2s"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "6px" }}>
                  <span style={{ 
                    fontSize: "13px", 
                    color: isSelected ? "#007bff" : "#333",
                    fontWeight: isSelected ? "700" : "500" 
                  }}>
                    {item.name}
                  </span>
                  <span style={{ 
                    fontSize: "12px", 
                    fontWeight: "700", 
                    color: item.isHigh ? "#ef4444" : "#64748b" 
                  }}>
                    {displayValue}{mode === "raw" ? " µg/m³" : ""}
                  </span>
                </div>
                
                <div style={{ height: "4px", background: "#f1f5f9", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ 
                    height: "100%", 
                    width: mode === "weighted" ? `${Math.min(item.value * 50, 100)}%` : `${Math.min(item.value * 2, 100)}%`,
                    background: isSelected ? "#007bff" : (item.isHigh ? "#ef4444" : "#94a3b8"),
                    transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* P2: Methodology Footer */}
      <div style={{ 
        marginTop: "20px", padding: "15px", borderTop: "1px solid #eee", 
        background: "#fdfdfd", borderRadius: "8px" 
      }}>
        <div style={{ fontSize: "10px", fontWeight: "800", color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>
          Methodology & Data
        </div>
        <p style={{ fontSize: "10px", color: "#94a3b8", lineHeight: "1.5", margin: 0 }}>
          <strong>Burden Ratio</strong> = (Borough Exposure Share) / (Borough Population Share).<br/>
          A ratio &gt; 1.0 indicates Environmental Inequity. Data: LAEI 2019 & ONS Census 2021.
        </p>
      </div>
    </div>
  );
}