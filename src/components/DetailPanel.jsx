import React from "react";

/* ---------------- helpers ---------------- */

function safeNum(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}
function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}
function pct01(x, digits = 1) {
  const n = safeNum(x);
  if (n == null) return "N/A";
  return `${(n * 100).toFixed(digits)}%`;
}
function kFmt(n) {
  const v = safeNum(n);
  if (v == null) return "N/A";
  return `${Math.round(v / 1000)}k`;
}

/* ---------------- minimal UI primitives ---------------- */

function Card({ children, style }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.92)",
        border: "1px solid rgba(15,23,42,0.10)",
        borderRadius: 18,
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        backdropFilter: "blur(8px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Label({ children, style }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 900,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "rgba(15,23,42,0.45)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Pill({ children, tone = "neutral", style, title }) {
  const tones =
    {
      neutral: {
        bg: "rgba(15,23,42,0.06)",
        border: "rgba(15,23,42,0.10)",
        text: "rgba(15,23,42,0.78)",
      },
      red: {
        bg: "rgba(229,62,62,0.10)",
        border: "rgba(229,62,62,0.22)",
        text: "#b91c1c",
      },
      blue: {
        bg: "rgba(37,99,235,0.10)",
        border: "rgba(37,99,235,0.22)",
        text: "#1e40af",
      },
    }[tone] || {
      bg: "rgba(15,23,42,0.06)",
      border: "rgba(15,23,42,0.10)",
      text: "rgba(15,23,42,0.78)",
    };

  return (
    <span
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        border: `1px solid ${tones.border}`,
        background: tones.bg,
        color: tones.text,
        fontSize: 12,
        fontWeight: 850,
        lineHeight: 1,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

function H2({ children }) {
  return (
    <div
      style={{
        fontSize: 24,
        fontWeight: 950,
        letterSpacing: "-0.6px",
        color: "rgba(15,23,42,0.95)",
      }}
    >
      {children}
    </div>
  );
}

function Muted({ children, style }) {
  return <div style={{ color: "rgba(15,23,42,0.55)", ...style }}>{children}</div>;
}

/* ---------------- interpretation rules ---------------- */

function interpretBurden(burdenRatio) {
  const r = safeNum(burdenRatio);
  if (r == null) {
    return {
      tone: "neutral",
      label: "Unavailable",
      text: "Burden ratio is unavailable for this borough.",
      note: "No inequality claim can be made without a valid ratio.",
    };
  }

  if (r >= 1.2) {
    return {
      tone: "red",
      label: "Strongly disproportionate",
      text: "Strongly disproportionate: exposure burden is substantially higher than population share.",
      note: "This supports an inequality reading in the burden view.",
    };
  }

  if (r >= 1.05) {
    return {
      tone: "red",
      label: "Higher-than-expected",
      text: "Higher-than-expected: exposure burden exceeds population share.",
      note: "This suggests above-average exposure pressure relative to residents.",
    };
  }

  if (r <= 0.8) {
    return {
      tone: "blue",
      label: "Strongly lower-than-expected",
      text: "Strongly lower-than-expected burden relative to population share.",
      note: "This suggests lower systemic exposure pressure than expected.",
    };
  }

  if (r <= 0.95) {
    return {
      tone: "blue",
      label: "Slightly lower-than-expected",
      text: "Slightly lower-than-expected systemic burden.",
      note: "Exposure share is a little lower than population share.",
    };
  }

  return {
    tone: "neutral",
    label: "Roughly proportional",
    text: "Roughly proportional: exposure share closely matches population share.",
    note: "Any rank shift here is driven more by absolute exposure than disproportionality.",
  };
}

/* ---------------- shift driver ---------------- */

function getShiftDriver(burdenRatio, absJump) {
  const r = safeNum(burdenRatio);
  const j = safeNum(absJump);

  if (r == null || j == null) {
    return {
      tone: "neutral",
      label: "Driver unknown",
      hint: "Not enough information to explain what drives the shift.",
    };
  }

  const nearOne = Math.abs(r - 1) <= 0.05;
  const bigShift = j >= 6;

  if (bigShift && r >= 1.15) {
    return {
      tone: "red",
      label: "Compounded risk",
      hint: "Large re-ranking plus disproportionate burden: both ordering and inequity change in the burden view.",
    };
  }

  if (bigShift && nearOne) {
    return {
      tone: "blue",
      label: "Density-driven shift",
      hint: "Shift is driven less by disproportionality and more by how many people live with the exposure.",
    };
  }

  if (r >= 1.05) {
    return {
      tone: "red",
      label: "Inequality-driven",
      hint: "Burden share exceeds population share, supporting an inequality reading in the burden view.",
    };
  }

  if (r <= 0.95) {
    return {
      tone: "blue",
      label: "Lower-than-expected",
      hint: "Burden share is lower than population share; this tends to soften the inequality reading.",
    };
  }

  return {
    tone: "neutral",
    label: "Mixed / proportional",
    hint: "Shares are close: any shift is likely driven by absolute exposure rather than disproportionality.",
  };
}

/* ---------------- RankJump module ---------------- */

function RankJumpCard({ name, rawRank, weightedRank, rankJump, burdenRatio, isBurden }) {
  const rr = safeNum(rawRank);
  const wr = safeNum(weightedRank);
  const j = safeNum(rankJump);
  const absJ = j == null ? 0 : Math.abs(j);

  const severity = absJ >= 10 ? "high" : absJ >= 6 ? "med" : absJ >= 3 ? "low" : "none";
  const dir = j == null ? "unknown" : j > 0 ? "up" : j < 0 ? "down" : "same";

  const palette = {
    up: {
      accent: "#e53e3e",
      accentSoft: "rgba(229,62,62,0.10)",
      accentBorder: "rgba(229,62,62,0.22)",
      arrow: "↑",
      verb: "rises",
      story: `Visibility Penalty: when population is counted, ${name} rises ${absJ} places in the hierarchy of concern.`,
      meaning: "This shift suggests the conventional average can underrepresent lived exposure where many people are affected.",
    },
    down: {
      accent: "#2563eb",
      accentSoft: "rgba(37,99,235,0.10)",
      accentBorder: "rgba(37,99,235,0.22)",
      arrow: "↓",
      verb: "falls",
      story: `Visibility Bonus: when population is counted, ${name} falls ${absJ} places in the hierarchy of concern.`,
      meaning: "This suggests population weighting reduces prominence relative to borough averages.",
    },
    same: {
      accent: "rgba(15,23,42,0.75)",
      accentSoft: "rgba(15,23,42,0.06)",
      accentBorder: "rgba(15,23,42,0.12)",
      arrow: "→",
      verb: "stays",
      story: `Stability: ${name} stays in roughly the same position across both lenses.`,
      meaning: "This suggests the two measurements align for this borough.",
    },
    unknown: {
      accent: "rgba(15,23,42,0.75)",
      accentSoft: "rgba(15,23,42,0.06)",
      accentBorder: "rgba(15,23,42,0.12)",
      arrow: "·",
      verb: "shifts",
      story: "Rank shift unavailable.",
      meaning: "Not enough data to compute change.",
    },
  };

  const p = palette[dir] || palette.unknown;

  const driver = getShiftDriver(burdenRatio, absJ);

  const badge = {
    high: { text: "Notable shift", tone: "red" },
    med: { text: "Meaningful shift", tone: "red" },
    low: { text: "Small shift", tone: "neutral" },
    none: { text: "Stable", tone: "neutral" },
  }[severity];

  const storyText =
    rr == null || wr == null || j == null
      ? "This borough does not have complete ranking information."
      : `This borough shifts from #${rr} (raw) to #${wr} (burden).`;

  return (
    <Card style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Label>Rank jump</Label>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Pill tone={badge.tone}>{badge.text}</Pill>
          <Pill tone={driver.tone} title={driver.hint}>
            {driver.label}
          </Pill>
        </div>
      </div>

      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 12 }}>
        <div
          style={{
            border: `1px solid ${p.accentBorder}`,
            background: p.accentSoft,
            borderRadius: 16,
            padding: 14,
          }}
        >
          <div style={{ fontWeight: 950, color: p.accent, letterSpacing: "-0.2px" }}>{storyText}</div>
          <div style={{ marginTop: 8, fontSize: 13.2, color: "rgba(15,23,42,0.72)", lineHeight: 1.55 }}>
            <div style={{ fontWeight: 850, marginBottom: 4 }}>{p.story}</div>
            <div style={{ color: "rgba(15,23,42,0.60)" }}>{p.meaning}</div>
          </div>
        </div>

        <div
          style={{
            border: "1px solid rgba(15,23,42,0.10)",
            background: "rgba(255,255,255,0.70)",
            borderRadius: 16,
            padding: 14,
            display: "grid",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(15,23,42,0.45)" }}>
              Jump
            </div>
            <div style={{ fontSize: 12, fontWeight: 950, color: p.accent }}>
              {j == null ? "N/A" : `${p.arrow} ${absJ}`}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ border: "1px solid rgba(15,23,42,0.08)", borderRadius: 14, padding: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: "rgba(15,23,42,0.45)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Raw rank
              </div>
              <div style={{ marginTop: 6, fontWeight: 950, color: "rgba(15,23,42,0.90)" }}>
                {rr == null ? "N/A" : `#${rr}`}
              </div>
            </div>

            <div style={{ border: "1px solid rgba(15,23,42,0.08)", borderRadius: 14, padding: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: "rgba(15,23,42,0.45)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Burden rank
              </div>
              <div style={{ marginTop: 6, fontWeight: 950, color: "rgba(15,23,42,0.90)" }}>
                {wr == null ? "N/A" : `#${wr}`}
              </div>
            </div>
          </div>

          <div style={{ fontSize: 12.2, color: "rgba(15,23,42,0.58)", lineHeight: 1.45 }}>
            {isBurden ? (
              <>
                <strong style={{ color: "rgba(15,23,42,0.78)" }}>Interpretation:</strong> {driver.hint}
              </>
            ) : (
              <>
                <strong style={{ color: "rgba(15,23,42,0.78)" }}>Tip:</strong> switch to{" "}
                <strong>The Lived Burden</strong> to reveal re-ranking.
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ---------------- ShareComparison module ---------------- */

function ShareComparisonCard({ burdenShare, popShare, burdenRatio, isBurden, rankJump }) {
  const b = safeNum(burdenShare);
  const p = safeNum(popShare);
  const r = safeNum(burdenRatio);

  const gap = b == null || p == null ? null : b - p;

  const absJ = safeNum(rankJump) == null ? null : Math.abs(safeNum(rankJump));

  const tone = r == null ? "neutral" : r >= 1.05 ? "red" : r <= 0.95 ? "blue" : "neutral";

  const barMax = 0.18; // visual scaling only (values remain accurate)
  const bW = b == null ? 0 : clamp(b / barMax, 0, 1);
  const pW = p == null ? 0 : clamp(p / barMax, 0, 1);

  const ratioText = r == null ? "N/A" : `${r.toFixed(2)}×`;

  const headline =
    !isBurden
      ? "Exposure vs population"
      : "Exposure vs population (share comparison)";

  const note =
    !isBurden
      ? "Switch to the burden view to compare exposure share with population share."
      : "Bars are visually scaled for readability (values shown are accurate).";

  const interpretation =
    r == null
      ? "No ratio available."
      : r >= 1.05
      ? "Interpretation: Exposure share exceeds population share (disproportionate)."
      : r <= 0.95
      ? "Interpretation: Exposure share is lower than population share."
      : "Interpretation: Roughly proportional: exposure share closely matches population share.";

  const shiftLine =
    isBurden && absJ != null
      ? absJ >= 6
        ? "Any rank shift here is likely driven by population concentration and absolute exposure."
        : "Rank shift is modest; shares help explain whether inequality is present."
      : null;

  return (
    <Card style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Label>{headline}</Label>
        <Pill tone={tone}>Share comparison</Pill>
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ fontSize: 12.5, color: "rgba(15,23,42,0.72)", fontWeight: 850 }}>Pollution burden share</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                height: 10,
                borderRadius: 999,
                background: "rgba(229,62,62,0.55)",
                width: `${bW * 100}%`,
                minWidth: 10,
              }}
            />
            <div style={{ fontSize: 12.5, fontWeight: 900, color: "rgba(15,23,42,0.78)" }}>
              {pct01(b, 1)}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ fontSize: 12.5, color: "rgba(15,23,42,0.72)", fontWeight: 850 }}>Population share</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                height: 10,
                borderRadius: 999,
                background: "rgba(37,99,235,0.55)",
                width: `${pW * 100}%`,
                minWidth: 10,
              }}
            />
            <div style={{ fontSize: 12.5, fontWeight: 900, color: "rgba(15,23,42,0.78)" }}>
              {pct01(p, 2)}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
          <Pill tone="neutral">Ratio {ratioText}</Pill>
          <Pill tone="neutral">
            Gap: {gap == null ? "N/A" : `${(gap * 100).toFixed(1)}pp`} (burden share − population share)
          </Pill>
        </div>

        <div style={{ marginTop: 6, fontSize: 12.6, color: "rgba(15,23,42,0.62)", lineHeight: 1.55 }}>
          {note}
          <div style={{ marginTop: 6 }}>{interpretation}</div>
          {shiftLine && <div style={{ marginTop: 6 }}>{shiftLine}</div>}
        </div>
      </div>
    </Card>
  );
}

