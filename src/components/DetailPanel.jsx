import React from "react";

function num(x, fallback = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

function fmtPct01(x, digits = 1) {
  const n = Number(x);
  if (!Number.isFinite(n)) return "N/A";
  return `${(n * 100).toFixed(digits)}%`;
}

export default function DetailPanel({ selectedFeature, mode, onClose }) {
  if (!selectedFeature) return null;

  const p = selectedFeature.properties || {};
  const name = p.LAD22NM || "Borough";
  const isBurden = mode === "weighted";

  // 数据提取
  const no2 = num(p.NO2);
  const r = num(p.burdenRatio);
  const bShare = num(p.burdenShare);
  const pShare = num(p.populationShare ?? p.popShare);
  const jump = num(p.rankJump);
  const absJ = Math.abs(jump);

  // 1. Narrative Card 逻辑
  // 🎯 优化 1：增加轻微引导，提示 difference matters
  const narrative = isBurden
    ? {
        title: "Burden Narrative",
        body: `In this view, ${name} accounts for ${fmtPct01(bShare)} of London's total NO₂ exposure, while housing ${fmtPct01(pShare)} of its population. The difference between these shares determines whether exposure is disproportionate.`,
      }
    : {
        title: "Average Narrative",
        body: `${name} has an annual mean NO₂ concentration of ${no2.toFixed(1)} µg/m³. This represents the borough-wide average, regardless of population density.`,
      };

  // 2. RankJumpCard 逻辑
  const getJumpStory = () => {
    if (jump > 2) {
      return {
        type: "up",
        color: "#ef4444",
        label: "Rank Increase",
        story: `${name} rises ${absJ} places when population exposure is considered.`,
      };
    }
    if (jump < -2) {
      return {
        type: "down",
        color: "#3b82f6",
        label: "Rank Decrease",
        story: `${name} falls ${absJ} places when population exposure is considered.`,
      };
    }
    return {
      type: "same",
      color: "#64748b",
      label: "Stable Rank",
      story: `${name} remains in a similar position across both views.`,
    };
  };
  const jumpStory = getJumpStory();

  return (
    <div style={{ padding: "20px 24px", color: "#0f172a", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 950, letterSpacing: "-0.5px" }}>{name}</h2>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Borough Profile
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: "#f1f5f9", border: "none", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontWeight: "bold" }}
        >
          ×
        </button>
      </div>

      {/* Narrative Card */}
      <div style={{ background: "#f8fafc", padding: 16, borderRadius: 16, border: "1px solid #e2e8f0", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>
          {narrative.title}
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.5, color: "#334155" }}>
          {narrative.body}
        </div>
      </div>

      {/* Rank Jump Card */}
      <div 
        style={{ 
          // 🎯 优化 2：精确背景色逻辑
          background: jumpStory.type === "up" ? "#fff1f2" : jumpStory.type === "down" ? "#eff6ff" : "#f8fafc", 
          padding: 16, 
          borderRadius: 16, 
          border: `1px solid ${jumpStory.color}33`, 
          marginBottom: 16 
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 18 }}>{jumpStory.type === "up" ? "↑" : jumpStory.type === "down" ? "↓" : "•"}</span>
          <span style={{ fontSize: 12, fontWeight: 900, color: jumpStory.color, textTransform: "uppercase" }}>
            {jumpStory.label}
          </span>
        </div>
        <div style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.5 }}>
          {jumpStory.story}
        </div>
      </div>

      {/* Share Comparison Card */}
      {isBurden && (
        <div style={{ background: "#fff", padding: 16, borderRadius: 16, border: "1px solid #e2e8f0", marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", marginBottom: 12 }}>
            Exposure vs Population Share
          </div>
          
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "#64748b" }}>Exposure Share</span>
                <span style={{ fontWeight: 800 }}>{fmtPct01(bShare)}</span>
              </div>
              <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                {/* 🎯 优化 3：稳健的 bar 宽度计算 */}
                <div style={{ height: "100%", width: bShare != null ? `${bShare * 100}%` : "0%", background: "#ef4444" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "#64748b" }}>Population Share</span>
                <span style={{ fontWeight: 800 }}>{fmtPct01(pShare)}</span>
              </div>
              <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                {/* 🎯 优化 3：稳健的 bar 宽度计算 */}
                <div style={{ height: "100%", width: pShare != null ? `${pShare * 100}%` : "0%", background: "#94a3b8" }} />
              </div>
            </div>
          </div>

          {r != null && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px dashed #e2e8f0" }}>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                Burden Ratio: <span style={{ fontWeight: 900, color: r > 1.05 ? "#ef4444" : "#0f172a" }}>{r.toFixed(2)}×</span>
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                {r > 1.05 
                  ? "Exposure share exceeds population share." 
                  : r < 0.95 
                  ? "Population share exceeds exposure share." 
                  : "Exposure is roughly proportional to population."}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interpretive note */}
      <div style={{ padding: "0 8px", fontSize: 11.5, lineHeight: 1.5 }}>
        <div style={{ color: "rgba(15,23,42,0.58)" }}>
          Borough averages can hide localised exposure patterns. This is a borough-level lens — not a street-level diagnosis.
        </div>
      </div>
    </div>
  );
}