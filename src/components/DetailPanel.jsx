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

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

/**
 * Rank shift module (visual + narrative)
 * Direction is derived from ranks directly:
 *  - weightedRank < rawRank => becomes more prominent under burden (UP)
 *  - weightedRank > rawRank => becomes less prominent under burden (DOWN)
 */
function RankShiftCard({ rawRank, weightedRank, name, mode }) {
  const r = safeNum(rawRank);
  const w = safeNum(weightedRank);

  // Defensive defaults
  const raw = r == null ? 0 : r;
  const weighted = w == null ? 0 : w;

  const delta = raw - weighted; // positive => UP (weighted rank number smaller)
  const absDelta = Math.abs(delta);

  const dir = delta > 0 ? "up" : delta < 0 ? "down" : "same";

  const palette = {
    up: { bg: "#fff5f5", border: "#fecaca", accent: "#e53e3e", text: "#7f1d1d" },
    down: { bg: "#eff6ff", border: "#bfdbfe", accent: "#2563eb", text: "#1e3a8a" },
    same: { bg: "#f8fafc", border: "#e2e8f0", accent: "#64748b", text: "#334155" },
  }[dir];

  const headline =
    dir === "same"
      ? "No rank change"
      : dir === "up"
      ? `Jumps up by ${absDelta} places`
      : `Drops by ${absDelta} places`;

  const explainer =
    dir === "same"
      ? "Population weighting does not change this borough’s position."
      : dir === "up"
      ? "When population is considered, this borough becomes more prominent — average concentration may understate exposure pressure."
      : "Under population weighting, this borough becomes less prominent — high concentration may affect fewer people overall.";

  // make a small “ladder bar” proportional but stable-looking
  const maxShown = 33; // ~ number of London boroughs; ok if slightly off
  const rawPos = clamp(raw / maxShown, 0, 1);
  const weightedPos = clamp(weighted / maxShown, 0, 1);

  return (
    <div
      style={{
        background: palette.bg,
        padding: 18,
        borderRadius: 20,
        border: `2px solid ${palette.border}`,
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 900,
              color: palette.text,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Rank shift
          </div>
          <div style={{ marginTop: 6, fontSize: 16, fontWeight: 900, color: "#0f172a" }}>
            {headline}
          </div>
        </div>

        <div
          style={{
            padding: "8px 12px",
            borderRadius: 999,
            border: "1px solid rgba(0,0,0,0.08)",
            background: "rgba(255,255,255,0.75)",
            fontWeight: 900,
            color: palette.accent,
            display: "flex",
            alignItems: "center",
            gap: 8,
            whiteSpace: "nowrap",
          }}
          title="Change from Raw Rank to Burden Rank"
        >
          <span style={{ fontSize: 16 }}>
            {dir === "up" ? "↑" : dir === "down" ? "↓" : "→"}
          </span>
          <span>{dir === "same" ? "0" : absDelta}</span>
        </div>
      </div>

      {/* Ladder */}
      <div
        style={{
          marginTop: 14,
          borderRadius: 16,
          border: "1px solid rgba(0,0,0,0.08)",
          background: "rgba(255,255,255,0.9)",
          padding: 14,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ padding: 12, borderRadius: 14, background: "rgba(37,99,235,0.08)" }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: "#2563eb" }}>RAW RANK</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#0f172a" }}>#{raw}</div>
          </div>

          <div style={{ padding: 12, borderRadius: 14, background: "rgba(229,62,62,0.08)" }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: "#e53e3e" }}>BURDEN RANK</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: palette.accent }}>#{weighted}</div>
          </div>
        </div>

        {/* mini rank track */}
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b" }}>
            <span>Top</span>
            <span>Bottom</span>
          </div>

          <div
            style={{
              marginTop: 6,
              height: 12,
              borderRadius: 999,
              background: "rgba(0,0,0,0.06)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Raw marker */}
            <div
              style={{
                position: "absolute",
                left: `${rawPos * 100}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 14,
                height: 14,
                borderRadius: 999,
                background: "#2563eb",
                border: "2px solid white",
                boxShadow: "0 6px 14px rgba(0,0,0,0.18)",
              }}
              title={`Raw rank #${raw}`}
            />

            {/* Weighted marker */}
            <div
              style={{
                position: "absolute",
                left: `${weightedPos * 100}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 14,
                height: 14,
                borderRadius: 999,
                background: palette.accent,
                border: "2px solid white",
                boxShadow: "0 6px 14px rgba(0,0,0,0.18)",
              }}
              title={`Burden rank #${weighted}`}
            />

            {/* connector */}
            <div
              style={{
                position: "absolute",
                left: `${Math.min(rawPos, weightedPos) * 100}%`,
                width: `${Math.abs(rawPos - weightedPos) * 100}%`,
                top: "50%",
                transform: "translateY(-50%)",
                height: 4,
                borderRadius: 999,
                background: palette.accent,
                opacity: 0.6,
              }}
            />
          </div>

          <div style={{ marginTop: 10, fontSize: 12.5, color: "#475569", lineHeight: 1.5 }}>
            <strong style={{ color: "#0f172a" }}>{name}</strong>: {explainer}
            {mode === "raw" && (
              <div style={{ marginTop: 6, opacity: 0.9 }}>
                Tip: switch to <strong>Population Burden</strong> to see how the ranking changes.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DetailPanel({ selectedFeature, onClose, mode = "raw" }) {
  if (!selectedFeature) return null;

  const p = selectedFeature.properties || {};
  const name = p.LAD22NM || "Borough";

  const rawRank = safeNum(p.rawRank);
  const weightedRank = safeNum(p.weightedRank);

  // keep your existing rankJump field if you want to show it elsewhere
  const jump = safeNum(p.rankJump);

  const ratioNum = safeNum(p.burdenRatio);
  const ratioText = ratioNum == null ? "N/A" : ratioNum.toFixed(2);

  const popNum = safeNum(p.Population);
  const popText = popNum == null ? "N/A" : `${(popNum / 1000).toFixed(0)}k`;

  const no2Num = safeNum(p.NO2);

  const narrative =
    mode === "raw"
      ? {
          title: "RAW VIEW: CONCENTRATION",
          body:
            no2Num == null
              ? `This borough ranks #${rawRank ?? "N/A"} by average NO₂ concentration. Switch to Population Burden to test whether exposure becomes disproportionate.`
              : `This borough ranks #${rawRank ?? "N/A"} by average NO₂ (${formatNum(
                  no2Num,
                  1
                )} µg/m³). Switch to Population Burden to see whether exposure becomes disproportionate when population is considered.`,
        }
      : {
          title: "BURDEN VIEW: POPULATION WEIGHTED",
          body:
            ratioNum == null
              ? `In the burden view, this borough shifts from #${rawRank ?? "N/A"} (raw) to #${weightedRank ?? "N/A"} (burden).`
              : ratioNum > 1
              ? `When weighted by population, ${name} shifts from #${rawRank ?? "N/A"} (raw) to #${
                  weightedRank ?? "N/A"
                } (burden). A burden ratio of ${ratioText} suggests exposure burden is about ${Math.round(
                  (ratioNum - 1) * 100
                )}% higher than its population share.`
              : `When weighted by population, ${name} shifts from #${rawRank ?? "N/A"} (raw) to #${
                  weightedRank ?? "N/A"
                } (burden). A burden ratio of ${ratioText} suggests lower systemic burden relative to population share.`,
        };

  // small helper line for burden ratio interpretation
  const burdenLine =
    ratioNum == null
      ? "Burden ratio is not available for this borough."
      : ratioNum > 1
      ? `Environmental inequity detected: ${name} bears a burden share about ${Math.round((ratioNum - 1) * 100)}% higher than its population share.`
      : "This area shows lower systemic risk relative to the city-wide average population burden.";

  return (
    <div
      style={{
        padding: 30,
        display: "flex",
        flexDirection: "column",
        gap: 18,
        height: "100%",
        overflowY: "auto",
      }}
    >
      {/* Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: "-0.4px" }}>{name}</h2>
          <div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>
            Click different boroughs to compare rank shifts and burden ratios.
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            border: "none",
            background: "#f1f5f9",
            borderRadius: "50%",
            width: 35,
            height: 35,
            cursor: "pointer",
            fontWeight: 900,
          }}
          aria-label="Close details panel"
          title="Close"
        >
          ✕
        </button>
      </div>

      {/* Narrative block */}
      <div
        style={{
          padding: 16,
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

        {/* Optional: show rankJump field if you want transparency */}
        {jump != null && (
          <div style={{ marginTop: 10, fontSize: 12, color: "#64748b" }}>
            Data field: <strong>rankJump</strong> = {jump}
          </div>
        )}
      </div>

      {/* ✅ Rank Jump visual 강화：RankShiftCard */}
      <RankShiftCard rawRank={rawRank} weightedRank={weightedRank} name={name} mode={mode} />

      {/* Key stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ padding: 18, background: "#f8fafc", borderRadius: 16, border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 10, color: "#64748b", fontWeight: 900 }}>BURDEN RATIO</div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: ratioNum != null && ratioNum > 1 ? "#e53e3e" : "#0f172a",
            }}
          >
            {ratioText}
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: "#64748b", lineHeight: 1.45 }}>
            {ratioNum == null ? (
              <>N/A</>
            ) : (
              <>
                <strong>1.0</strong> = proportional • <strong>&gt; 1.0</strong> = disproportionate exposure
              </>
            )}
          </div>
        </div>

        <div style={{ padding: 18, background: "#f8fafc", borderRadius: 16, border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 10, color: "#64748b", fontWeight: 900 }}>POPULATION</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#0f172a" }}>{popText}</div>
          <div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>Approx. residents (k).</div>
        </div>
      </div>

      {/* Interpretation */}
      <p
        style={{
          fontSize: 14.5,
          color: "#475569",
          lineHeight: 1.7,
          borderLeft: "4px solid #cbd5e0",
          paddingLeft: 16,
          fontStyle: "italic",
          margin: 0,
        }}
      >
        {burdenLine}
      </p>

      <div
        style={{
          marginTop: "auto",
          fontSize: 11.5,
          color: "#64748b",
          borderTop: "1px solid #e2e8f0",
          paddingTop: 16,
          lineHeight: 1.6,
        }}
      >
        <strong>Critical note:</strong> Borough averages can hide highly localised exposure near major roads and
        transit corridors. This interface is a borough-level lens — a prompt for further, more granular inquiry.
      </div>
    </div>
  );
}