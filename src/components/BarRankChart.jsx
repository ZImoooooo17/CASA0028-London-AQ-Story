import React, { useMemo, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

function num(x, fallback = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

function fmtPct01(x, digits = 1) {
  const n = Number(x);
  if (!Number.isFinite(n)) return null;
  return `${(n * 100).toFixed(digits)}%`;
}

export default function BarRankChart({
  data,
  mode,
  selectedId,
  onSelect,
  onHover,
}) {
  const itemRefs = useRef({});
  const [delayedMode, setDelayedMode] = useState(mode);
  const [showNote, setShowNote] = useState(false);

  // 地图先变，列表稍后排序
  useEffect(() => {
    const t = setTimeout(() => {
      setDelayedMode(mode);
    }, 150);
    return () => clearTimeout(t);
  }, [mode]);

  // 排序提示
  useEffect(() => {
    if (mode === "weighted") {
      setShowNote(true);
      const t = setTimeout(() => setShowNote(false), 1200);
      return () => clearTimeout(t);
    }
  }, [mode]);

  const list = useMemo(() => {
    if (!data?.features?.length) return [];

    if (delayedMode === "weighted") {
      const maxExp = Math.max(
        ...data.features.map((f) =>
          num(f.properties?.exposureIndex)
        )
      );

      return [...data.features]
        .sort(
          (a, b) =>
            num(b.properties?.totalExposure) -
            num(a.properties?.totalExposure)
        )
        .map((f) => {
          const idx = num(f.properties?.exposureIndex);
          const bShare = f.properties?.burdenShare;
          const shareText = fmtPct01(bShare, 1);

          return {
            id: f.id,
            name: f.properties?.LAD22NM || "Borough",
            displayPrimary: `${idx.toFixed(0)}%`,
            displaySecondary: shareText
              ? `${shareText} share`
              : null,
            barWidthPct: `${(idx / maxExp) * 100}%`,
            isHigh: idx >= 120,
            rankJump: num(f.properties?.rankJump),
          };
        });
    }

    const maxNO2 = Math.max(
      ...data.features.map((f) =>
        num(f.properties?.NO2)
      )
    );

    return [...data.features]
      .sort(
        (a, b) =>
          num(b.properties?.NO2) -
          num(a.properties?.NO2)
      )
      .map((f) => {
        const v = num(f.properties?.NO2);
        return {
          id: f.id,
          name: f.properties?.LAD22NM || "Borough",
          displayPrimary: `${v.toFixed(1)} µg/m³`,
          displaySecondary: null,
          barWidthPct: `${(v / maxNO2) * 100}%`,
          isHigh: v >= 30,
          rankJump: num(f.properties?.rankJump),
        };
      });
  }, [data, delayedMode]);

  useEffect(() => {
    if (selectedId && itemRefs.current[selectedId]) {
      itemRefs.current[selectedId].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedId]);

  const title =
    mode === "raw"
      ? "Ranking by NO₂ Concentration"
      : "Ranking by Total Exposure";

  const subtitle =
    mode === "raw"
      ? "Borough mean concentration (µg/m³)."
      : "Population burden ordering: NO₂ × population (Exposure Index shown; Avg = 100%).";

  return (
    <div
      style={{
        padding: 15,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "white",
          padding: "10px 0 12px",
          zIndex: 10,
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        <h3
          style={{
            fontSize: 11,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: 1,
            margin: 0,
            fontWeight: 900,
          }}
        >
          {title}
        </h3>

        <div
          style={{
            marginTop: 6,
            fontSize: 11.5,
            color: "#94a3b8",
            lineHeight: 1.35,
          }}
        >
          {subtitle}
        </div>

        {showNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              fontSize: 10,
              marginTop: 6,
              color: "#64748b",
            }}
          >
            Ranking reordered under population weighting.
          </motion.div>
        )}
      </div>

      {/* LIST */}
      <div style={{ flex: 1, paddingTop: 10 }}>
        <motion.div layout>
          {list.map((item, index) => {
            const isSelected =
              item.id === selectedId;

            const largeShift =
              mode === "weighted" &&
              Math.abs(item.rankJump) >= 10;

            return (
              <motion.div
                key={item.id}
                layout
                transition={{
                  layout: {
                    duration: 0.9,
                    ease: [0.22, 1, 0.36, 1],
                  },
                  opacity: { duration: 0.4 },
                }}
                ref={(el) =>
                  (itemRefs.current[item.id] = el)
                }
                onClick={() =>
                  onSelect?.(item.id)
                }
                onMouseEnter={() =>
                  onHover?.(item.id)
                }
                onMouseLeave={() =>
                  onHover?.(null)
                }
                style={{
                  position: "relative",
                  padding: "10px 12px",
                  marginBottom: 6,
                  cursor: "pointer",
                  borderRadius: 10,
                  background: isSelected
                    ? "rgba(30,64,175,0.08)"
                    : largeShift
                    ? "rgba(220,38,38,0.05)"
                    : "transparent",
                  border: isSelected
                    ? "1px solid rgba(30,64,175,0.25)"
                    : "1px solid transparent",
                  transition: "all 0.35s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: isSelected
                        ? 800
                        : 500,
                      color: isSelected
                        ? "#1e40af"
                        : "#334155",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: "#94a3b8",
                        marginRight: 6,
                      }}
                    >
                      #{index + 1}
                    </span>
                    {item.name}
                  </span>

                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: item.isHigh
                        ? "#ef4444"
                        : "#64748b",
                    }}
                  >
                    {mode === "weighted" &&
                    item.displaySecondary
                      ? `${item.displayPrimary} · ${item.displaySecondary}`
                      : item.displayPrimary}
                  </span>
                </div>

                <div
                  style={{
                    height: 5,
                    background: "#f1f5f9",
                    borderRadius: 3,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width:
                        item.barWidthPct,
                      background: isSelected
                        ? "#1e40af"
                        : item.isHigh
                        ? "#ef4444"
                        : "#94a3b8",
                      transition:
                        "width 0.7s cubic-bezier(0.22,1,0.36,1)",
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}