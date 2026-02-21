import React from "react";

export default function DetailPanel({ selectedFeature, onClose }) {
  if (!selectedFeature) return null;

  const p = selectedFeature.properties;
  
  // 安全获取数值
  const name = p.LAD22NM || "Unknown Borough";
  const rawRank = p.rawRank || "N/A";
  const weightedRank = p.weightedRank || "N/A";
  const jump = p.rankJump || 0;
  const ratio = p.burdenRatio ? Number(p.burdenRatio).toFixed(2) : "N/A";
  const population = p.Population ? (p.Population / 1000).toFixed(0) + "k" : "N/A";

  // 排名上升（数值变小，如从17到5）代表情况变糟糕
  const isWorse = jump > 0;
  const absJump = Math.abs(jump);

  return (
    <div style={{
      padding: "24px", background: "#fff", height: "100%", overflowY: "auto",
      display: "flex", flexDirection: "column", gap: "20px", fontFamily: "inherit"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800" }}>{name}</h2>
        <button onClick={onClose} style={{ border: "none", background: "#eee", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer" }}>✕</button>
      </div>

      {/* 叙事卡片 */}
      <div style={{ 
        padding: "16px", borderRadius: "12px", 
        background: isWorse ? "#fff5f5" : "#f0fff4",
        border: `1px solid ${isWorse ? "#feb2b2" : "#98fb98"}`
      }}>
        <div style={{ fontSize: "11px", fontWeight: "bold", color: isWorse ? "#c53030" : "#2f855a", marginBottom: "8px", textTransform: "uppercase" }}>
          Re-Ranking Impact
        </div>
        <div style={{ fontSize: "14px", lineHeight: "1.6" }}>
          In Raw NO₂ mode, this borough ranks <strong>#{rawRank}</strong>. <br/>
          In Population Burden mode, it shifts to <strong>#{weightedRank}</strong>.
        </div>
        
        {absJump !== 0 && (
          <div style={{ marginTop: "12px", fontWeight: "bold", fontSize: "14px", color: isWorse ? "#c53030" : "#2f855a" }}>
            {isWorse ? "▲ Rank Increased (Worse)" : "▼ Rank Decreased (Better)"} by {absJump} positions
          </div>
        )}
      </div>

      {/* 数据网格 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ padding: "12px", background: "#f7fafc", borderRadius: "8px", border: "1px solid #edf2f7" }}>
          <div style={{ fontSize: "10px", color: "#718096", fontWeight: "600" }}>BURDEN RATIO</div>
          <div style={{ fontSize: "20px", fontWeight: "bold", color: ratio > 1 ? "#e53e3e" : "#2d3748" }}>{ratio}</div>
        </div>
        <div style={{ padding: "12px", background: "#f7fafc", borderRadius: "8px", border: "1px solid #edf2f7" }}>
          <div style={{ fontSize: "10px", color: "#718096", fontWeight: "600" }}>POPULATION</div>
          <div style={{ fontSize: "20px", fontWeight: "bold" }}>{population}</div>
        </div>
      </div>

      {/* 批判性论述 */}
      <div style={{ marginTop: "10px", borderLeft: "3px solid #cbd5e0", paddingLeft: "15px" }}>
        <p style={{ margin: 0, fontSize: "14px", color: "#4a5568", fontStyle: "italic", lineHeight: "1.5" }}>
          {ratio > 1 
            ? `Burden ratio of ${ratio} indicates this borough bears a share of city's pollution exposure that exceeds its population share.` 
            : `A burden ratio below 1 suggests that the local population's total pollution exposure is lower than the city-wide average share.`}
        </p>
      </div>

      <div style={{ marginTop: "auto", fontSize: "11px", color: "#a0aec0", borderTop: "1px solid #eee", paddingTop: "15px" }}>
        <strong>The Stack Perspective:</strong> This re-sorting reveals how "average" values can obscure systemic inequalities.
      </div>
    </div>
  );
}
