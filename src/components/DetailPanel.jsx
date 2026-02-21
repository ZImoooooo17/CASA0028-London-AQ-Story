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

/* ---------------- interpretation rules (single source of truth) ---------------- */

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

  // 0.95–1.05
  return {
    tone: "neutral",
    label: "Roughly proportional",
    text: "Roughly proportional: exposure share closely matches population share.",
    note: "Any rank shift here is driven more by absolute exposure than disproportionality.",
  };
}

/* ---------------- shift driver (ties RankJump + Ratio together) ---------------- */

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

  const nearOne = Math.abs(r - 1) <= 0.05; // ≈ proportional
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
      verb: "jumps up",
      story: `Re-ranked upward: ${name} becomes more concerning when population exposure is considered.`,
      meaning:
        "Population weighting increases prominence — averages may understate pressure where more people are exposed.",
    },
    down: {
      accent: "#2563eb",
      accentSoft: "rgba(37,99,235,0.10)",
      accentBorder: "rgba(37,99,235,0.22)",
      arrow: "↓",
      verb: "drops",
      story: `Re-ranked downward: ${name} looks less severe once exposure is weighted by population.`,
      meaning:
        "Population weighting reduces prominence — high concentration may affect fewer residents overall.",
    },
    same: {
      accent: "rgba(15,23,42,0.60)",
      accentSoft: "rgba(15,23,42,0.06)",
      accentBorder: "rgba(15,23,42,0.12)",
      arrow: "→",
      verb: "stays",
      story: `Stable rank: ${name} tells a consistent story in both metrics.`,
      meaning: "This borough’s position is relatively stable across metrics.",
    },
    unknown: {
      accent: "rgba(15,23,42,0.60)",
      accentSoft: "rgba(15,23,42,0.06)",
      accentBorder: "rgba(15,23,42,0.12)",
      arrow: "→",
      verb: "changes",
      story: `Rank shift could not be computed for ${name}.`,
      meaning: "Rank fields are unavailable.",
    },
  }[dir];

  const headline =
    dir === "unknown"
      ? "Rank shift unavailable"
      : dir === "same"
      ? "No re-ranking"
      : `${palette.verb} by ${absJ} places`;

  const pulse = severity === "high" ? "pulseStrong" : severity === "med" ? "pulse" : "";
  const tag = absJ >= 3 ? "Re-ranked" : absJ > 0 ? "Shift" : "Stable";

  const driver = getShiftDriver(burdenRatio, absJ);

  const maxShown = 33;
  const rawPos = rr == null ? 0.5 : clamp(rr / maxShown, 0, 1);
  const weightedPos = wr == null ? 0.5 : clamp(wr / maxShown, 0, 1);

  return (
    <Card
      style={{
        padding: 0,
        border: `1px solid ${palette.accentBorder}`,
        background: "transparent",
        position: "relative",
        overflow: "visible",
        minHeight: 220,
      }}
    >
      <div
        style={{
          borderRadius: 18,
          overflow: "hidden",
          background: "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,0.88))",
          position: "relative",
          padding: 18,
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: -2,
            background: `radial-gradient(800px 220px at 20% 0%, ${palette.accentSoft}, rgba(255,255,255,0))`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <Label>Rank jump</Label>
              <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <div style={{ fontSize: 16, fontWeight: 950, letterSpacing: "-0.3px" }}>{headline}</div>

                <Pill tone={dir === "up" ? "red" : dir === "down" ? "blue" : "neutral"}>
                  <span style={{ fontSize: 14 }}>{palette.arrow}</span>
                  <span>{tag}</span>
                </Pill>

                {absJ >= 6 && dir !== "same" && (
                  <Pill
                    tone={dir === "up" ? "red" : "blue"}
                    title="Large shifts indicate the city’s ordering changes under different metrics."
                  >
                    {absJ >= 10 ? "Major shift" : "Notable shift"}
                  </Pill>
                )}

                {isBurden && dir !== "unknown" && (
                  <Pill tone={driver.tone} title={driver.hint}>
                    {driver.label}
                  </Pill>
                )}
              </div>
            </div>

            <div
              className={pulse}
              style={{
                minWidth: 78,
                textAlign: "center",
                padding: "10px 12px",
                borderRadius: 16,
                border: `1px solid ${palette.accentBorder}`,
                background: "rgba(255,255,255,0.72)",
                boxShadow: "0 12px 25px rgba(0,0,0,0.08)",
              }}
              title="rankJump = rawRank − weightedRank (positive means it looks worse in the burden view)"
            >
              <div style={{ fontSize: 11, fontWeight: 900, color: "rgba(15,23,42,0.45)" }}>JUMP</div>
              <div style={{ fontSize: 26, fontWeight: 950, color: palette.accent, letterSpacing: "-0.6px" }}>
                {j == null ? "—" : j > 0 ? `+${absJ}` : j < 0 ? `-${absJ}` : "0"}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                border: "1px solid rgba(15,23,42,0.10)",
                background: "rgba(15,23,42,0.04)",
              }}
            >
              <Label style={{ color: "rgba(37,99,235,0.85)" }}>Raw rank</Label>
              <div style={{ fontSize: 30, fontWeight: 950, letterSpacing: "-0.8px" }}>
                {rr == null ? "N/A" : `#${rr}`}
              </div>
            </div>

            <div
              style={{
                padding: 14,
                borderRadius: 16,
                border: "1px solid rgba(15,23,42,0.10)",
                background: "rgba(15,23,42,0.04)",
              }}
            >
              <Label style={{ color: "rgba(229,62,62,0.90)" }}>Burden rank</Label>
              <div style={{ fontSize: 30, fontWeight: 950, letterSpacing: "-0.8px", color: palette.accent }}>
                {wr == null ? "N/A" : `#${wr}`}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(15,23,42,0.45)" }}>
              <span>Top</span>
              <span>Bottom</span>
            </div>

            <div style={{ marginTop: 8, height: 12, borderRadius: 999, background: "rgba(15,23,42,0.06)", position: "relative", overflow: "hidden" }}>
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
                  opacity: 0.55,
                }}
              />
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
                  boxShadow: "0 10px 18px rgba(0,0,0,0.18)",
                }}
              />
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
                  boxShadow: "0 10px 18px rgba(0,0,0,0.18)",
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: 12, fontSize: 13.5, lineHeight: 1.6, color: "rgba(15,23,42,0.70)" }}>
            <strong style={{ color: "rgba(15,23,42,0.92)" }}>{palette.story}</strong>
            <div style={{ marginTop: 6, opacity: 0.95 }}>{palette.meaning}</div>

            {isBurden && dir !== "unknown" && (
              <div style={{ marginTop: 8, color: "rgba(15,23,42,0.60)" }}>
                <strong style={{ color: "rgba(15,23,42,0.82)" }}>Why this shift?</strong> {driver.hint}
              </div>
            )}
          </div>

          <style>{`
            @keyframes pulseGlow {
              0% { box-shadow: 0 12px 25px rgba(0,0,0,0.08); }
              50% { box-shadow: 0 18px 40px rgba(0,0,0,0.12); }
              100% { box-shadow: 0 12px 25px rgba(0,0,0,0.08); }
            }
            @keyframes pulseGlowStrong {
              0% { box-shadow: 0 12px 25px rgba(0,0,0,0.08); }
              50% { box-shadow: 0 22px 52px rgba(0,0,0,0.16); }
              100% { box-shadow: 0 12px 25px rgba(0,0,0,0.08); }
            }
            .pulse { animation: pulseGlow 1.8s ease-in-out infinite; }
            .pulseStrong { animation: pulseGlowStrong 1.6s ease-in-out infinite; }
            @media (prefers-reduced-motion: reduce) {
              .pulse, .pulseStrong { animation: none !important; }
            }
          `}</style>
        </div>
      </div>
    </Card>
  );
}

