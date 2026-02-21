import React from "react";

export default function DetailPanel({ selectedFeature, onClose }) {
  if (!selectedFeature) return null;

  const p = selectedFeature.properties;
  const name = p.LAD22NM || "Borough";
  const rawRank = p.rawRank || 0;
  const weightedRank = p.weightedRank || 0;
  const jump = p.rankJump || 0;
  const ratio = p.burdenRatio ? Number(p.burdenRatio).toFixed(2) : "N/A";
  
  const isWorse = jump > 0;
  const absJump = Math.abs(jump);

  return (
    <div style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "28px", height: "100%", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h2 style={{ margin: 0, fontSize: "26px", fontWeight: "900" }}>{name}</h2>
        <button onClick={onClose} style={{ border: "none", background: "#f1f5f9", borderRadius: "50%", width: "35px", height: "35px", cursor: "pointer" }}>✕</button>
      </div>

      {/* P2: 优化后的动态位移图 (解决箭头重叠问题) */}
      <div style={{ 
        background: isWorse ? "#fff5f5" : "#f0fdf4", padding: "30px 10px", borderRadius: "20px", 
        border: `2px solid ${isWorse ? "#feb2b2" : "#bbf7d0"}`, position: "relative" 
      }}>
        <div style={{ fontSize: "10px", fontWeight: "900", textAlign: "center", marginBottom: "25px", color: isWorse ? "#c53030" : "#166534", textTransform: "uppercase" }}>
          Visual Shift: Concentration vs Burden
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", height: "70px", padding: "0 45px" }}>
          {/* 左侧原始排名 */}
          <div style={{ textAlign: "center", zIndex: 2, minWidth: "50px" }}>
            <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "bold" }}>RAW</div>
            <div style={{ fontSize: "24px", fontWeight: "900" }}>#{rawRank}</div>
          </div>

          {/* 生长动画 SVG - 调整了 path 长度以防遮挡 */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill={isWorse ? "#e53e3e" : "#22c55e"} />
              </marker>
            </defs>
            <path 
              // 关键修改：缩短了路径终点 L 的坐标，从 250 减至 220，防止盖住右侧文字
              d={`M 135 35 L 220 ${isWorse ? 15 : 55}`}
              fill="none" 
              stroke={isWorse ? "#e53e3e" : "#22c55e"} 
              strokeWidth="3" 
              strokeDasharray="300"
              strokeDashoffset="300"
              markerEnd="url(#arrowhead)"
              style={{ animation: "drawShift 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards", animationDelay: "0.3s" }}
            />
          </svg>

          {/* 右侧加权排名 */}
          <div style={{ textAlign: "center", zIndex: 2, minWidth: "50px" }}>
            <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "bold" }}>BURDEN</div>
            <div style={{ fontSize: "24px", fontWeight: "900", color: isWorse ? "#e53e3e" : "#22c55e" }}>#{weightedRank}</div>
          </div>
        </div>
        
        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "15px", fontWeight: "800", color: isWorse ? "#c53030" : "#166534" }}>
          {isWorse ? `Impact jumps by ${absJump} positions` : `Impact drops by ${absJump} positions`}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
        <div style={{ padding: "20px", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "900" }}>BURDEN RATIO</div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: ratio > 1 ? "#e53e3e" : "#1a202c" }}>{ratio}</div>
        </div>
        <div style={{ padding: "20px", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "900" }}>POPULATION</div>
          <div style={{ fontSize: "28px", fontWeight: "900" }}>{(p.Population/1000).toFixed(0)}k</div>
        </div>
      </div>

      <p style={{ fontSize: "15px", color: "#4a5568", lineHeight: "1.7", borderLeft: "4px solid #cbd5e0", paddingLeft: "20px", fontStyle: "italic" }}>
        {ratio > 1 
          ? `Environmental Inequity detected: ${name} bears a burden share that is ${((ratio-1)*100).toFixed(0)}% higher than its population share.`
          : `This area shows lower systemic risk relative to the city-wide average population burden.`}
      </p>

      <div style={{ marginTop: "auto", fontSize: "11px", color: "#64748b", borderTop: "1px solid #eee", paddingTop: "20px", lineHeight: "1.6" }}>
        <strong>Critical Note:</strong> Systemic inequality is often hidden within borough-level "averages". Real-world exposure near transit corridors is significantly more acute.
      </div>

      <style>{` 
        @keyframes drawShift { 
          to { stroke-dashoffset: 0; } 
        } 
      `}</style>
    </div>
  );
}