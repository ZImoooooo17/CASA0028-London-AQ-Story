import React, { useMemo } from "react";

export default function BarRankChart({ data, mode, selectedId, onSelect, onHover }) {
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

  return (
    <div style={{ padding: "15px", position: "relative" }}>
      <h3 style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "20px" }}>
        Ranking by {mode === "raw" ? "NO₂ Concentration" : "Population Burden"}
      </h3>

      {/* ✅ 100% / Average 标记线 (仅在 Weighted 模式显示) */}
      {mode === "weighted" && (
        <div style={{
          position: "absolute",
          left: "calc(15px + 50%)", // 与进度条的 50% 位置对齐
          top: "45px",
          bottom: "15px",
          width: "1px",
          borderLeft: "1px dashed #cbd5e0",
          zIndex: 0,
          pointerEvents: "none"
        }}>
          <span style={{ 
            position: "absolute", 
            top: "-18px", 
            left: "-20px", 
            fontSize: "9px", 
            color: "#94a3b8",
            fontWeight: "bold" 
          }}>
            AVG (100%)
          </span>
        </div>
      )}
      
      <div style={{ position: "relative", zIndex: 1 }}>
        {list.map((item) => {
          // 格式化数值：Weighted 模式转为百分比，Raw 模式保留一位小数
          const displayValue = mode === "weighted" 
            ? `${(item.value * 100).toFixed(0)}%` 
            : item.value.toFixed(1);

          const isSelected = item.id === selectedId;

          return (
            <div
              key={item.id}
              onClick={() => onSelect(item.id)}
              onMouseEnter={() => onHover(item.id)}
              onMouseLeave={() => onHover(null)}
              style={{
                padding: "6px 10px",
                marginBottom: "2px",
                cursor: "pointer",
                borderRadius: "6px",
                background: isSelected ? "#f0f7ff" : "transparent",
                transition: "background 0.2s"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "4px" }}>
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
                  {displayValue}
                </span>
              </div>
              
              {/* 进度条轨道 */}
              <div style={{ height: "4px", background: "#f1f5f9", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ 
                  height: "100%", 
                  // 映射逻辑：Weighted 模式下，1.0 (100%) 占据一半宽度 (50%)
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
  );
}