/* ---------------- Share card ---------------- */

function ShareComparisonCard({ burdenShare, popShare, burdenRatio, isBurden, rankJump }) {
  const b = safeNum(burdenShare);
  const p = safeNum(popShare);
  const r = safeNum(burdenRatio);
  const interp = interpretBurden(r);

  const gap = b != null && p != null ? b - p : null;
  const gapPP = gap == null ? "N/A" : `${gap >= 0 ? "+" : ""}${(gap * 100).toFixed(1)}pp`;

  const scale = 3;
  const bW = b == null ? 0 : clamp(b * scale, 0, 1);
  const pW = p == null ? 0 : clamp(p * scale, 0, 1);

  const ratioText = r == null ? "N/A" : r.toFixed(2);

  const absJ = safeNum(rankJump) == null ? null : Math.abs(safeNum(rankJump));
  const driver = getShiftDriver(r, absJ);

  const modeHint = !isBurden
    ? "Tip: switch to Population Burden to compare exposure share vs population share (and interpret inequity using the ratio)."
    : driver.label === "Density-driven shift"
    ? "You’re viewing Population Burden: shares are close, so rank shifts are often density/absolute-exposure driven."
    : driver.label === "Compounded risk"
    ? "You’re viewing Population Burden: re-ranking and disproportionate burden reinforce each other here."
    : driver.tone === "red"
    ? "You’re viewing Population Burden: the ratio supports an inequality reading (burden share exceeds population share)."
    : driver.tone === "blue"
    ? "You’re viewing Population Burden: burden share is lower than population share, softening the inequality reading."
    : "You’re viewing Population Burden: shares + ratio help explain what the average view can hide.";

  return (
    <Card style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <Label>Exposure vs population</Label>
          <div style={{ marginTop: 6, fontSize: 18, fontWeight: 950, letterSpacing: "-0.4px" }}>Share comparison</div>
        </div>

        <Pill tone={interp.tone} style={{ fontSize: 13, padding: "8px 12px" }}>
          {ratioText}×
        </Pill>
      </div>

      <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 64px", gap: 10, alignItems: "center" }}>
          <div style={{ fontWeight: 900, color: "rgba(15,23,42,0.82)" }}>Pollution burden share</div>
          <div style={{ height: 10, borderRadius: 999, background: "rgba(15,23,42,0.06)", overflow: "hidden" }}>
            <div style={{ width: `${bW * 100}%`, height: "100%", background: "#e53e3e" }} />
          </div>
          <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: "rgba(15,23,42,0.70)" }}>
            {pct01(b)}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 64px", gap: 10, alignItems: "center" }}>
          <div style={{ fontWeight: 900, color: "rgba(15,23,42,0.82)" }}>Population share</div>
          <div style={{ height: 10, borderRadius: 999, background: "rgba(15,23,42,0.06)", overflow: "hidden" }}>
            <div style={{ width: `${pW * 100}%`, height: "100%", background: "#2563eb" }} />
          </div>
          <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: "rgba(15,23,42,0.70)" }}>
            {pct01(p)}
          </div>
        </div>

        <Muted style={{ fontSize: 12.8 }}>
          <strong style={{ color: "rgba(15,23,42,0.88)" }}>Gap:</strong> {gapPP}{" "}
          <span style={{ opacity: 0.85 }}>(burden share − population share)</span>
        </Muted>

        <Muted style={{ fontSize: 11.5 }}>Bars are visually scaled for readability (values shown are accurate).</Muted>

        <div style={{ marginTop: 2, fontSize: 13.5, color: "rgba(15,23,42,0.72)", lineHeight: 1.6 }}>
          <strong style={{ color: "rgba(15,23,42,0.92)" }}>Interpretation:</strong> {interp.text}
          <div style={{ marginTop: 6, opacity: 0.9 }}>{interp.note}</div>
          <div style={{ marginTop: 6, opacity: 0.85 }}>{modeHint}</div>
        </div>
      </div>
    </Card>
  );
}