/* ---------------- StatCard ---------------- */

function StatCard({ label, value, sub, tone = "neutral" }) {
  const palette =
    {
      neutral: { border: "rgba(15,23,42,0.10)", bg: "rgba(255,255,255,0.80)", text: "rgba(15,23,42,0.88)" },
      red: { border: "rgba(229,62,62,0.22)", bg: "rgba(229,62,62,0.08)", text: "#991b1b" },
      blue: { border: "rgba(37,99,235,0.22)", bg: "rgba(37,99,235,0.08)", text: "#1e40af" },
    }[tone] || { border: "rgba(15,23,42,0.10)", bg: "rgba(255,255,255,0.80)", text: "rgba(15,23,42,0.88)" };

  return (
    <div
      style={{
        borderRadius: 16,
        border: `1px solid ${palette.border}`,
        background: palette.bg,
        padding: 14,
      }}
    >
      <Label>{label}</Label>
      <div style={{ marginTop: 8, fontSize: 18, fontWeight: 950, color: palette.text }}>{value}</div>
      <div style={{ marginTop: 6, fontSize: 12.2, color: "rgba(15,23,42,0.58)", lineHeight: 1.45 }}>{sub}</div>
    </div>
  );
}

/* ---------------- main component ---------------- */

export default function DetailPanel({ selectedFeature, onClose, mode = "raw" }) {
  if (!selectedFeature) return null;

  const isBurden = mode !== "raw";

  const p = selectedFeature.properties || {};
  const name = p.LAD22NM || "Borough";

  const rawRank = safeNum(p.rawRank ?? p.RawRank ?? p.raw_rank);
  const weightedRank = safeNum(p.weightedRank ?? p.WeightedRank ?? p.weighted_rank);
  const rankJump = safeNum(p.rankJump ?? p.RankJump ?? p.rank_jump);

  const burdenRatio = safeNum(p.burdenRatio ?? p.BurdenRatio ?? p.burden_ratio);
  const interp = interpretBurden(burdenRatio);

  const pop = safeNum(p.Population ?? p.population ?? p.pop);

  const burdenShare = safeNum(p.burdenShare ?? p.burden_share);
  const popShare = safeNum(p.populationShare ?? p.popShare ?? p.population_share);

  const narrative = !isBurden
    ? {
        title: "The Statistical Average",
        body:
          rawRank == null
            ? "This view shows borough mean NO₂. Switch to The Lived Burden to see how the city is reordered when people are counted."
            : `This borough ranks #${rawRank} by average concentration. Switch to The Lived Burden to reveal how counting people can reorder the city.`,
        pillTone: "blue",
        pillText: "The Statistical Average",
      }
    : {
        title: "The Lived Burden",
        body:
          rawRank == null || weightedRank == null
            ? "This view re-ranks boroughs using population exposure."
            : `This borough shifts from #${rawRank} (raw) to #${weightedRank} (burden) — a choice that changes what becomes visible.`,
        pillTone: "red",
        pillText: "The Lived Burden",
      };

  const showJumpMoment = isBurden && rankJump != null && Math.abs(rankJump) >= 5;

  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        minHeight: 0,
        padding: 22,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        background: "linear-gradient(180deg, rgba(248,250,252,0.98), rgba(255,255,255,0.92))",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <H2>{name}</H2>
          <Muted style={{ marginTop: 6, fontSize: 12.5, lineHeight: 1.55 }}>Borough exposure & burden profile</Muted>
        </div>

        <button
          onClick={onClose}
          aria-label="Close details panel"
          title="Close"
          style={{
            border: "1px solid rgba(15,23,42,0.10)",
            background: "rgba(255,255,255,0.80)",
            borderRadius: 14,
            width: 36,
            height: 36,
            cursor: "pointer",
            fontWeight: 950,
            color: "rgba(15,23,42,0.75)",
            boxShadow: "0 10px 22px rgba(0,0,0,0.06)",
          }}
        >
          ✕
        </button>
      </div>

      {showJumpMoment && (
        <div
          style={{
            borderRadius: 16,
            border: "1px solid rgba(251,191,36,0.55)",
            background: "rgba(254,243,199,0.65)",
            padding: "12px 14px",
            boxShadow: "0 10px 22px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ fontWeight: 950, color: "rgba(15,23,42,0.92)", letterSpacing: "-0.2px" }}>
            Look what just happened.
          </div>
          <div style={{ marginTop: 4, fontSize: 12.8, color: "rgba(15,23,42,0.72)", lineHeight: 1.55 }}>
            This borough moves <strong>{Math.abs(rankJump)}</strong> places when exposure is population-weighted.
          </div>
        </div>
      )}

      <Card style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <Label>{narrative.title}</Label>
          <Pill tone={narrative.pillTone}>{narrative.pillText}</Pill>
        </div>
        <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.65, color: "rgba(15,23,42,0.72)" }}>
          {narrative.body}
        </div>
      </Card>

      <RankJumpCard
        name={name}
        rawRank={rawRank}
        weightedRank={weightedRank}
        rankJump={rankJump}
        burdenRatio={burdenRatio}
        isBurden={isBurden}
      />

      <ShareComparisonCard
        burdenShare={burdenShare}
        popShare={popShare}
        burdenRatio={burdenRatio}
        isBurden={isBurden}
        rankJump={rankJump}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <StatCard
          label="Burden ratio"
          value={burdenRatio == null ? "N/A" : `${burdenRatio.toFixed(2)}×`}
          sub={`Interpretation: ${interp.label}`}
          tone={interp.tone}
        />
        <StatCard label="Population" value={kFmt(pop)} sub="Approx. residents (k)." tone="neutral" />
      </div>

      <Card style={{ padding: 16 }}>
        <Label>Interpretive note</Label>
        <div style={{ marginTop: 10, fontSize: 13.5, lineHeight: 1.65, color: "rgba(15,23,42,0.72)" }}>
          <strong style={{ color: "rgba(15,23,42,0.92)" }}>{interp.text}</strong>
          <div style={{ marginTop: 8, color: "rgba(15,23,42,0.58)" }}>
            Borough averages can hide highly localised exposure near major roads and transport corridors. This is a
            borough-level lens — a prompt for deeper, finer-grained inquiry.
          </div>
        </div>
      </Card>

      {/* ✅ Ethical hint（短句即可，不写 essay） */}
      <div style={{ fontSize: 12.2, color: "rgba(15,23,42,0.55)", lineHeight: 1.5 }}>
        Averages may obscure lived exposure.
      </div>

      <div style={{ height: 6 }} />
    </div>
  );
}