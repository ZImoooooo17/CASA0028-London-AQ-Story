import React from "react";

export default function DetailPanel({ selectedFeature, onClose }) {
  if (!selectedFeature) return null;

  const p = selectedFeature.properties;
  const name = p.LAD22NM || "Unknown Borough";
  const rawRank = p.rawRank || 0;
  const weightedRank = p.weightedRank || 0;
  const jump = p.rankJump || 0;
  const ratio = p.burdenRatio ? Number(p.burdenRatio).toFixed(2) : "N/A";
  const population = p.Population ? (p.Population / 1000).toFixed(0) + "k" : "N/A";

  // jump > 0 代表排名数值变大（例如从5名变成15名），但在列表显示中位置靠后通常代表情况“变好”？
  // 注意：在你的逻辑中，NO2越高排名越靠前。所以 jump = rawRank - weightedRank。
  // 如果 rawRank=10, weightedRank=2, jump=+8，代表排名上升了（变糟糕了）
  const isWorse = jump > 0; 
  const absJump = Math.abs(jump);

  return (
    <div style={{
      padding: "24px", background: "#fff", height: "100%", overflowY: "auto",
      display: "flex", flexDirection: "column", gap: "24px", fontFamily: "inherit"
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#1a202c" }}>{name}</h2>
          <div style={{ fontSize: "12px", color: "#718096", marginTop: "4px" }}>Borough Impact Profile</div>
        </div>
        <button onClick={onClose} style={{ border: "none", background: "#f1f5f9", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer" }}>✕</button>
      </div>

      {/* P1: Visual Rank Shift (Slope Graph) */}
      <div style={{ 
        background: isWorse ? "#fff5f5" : "#f0fdf4", 
        padding: "24px 16px", borderRadius: "16px", border: `1px solid ${isWorse ? "#feb2b2" : "#bbf7d0"}` 
      }}>
        <div style={{ fontSize: "11px", fontWeight: "800", color: isWorse ? "#c53030" : "#166534", marginBottom: "20px", textAlign: "center", textTransform: "uppercase" }}>
          Re-Ranking Shift
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", height: "60px", padding: "0 30px" }}>
          {/* Raw Rank Node */}
          <div style={{ textAlign: "center", zIndex: 2 }}>
            <div style={{ fontSize: "10px", color: "#64748b" }}>Raw Rank</div>
            <div style={{ fontSize: "20px", fontWeight: "800" }}>#{rawRank}</div>
          </div>

          {/* SVG Connector */}
          <svg style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill={isWorse ? "#e53e3e" : "#22c55e"} />
              </marker>
            </defs>
            <line 
              x1="35%" y1="50%" x2="60%" y2={isWorse ? "30%" : "70%"} 
              stroke={isWorse ? "#e53e3e" : "#22c55e"} strokeWidth="2" strokeDasharray="4"
              markerEnd="url(#arrowhead)"
            />
          </svg>

          {/* Weighted Rank Node */}
          <div style={{ textAlign: "center", zIndex: 2 }}>
            <div style={{ fontSize: "10px", color: "#64748b" }}>Burden Rank</div>
            <div style={{ fontSize: "20px", fontWeight: "800", color: isWorse ? "#e53e3e" : "#22c55e" }}>#{weightedRank}</div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "15px", fontSize: "14px", fontWeight: "700", color: isWorse ? "#c53030" : "#166534" }}>
          {isWorse ? `▲ Rank climbed by ${absJump} spots` : `▼ Rank dropped by ${absJump} spots`}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "700" }}>BURDEN RATIO</div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: ratio > 1 ? "#e53e3e" : "#2d3748" }}>{ratio}</div>
        </div>
        <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "700" }}>POPULATION</div>
          <div style={{ fontSize: "24px", fontWeight: "800" }}>{population}</div>
        </div>
      </div>

      {/* Narrative Section */}
      <div style={{ borderLeft: "4px solid #e2e8f0", paddingLeft: "16px" }}>
        <p style={{ margin: 0, fontSize: "14px", color: "#4a5568", lineHeight: "1.6", fontStyle: "italic" }}>
          {ratio > 1 
            ? `Burden ratio of ${ratio} indicates this borough bears a share of city's pollution exposure that exceeds its population share. The re-ranking exposes a significant environmental justice gap.` 
            : `A burden ratio below 1 suggests that despite local NO₂ levels, the human impact is lower than the city-wide average relative to its population.`}
        </p>
      </div>

      {/* Footer / Meta Note */}
      <div style={{ marginTop: "auto", paddingTop: "15px", borderTop: "1px solid #f1f5f9", fontSize: "10px", color: "#94a3b8", lineHeight: "1.4" }}>
        <strong>The Stack Perspective:</strong> This visualization critiques how "average" concentrations can obscure actual exposure. However, please note that intra-borough variations near main roads remain much higher than these averages.
      </div>
    </div>
  );
}