import React from "react";

export default function DetailPanel({ selectedFeature, onClose }) {
  if (!selectedFeature) return null;

  const p = selectedFeature.properties;
  const name = p.LAD22NM || "Unknown";
  const rawRank = p.rawRank || 0;
  const weightedRank = p.weightedRank || 0;
  const jump = p.rankJump || 0;
  const ratio = p.burdenRatio ? Number(p.burdenRatio).toFixed(2) : "N/A";
  
  const isWorse = jump > 0;
  const absJump = Math.abs(jump);

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px", height: "100%", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "800" }}>{name}</h2>
        <button onClick={onClose} style={{ border: "none", background: "#f1f5f9", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer" }}>✕</button>
      </div>

      {/* P2: 带动画的 Slope Graph */}
      <div style={{ 
        background: isWorse ? "#fff5f5" : "#f0fdf4", padding: "24px 16px", borderRadius: "16px", 
        border: `1px solid ${isWorse ? "#feb2b2" : "#bbf7d0"}`, position: "relative" 
      }}>
        <div style={{ fontSize: "10px", fontWeight: "800", textAlign: "center", marginBottom: "20px", color: isWorse ? "#c53030" : "#166534" }}>RANK SHIFT</div>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", height: "60px", padding: "0 30px" }}>
          <div style={{ textAlign: "center", zIndex: 2 }}>
            <div style={{ fontSize: "9px", color: "#64748b" }}>RAW</div>
            <div style={{ fontSize: "20px", fontWeight: "800" }}>#{rawRank}</div>
          </div>

          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill={isWorse ? "#e53e3e" : "#22c55e"} />
              </marker>
            </defs>
            <path 
              d={`M 110 30 L 230 ${isWorse ? 15 : 45}`} // 简单的路径模拟位移
              fill="none" 
              stroke={isWorse ? "#e53e3e" : "#22c55e"} 
              strokeWidth="2.5" 
              strokeDasharray="200"
              strokeDashoffset="200"
              markerEnd="url(#arrowhead)"
              style={{ animation: "drawPath 1.2s ease-out forwards", animationDelay: "0.2s" }}
            />
          </svg>

          <div style={{ textAlign: "center", zIndex: 2 }}>
            <div style={{ fontSize: "9px", color: "#64748b" }}>BURDEN</div>
            <div style={{ fontSize: "20px", fontWeight: "800", color: isWorse ? "#e53e3e" : "#22c55e" }}>#{weightedRank}</div>
          </div>
        </div>
        
        <div style={{ textAlign: "center", marginTop: "15px", fontSize: "13px", fontWeight: "700", color: isWorse ? "#c53030" : "#166534" }}>
          {isWorse ? `▲ Position rose by ${absJump}` : `▼ Position dropped by ${absJump}`}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "9px", color: "#64748b", fontWeight: "800" }}>BURDEN RATIO</div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: ratio > 1 ? "#e53e3e" : "#1a202c" }}>{ratio}</div>
        </div>
        <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "9px", color: "#64748b", fontWeight: "800" }}>POPULATION</div>
          <div style={{ fontSize: "20px", fontWeight: "800" }}>{(p.Population/1000).toFixed(0)}k</div>
        </div>
      </div>

      <p style={{ fontSize: "14px", color: "#4a5568", lineHeight: "1.6", borderLeft: "4px solid #e2e8f0", paddingLeft: "15px", fontStyle: "italic" }}>
        {ratio > 1 
          ? `With a burden ratio of ${ratio}, this borough faces environmental inequality—its share of London's pollution exposure exceeds its population share.`
          : `This borough's pollution impact is relatively lower than the city average when population density is factored in.`}
      </p>

      <div style={{ marginTop: "auto", fontSize: "10px", color: "#94a3b8", borderTop: "1px solid #eee", paddingTop: "15px" }}>
        <strong>Scale Awareness:</strong> While borough averages provide a city-wide lens, real-world exposure is often higher along major transit corridors.
      </div>

      <style>{`
        @keyframes drawPath { to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
}