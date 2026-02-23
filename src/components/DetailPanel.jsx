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

  const no2 = num(p.NO2);
  const r = num(p.burdenRatio);
  const bShare = num(p.burdenShare);
  const pShare = num(p.populationShare ?? p.popShare);
  const jump = num(p.rankJump);
  const absJ = Math.abs(jump);

  const weightedRank = num(p.weightedRank ?? p.rankWeighted ?? p.rank);
  const rawRank =
    num(p.rawRank ?? p.rankRaw) ||
    (weightedRank && jump ? weightedRank - jump : null);

  const narrative = isBurden
    ? {
        title: "Burden Narrative",
        body: `In this view, ${name} accounts for ${fmtPct01(
          bShare
        )} of London's total NO₂ exposure while housing ${fmtPct01(
          pShare
        )} of its population. The difference between these shares determines whether exposure is disproportionate.`,
      }
    : {
        title: "Average Narrative",
        body: `${name} has an annual mean NO₂ concentration of ${no2.toFixed(
          1
        )} µg/m³. This represents the borough-wide average, regardless of population density.`,
      };

  return (
    <div
      style={{
        padding: "20px 24px",
        color: "#0f172a",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 950,
              letterSpacing: "-0.5px",
            }}
          >
            {name}
          </h2>
          <div
            style={{
              fontSize: 12,
              color: "#64748b",
              fontWeight: 600,
              marginTop: 4,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Borough Profile
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "#f1f5f9",
            border: "none",
            width: 28,
            height: 28,
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
            fontWeight: "bold",
          }}
        >
          ×
        </button>
      </div>

      {/* Narrative */}
      <div
        style={{
          background: "#f8fafc",
          padding: 16,
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          marginBottom: 18,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 900,
            color: "#94a3b8",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          {narrative.title}
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: "#334155" }}>
          {narrative.body}
        </div>
      </div>

      {/* Rank Shift Block */}
      {isBurden && (
        <div
          style={{
            background: "#ffffff",
            padding: 20,
            borderRadius: 18,
            border: "1px solid #e2e8f0",
            marginBottom: 20,
          }}
        >
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 50,
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: "-1px",
                color:
                  jump > 0
                    ? "#b23a3a"
                    : jump < 0
                    ? "#2f5c8a"
                    : "#475569",
              }}
            >
              {jump > 0 ? `+${absJ}` : jump < 0 ? `-${absJ}` : "0"}
            </div>

            <div
              style={{
                fontSize: 13,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#64748b",
                fontWeight: 700,
                marginTop: 6,
              }}
            >
              Rank Shift under population weighting
            </div>
          </div>

          <div style={{ display: "grid", gap: 6, fontSize: 14 }}>
            {rawRank != null && (
              <div>
                Raw Rank:{" "}
                <span style={{ fontWeight: 800 }}>{rawRank}</span>
              </div>
            )}
            {weightedRank != null && (
              <div>
                Weighted Rank:{" "}
                <span style={{ fontWeight: 800 }}>{weightedRank}</span>
              </div>
            )}
          </div>

          {/* Political Interpretation */}
          <div
            style={{
              marginTop: 16,
              paddingTop: 14,
              borderTop: "1px dashed #e2e8f0",
              fontSize: 13,
              lineHeight: 1.6,
              color: "#475569",
            }}
          >
            {jump !== 0 && (
              <>
                When exposure is weighted by population, {name}{" "}
                {jump > 0 ? "rises" : "falls"} in the London ranking.
                <br />
                <br />
                Average concentration distributes attention evenly
                across space. Population weighting redistributes
                attention across people.
                <br />
                <br />
                Different metrics foreground different forms of exposure.
              </>
            )}
            {jump === 0 && (
              <>
                {name} remains in a similar position under both
                ranking systems.
                <br />
                <br />
                The stability itself reflects how different metrics
                can converge or diverge in shaping visibility.
              </>
            )}
          </div>
        </div>
      )}

      {/* Share Comparison */}
      {isBurden && (
        <div
          style={{
            background: "#fff",
            padding: 16,
            borderRadius: 16,
            border: "1px solid #e2e8f0",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              color: "#94a3b8",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Exposure vs Population Share
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                <span style={{ color: "#64748b" }}>Exposure Share</span>
                <span style={{ fontWeight: 800 }}>
                  {fmtPct01(bShare)}
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  background: "#f1f5f9",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${bShare * 100}%`,
                    background: "#b23a3a",
                  }}
                />
              </div>
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                <span style={{ color: "#64748b" }}>Population Share</span>
                <span style={{ fontWeight: 800 }}>
                  {fmtPct01(pShare)}
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  background: "#f1f5f9",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pShare * 100}%`,
                    background: "#94a3b8",
                  }}
                />
              </div>
            </div>
          </div>

          {r != null && (
            <div
              style={{
                marginTop: 14,
                paddingTop: 14,
                borderTop: "1px dashed #e2e8f0",
                fontSize: 12,
                color: "#64748b",
              }}
            >
              Burden Ratio:{" "}
              <span
                style={{
                  fontWeight: 900,
                  color: r > 1 ? "#b23a3a" : "#0f172a",
                }}
              >
                {r.toFixed(2)}×
              </span>
            </div>
          )}
        </div>
      )}

      {/* Epistemic Reflection */}
      <div style={{ padding: "0 8px", fontSize: 11.5, lineHeight: 1.6 }}>
        <div style={{ color: "rgba(15,23,42,0.58)" }}>
          Every metric foregrounds some forms of exposure and backgrounds others.
          This interface makes that redistribution visible at borough scale.
        </div>
      </div>
    </div>
  );
}