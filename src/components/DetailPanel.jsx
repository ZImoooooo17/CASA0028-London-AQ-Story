import React from "react";

function num(x, fallback = null) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

function fmtPct01(x, digits = 1) {
  const n = Number(x);
  if (!Number.isFinite(n)) return null;
  return `${(n * 100).toFixed(digits)}%`;
}

export default function DetailPanel({ selectedFeature, mode, onClose }) {
  if (!selectedFeature) return null;

  const p = selectedFeature.properties || {};
  const name = p.LAD22NM || "Borough";

  const rawRank = num(p.rawRank ?? p.rankRaw);
  const weightedRank = num(p.weightedRank ?? p.rankWeighted);
  const jump = num(p.rankJump, 0);
  const absJ = Math.abs(jump);

  const no2 = num(p.NO2);
  const burdenRatio = num(p.burdenRatio);
  const burdenShare = num(p.burdenShare);
  const popShare = num(p.populationShare ?? p.popShare);

  const isWeighted = mode === "weighted";

  return (
    <div
      id="detail-panel"
      style={{
        padding: "28px 26px",
        fontFamily: "system-ui, sans-serif",
        color: "#0f172a",
      }}
    >
      {/* ---------------- Header ---------------- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 28,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 950,
              letterSpacing: "-0.4px",
            }}
          >
            {name}
          </h2>
          <div
            style={{
              fontSize: 12,
              textTransform: "uppercase",
              color: "#64748b",
              letterSpacing: "0.12em",
              marginTop: 6,
              fontWeight: 700,
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
            width: 30,
            height: 30,
            borderRadius: "50%",
            cursor: "pointer",
            fontWeight: "bold",
            color: "#64748b",
          }}
        >
          ×
        </button>
      </div>

      {/* =====================================================
         RAW MODE — Statistical Average
      ===================================================== */}
      {!isWeighted && (
        <>
          {/* Rank Card */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 20,
              padding: 24,
              border: "1px solid #e2e8f0",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontSize: 58,
                fontWeight: 900,
                color: "#1e40af",
                lineHeight: 1,
              }}
            >
              #{rawRank ?? "–"}
            </div>

            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "#64748b",
                fontWeight: 800,
              }}
            >
              Raw Rank (NO₂ Concentration)
            </div>

            {no2 != null && (
              <div
                style={{
                  marginTop: 18,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "#334155",
                }}
              >
                Annual mean concentration: <strong>{no2.toFixed(1)} µg/m³</strong>
              </div>
            )}

            <div
              style={{
                marginTop: 18,
                fontSize: 13,
                lineHeight: 1.6,
                color: "#475569",
              }}
            >
              This borough-wide average distributes exposure evenly across space,
              without accounting for population density.
            </div>

            <div
              style={{
                marginTop: 16,
                fontSize: 12,
                color: "#64748b",
              }}
            >
              Switch to the population-weighted view to observe how this position shifts.
            </div>
          </div>
        </>
      )}

      {/* =====================================================
         WEIGHTED MODE — Reordered Visibility
      ===================================================== */}
      {isWeighted && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: 20,
            padding: 26,
            border: "1px solid #e2e8f0",
          }}
        >
          {/* Rank Shift */}
          <div
            key={mode}
            style={{
              fontSize: 72,
              fontWeight: 950,
              lineHeight: 1,
              color:
                jump > 0
                  ? "#dc2626"
                  : jump < 0
                  ? "#1e40af"
                  : "#475569",
              animation: "rankPulse 0.6s ease-out",
            }}
          >
            {jump > 0 ? `+${absJ}` : jump < 0 ? `-${absJ}` : "0"}
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "#64748b",
              fontWeight: 800,
            }}
          >
            Positions Reordered
          </div>

          {/* Rank Comparison */}
          <div style={{ marginTop: 18, fontSize: 14 }}>
            Raw Rank: <strong>{rawRank ?? "–"}</strong>
            <br />
            Weighted Rank: <strong>{weightedRank ?? "–"}</strong>
          </div>

          {/* Interpretation */}
          <div
            style={{
              marginTop: 22,
              paddingTop: 18,
              borderTop: "1px dashed #e2e8f0",
              fontSize: 14,
              lineHeight: 1.6,
              color: "#334155",
            }}
          >
            {jump > 0 && (
              <>When exposure is weighted by population density, {name} rises in London’s ranking, revealing a disproportionate share of total exposure.</>
            )}
            {jump < 0 && (
              <>Under population weighting, {name} falls in rank, indicating that high concentration does not necessarily correspond to the greatest population burden.</>
            )}
            {jump === 0 && (
              <>This borough remains similarly positioned under both ranking systems, suggesting limited redistribution of exposure visibility.</>
            )}
          </div>

          {/* Exposure vs Population Share */}
          {(burdenShare != null && popShare != null) && (
            <div
              style={{
                marginTop: 24,
                paddingTop: 18,
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#64748b",
                  fontWeight: 800,
                  marginBottom: 14,
                }}
              >
                Exposure vs Population Share
              </div>

              <div style={{ fontSize: 13, marginBottom: 8 }}>
                Exposure Share: <strong>{fmtPct01(burdenShare)}</strong>
              </div>
              <div
                style={{
                  height: 6,
                  background: "#f1f5f9",
                  borderRadius: 3,
                  marginBottom: 14,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${burdenShare * 100}%`,
                    background: "#dc2626",
                  }}
                />
              </div>

              <div style={{ fontSize: 13, marginBottom: 8 }}>
                Population Share: <strong>{fmtPct01(popShare)}</strong>
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
                    width: `${popShare * 100}%`,
                    background: "#94a3b8",
                  }}
                />
              </div>

              {burdenRatio != null && (
                <div
                  style={{
                    marginTop: 14,
                    fontSize: 13,
                    color: "#475569",
                  }}
                >
                  Burden Ratio: <strong>{burdenRatio.toFixed(2)}×</strong>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes rankPulse {
          0% { transform: scale(0.92); opacity: 0.6; }
          50% { transform: scale(1.06); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