/* ---------------- Stat cards ---------------- */

function StatCard({ label, value, sub, tone = "neutral" }) {
  const palette =
    {
      neutral: { bg: "rgba(15,23,42,0.04)", border: "rgba(15,23,42,0.10)", accent: "rgba(15,23,42,0.92)" },
      red: { bg: "rgba(229,62,62,0.08)", border: "rgba(229,62,62,0.18)", accent: "#b91c1c" },
      blue: { bg: "rgba(37,99,235,0.08)", border: "rgba(37,99,235,0.18)", accent: "#1e40af" },
    }[tone] || { bg: "rgba(15,23,42,0.04)", border: "rgba(15,23,42,0.10)", accent: "rgba(15,23,42,0.92)" };

  return (
    <div style={{ padding: 16, borderRadius: 16, border: `1px solid ${palette.border}`, background: palette.bg }}>
      <Label>{label}</Label>
      <div style={{ marginTop: 8, fontSize: 28, fontWeight: 950, letterSpacing: "-0.8px", color: palette.accent }}>
        {value}
      </div>
      {sub && <Muted style={{ marginTop: 6, fontSize: 12.5, lineHeight: 1.5 }}>{sub}</Muted>}
    </div>
  );
}

/* ---------------- Main DetailPanel ---------------- */

