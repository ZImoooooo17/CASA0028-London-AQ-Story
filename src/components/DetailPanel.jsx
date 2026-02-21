import React from "react";

function safeNum(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

function formatNum(x, digits = 2) {
  const n = safeNum(x);
  if (n == null) return "N/A";
  return n.toFixed(digits);
}

export default function DetailPanel({ selectedFeature, onClose, mode = "raw" }) {
  if (!selectedFeature) return null;

  const p = selectedFeature.properties || {};
  const name = p.LAD22NM || "Borough";

  const rawRank = safeNum(p.rawRank) ?? 0;
  const weightedRank = safeNum(p.weightedRank) ?? 0;
  const jump = safeNum(p.rankJump) ?? 0;

  const ratioNum = safeNum(p.burdenRatio);
  const ratioText = ratioNum == null ? "N/A" : ratioNum.toFixed(2);

  const popNum = safeNum(p.Population);
  const popText = popNum == null ? "N/A" : `${(popNum / 1000).toFixed(0)}k`;

  const no2Num = safeNum(p.NO2);

  // jump：正数=排名更“糟”（靠前/更高影响），你原逻辑用 isWorse = jump > 0
  const isWorse = jump > 0;
  const absJump = Math.abs(jump);

  const narrative =
    mode === "raw"
      ? {
          title: "RAW VIEW: CONCENTRATION",
          body:
            no2Num == null
              ? `This borough ranks #${rawRank} by average NO₂ concentration. Switch to Population Burden to see whether exposure becomes disproportionate.`
              : `This borough ranks #${rawRank} by average NO₂ (${formatNum(
                  no2Num,
                  1
                )} µg/m³). Switch to Population Burden to see whether exposure becomes disproportionate when population is considered.`,
        }
      : {
          title: "BURDEN VIEW: POPULATION WEIGHTED",
          body:
            ratioNum == null
              ? `In the burden view, this borough shifts from #${rawRank} (raw) to #${weightedRank} (burden).`
              : ratioNum > 1
              ? `When weighted by population, ${name} shifts from #${rawRank} (raw) to #${weightedRank} (burden). A burden ratio of ${ratioText} suggests exposure burden is about ${Math.round(
                  (ratioNum - 1) * 100
                )}% higher than its population share.`
              : `When weighted by population, ${name} shifts from #${rawRank} (raw) to #${weightedRank} (burden). A burden ratio of ${ratioText} suggests lower systemic burden relative to population share.`,
        };

  return (
    <div
      style={{
        padding: "30px",
        display: "flex",
        flexDirection: "column",
        gap: "22px",
        height: "100%",
        overflowY: "auto",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h2 style={{ margin: 0, fontSize: "26px", fontWeight: "900" }}>{name}</h2>
        <button
          onClick={onClose}
          style={{
            border: "none",
            background: "#f1f5f9",
            borderRadius: "50%",
            width: "35px",
            height: "35px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      {/* ✅ Narrative block：让面板成为“故事”而不是只报数 */}
      <div
        style={{
          padding: "18px 18px",
          borderRadius: 18,
          border: "1px solid #e2e8f0",
          background: "#ffffff",
        }}
      >
        <div style={{ fontSize: 10, fontWeight: 900, color: "#64748b", textTransform: "uppercase" }}>
          {narrative.title}
        </div>
        <div style={{ marginTop: 8, fontSize: 14.5, color: "#334155", lineHeight: 1.65 }}>
          {narrative.body}
        </div>
      </div>

      {/* Ranking shift card */}
      <div
        style={{
          background: isWorse ? "#fff5f5" : "#f0fdf4",
          padding: "26px 10px",
          borderRadius: "20px",
          border: `2px solid ${isWorse ? "#feb2b2" : "#bbf7d0"}`,
          position: "relative",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            fontWeight: "900",
            textAlign: "center",
            marginBottom: "22px",
            color: isWorse ? "#c53030" : "#166534",
            textTransform: "uppercase",
          }}
        >
          Visual Shift: Concentration vs Burden
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            height: "70px",
            padding: "0 45px",
          }}
        >
          <div style={{ textAlign: "center", zIndex: 2, minWidth: "50px" }}>
            <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "bold" }}>RAW</div>
            <div style={{ fontSize: "24px", fontWeight: "900" }}>#{rawRank}</div>
          </div>

          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill={isWorse ? "#e53e3e" : "#22c55e"} />
              </marker>
            </defs>
            <path
              d={`M 135 35 L 220 ${isWorse ? 15 : 55}`}
              fill="none"
              stroke={isWorse ? "#e53e3e" : "#22c55e"}
              strokeWidth="3"
              strokeDasharray="300"
              strokeDashoffset="300"
              markerEnd="url(#arrowhead)"
              style={{
                animation: "drawShift 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                animationDelay: "0.3s",
              }}
            />
          </svg>

          <div style={{ textAlign: "center", zIndex: 2, minWidth: "50px" }}>
            <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "bold" }}>BURDEN</div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "900",
                color: isWorse ? "#e53e3e" : "#22c55e",
              }}
            >
              #{weightedRank}
            </div>
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: "18px",
            fontSize: "15px",
            fontWeight: "800",
            color: isWorse ? "#c53030" : "#166534",
          }}
        >
          {jump === 0
            ? "No rank change"
            : isWorse
            ? `Impact jumps by ${absJump} positions`
            : `Impact drops by ${absJump} positions`}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
        <div style={{ padding: "20px", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "900" }}>BURDEN RATIO</div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: "900",
              color: ratioNum != null && ratioNum > 1 ? "#e53e3e" : "#1a202c",
            }}
          >
            {ratioText}
          </div>
        </div>

        <div style={{ padding: "20px", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "900" }}>POPULATION</div>
          <div style={{ fontSize: "28px", fontWeight: "900" }}>{popText}</div>
        </div>
      </div>

      <p
        style={{
          fontSize: "15px",
          color: "#4a5568",
          lineHeight: "1.7",
          borderLeft: "4px solid #cbd5e0",
          paddingLeft: "20px",
          fontStyle: "italic",
        }}
      >
        {ratioNum == null ? (
          <>Burden ratio is not available for this borough.</>
        ) : ratioNum > 1 ? (
          <>Environmental inequity detected: {name} bears a burden share about {Math.round((ratioNum - 1) * 100)}% higher than its population share.</>
        ) : (
          <>This area shows lower systemic risk relative to the city-wide average population burden.</>
        )}
      </p>

      <div
        style={{
          marginTop: "auto",
          fontSize: "11px",
          color: "#64748b",
          borderTop: "1px solid #eee",
          paddingTop: "20px",
          lineHeight: "1.6",
        }}
      >
        <strong>Critical Note:</strong> Borough-level averages can hide highly localised exposure near major roads
        and transit corridors.
      </div>

      <style>{`
        @keyframes drawShift {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}