export default function DetailPanel({ selectedFeature, onClose, mode = "raw" }) {
  if (!selectedFeature) return null;

  const isBurden = mode !== "raw"; // ✅ 不依赖具体字符串

  const p = selectedFeature.properties || {};
  const name = p.LAD22NM || "Borough";

  // ✅ ranks: allow multiple naming just in case
  const rawRank = safeNum(p.rawRank ?? p.RawRank ?? p.raw_rank);
  const weightedRank = safeNum(p.weightedRank ?? p.WeightedRank ?? p.weighted_rank);
  const rankJump = safeNum(p.rankJump ?? p.RankJump ?? p.rank_jump);

  // ✅ ratio + shares: allow multiple naming
  const burdenRatio = safeNum(p.burdenRatio ?? p.BurdenRatio ?? p.burden_ratio);
  const interp = interpretBurden(burdenRatio);

  const pop = safeNum(p.Population ?? p.population ?? p.pop);

  // 🔥 你原来这里写的是 p.popShare，容易导致 N/A
  const burdenShare = safeNum(p.burdenShare ?? p.burden_share);
  const popShare = safeNum(p.populationShare ?? p.popShare ?? p.population_share);

  const narrative = !isBurden
    ? {
        title: "Raw view",
        body:
          rawRank == null
            ? "This view shows borough average concentration. Switch to Population Burden to see how the city is reordered."
            : `This borough ranks #${rawRank} by average concentration. Switch to Population Burden to reveal how weighting exposure can reorder the city.`,
        pillTone: "blue",
        pillText: "Raw NO₂",
      }
    : {
        title: "Population burden view",
        body:
          rawRank == null || weightedRank == null
            ? "This view re-ranks boroughs using population exposure."
            : `This borough shifts from #${rawRank} (raw) to #${weightedRank} (burden) — a choice that changes what becomes visible.`,
        pillTone: "red",
        pillText: "Population Burden",
      };

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
      {/* header */}
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

      {/* narrative */}
      <Card style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <Label>{narrative.title}</Label>
          <Pill tone={narrative.pillTone}>{narrative.pillText}</Pill>
        </div>
        <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.65, color: "rgba(15,23,42,0.72)" }}>
          {narrative.body}
        </div>
      </Card>

      {/* rank jump */}
      <RankJumpCard
        name={name}
        rawRank={rawRank}
        weightedRank={weightedRank}
        rankJump={rankJump}
        burdenRatio={burdenRatio}
        isBurden={isBurden}
      />

      {/* shares */}
      <ShareComparisonCard
        burdenShare={burdenShare}
        popShare={popShare}
        burdenRatio={burdenRatio}
        isBurden={isBurden}
        rankJump={rankJump}
      />

      {/* stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <StatCard
          label="Burden ratio"
          value={burdenRatio == null ? "N/A" : `${burdenRatio.toFixed(2)}×`}
          sub={`Interpretation: ${interp.label}`}
          tone={interp.tone}
        />
        <StatCard label="Population" value={kFmt(pop)} sub="Approx. residents (k)." tone="neutral" />
      </div>

      {/* interpretive note */}
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

      <div style={{ height: 6 }} />
    </div>
  );
}