import { useRef, useState } from "react";
import MapView from "./components/MapView";
import BarRankChart from "./components/BarRankChart";
import DetailPanel from "./components/DetailPanel";
import useLondonData from "./hooks/useLondonData";

/**
 * Intro Modal - 叙事钩子与视觉引导
 */
function IntroModal({ onStart, onSelectCase }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.9)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          maxWidth: 600,
          background: "white",
          padding: 40,
          borderRadius: 28,
          textAlign: "center",
          animation: "modalFadeIn 0.6s ease-out",
        }}
      >
        <h1 style={{ margin: "0 0 10px 0", fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>
          London's Hidden <span style={{ color: "#e53e3e" }}>Inequity</span>
        </h1>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", margin: "20px 0" }}>
          <div style={{ padding: 10, background: "#f1f5f9", borderRadius: 12, flex: 1 }}>
            <div
              style={{
                height: 40,
                background: "linear-gradient(90deg, #bfdbfe, #1e3a8a)",
                borderRadius: 4,
                marginBottom: 8,
              }}
            />
            <div style={{ fontSize: 10, fontWeight: "bold" }}>RAW CONCENTRATION</div>
          </div>

          <div style={{ fontSize: 24, alignSelf: "center" }}>→</div>

          <div style={{ padding: 10, background: "#fef2f2", borderRadius: 12, flex: 1 }}>
            <div
              style={{
                height: 40,
                background: "linear-gradient(90deg, #3182ce, #cbd5e0, #e53e3e)",
                borderRadius: 4,
                marginBottom: 8,
              }}
            />
            <div style={{ fontSize: 10, fontWeight: "bold", color: "#e53e3e" }}>
              SYSTEMIC BURDEN
            </div>
          </div>
        </div>

        <p style={{ color: "#4a5568", fontSize: 16, lineHeight: 1.6, marginBottom: 30 }}>
          Concentration levels only tell half the story. By re-ranking London, we expose where population
          density turns “average” air into a disproportionate health burden.
        </p>

        <div style={{ marginBottom: 35 }}>
          <div
            style={{
              fontSize: 11,
              color: "#94a3b8",
              marginBottom: 12,
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            Explore High-Impact Shifts:
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            {[
              { id: "E09000005", name: "Brent: The Silent Jump", color: "#e53e3e" },
              { id: "E09000019", name: "Islington: Dense Burden", color: "#e53e3e" },
              { id: "E09000030", name: "Waltham Forest: Re-Ranked", color: "#e53e3e" },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectCase(c.id)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 30,
                  border: `2px solid ${c.color}`,
                  background: "white",
                  color: c.color,
                  fontSize: 13,
                  cursor: "pointer",
                  fontWeight: 800,
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.background = c.color;
                  e.currentTarget.style.color = "white";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.color = c.color;
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onStart}
          style={{
            background: "#1a202c",
            color: "white",
            border: "none",
            padding: "16px 48px",
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Free Exploration
        </button>
      </div>

      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

/**
 * ✅ Header 下方 Narrative Intro（已存在 + 小幅增强：可折叠 Why）
 */
function NarrativeIntro({ mode, onReplayIntro }) {
  const isRaw = mode === "raw";
  const [openWhy, setOpenWhy] = useState(false);

  return (
    <section
      style={{
        background: "rgba(255,255,255,0.92)",
        borderBottom: "1px solid #e2e8f0",
        padding: "14px 30px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, justifyContent: "space-between" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, letterSpacing: "-0.4px", color: "#0f172a" }}>
                Average Air, Uneven Burdens
              </h2>

              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 800,
                  border: "1px solid",
                  borderColor: isRaw ? "rgba(37,99,235,0.25)" : "rgba(229,62,62,0.25)",
                  background: isRaw ? "rgba(37,99,235,0.08)" : "rgba(229,62,62,0.08)",
                  color: isRaw ? "#2563eb" : "#e53e3e",
                  whiteSpace: "nowrap",
                }}
              >
                Current view: {isRaw ? "Raw Concentration" : "Population Burden"}
              </span>

              <button
                onClick={() => setOpenWhy((v) => !v)}
                style={{
                  border: "1px solid #e2e8f0",
                  background: "white",
                  padding: "6px 10px",
                  borderRadius: 999,
                  cursor: "pointer",
                  fontWeight: 800,
                  fontSize: 12,
                  color: "#0f172a",
                }}
                title="Why does this matter?"
              >
                {openWhy ? "Hide why" : "Why?"}
              </button>
            </div>

            <p style={{ margin: "8px 0 0", color: "#475569", lineHeight: 1.55, fontSize: 13.5 }}>
              London’s air quality looks different depending on how it is measured. Switching between{" "}
              <strong>Raw NO₂</strong> and a <strong>population-weighted burden ratio</strong> shows how statistical
              framing can reorder borough rankings — revealing where “average” air hides disproportionate exposure.
            </p>

            {openWhy && (
              <div
                style={{
                  marginTop: 10,
                  padding: "10px 12px",
                  borderRadius: 14,
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  color: "#334155",
                  fontSize: 12.8,
                  lineHeight: 1.55,
                }}
              >
                <strong>Raw</strong> is an average concentration. <strong>Population Burden</strong> compares a
                borough’s <em>share of total exposure</em> with its <em>share of population</em>. That’s why the map
                can “reorder” — the same pollution level can imply very different impacts depending on how many
                people are exposed.
              </div>
            )}

            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <div
                style={{
                  padding: "6px 10px",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  fontSize: 12.5,
                  color: "#334155",
                }}
              >
                <strong>Try:</strong> switch to{" "}
                <span style={{ color: "#e53e3e", fontWeight: 800 }}>Population Burden</span>, then click a borough to
                compare <strong>rank change</strong> and <strong>burden ratio</strong>.
              </div>

              <div
                style={{
                  padding: "6px 10px",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  fontSize: 12.5,
                  color: "#334155",
                }}
              >
                <strong>Tip:</strong> hover the bar chart to locate the borough on the map.
              </div>
            </div>
          </div>

          <div style={{ flexShrink: 0 }}>
            <button
              onClick={onReplayIntro}
              style={{
                border: "1px solid #e2e8f0",
                background: "white",
                padding: "10px 12px",
                borderRadius: 12,
                cursor: "pointer",
                fontWeight: 800,
                fontSize: 12,
                color: "#0f172a",
              }}
              title="Replay intro"
            >
              Replay Intro
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * ✅ 可折叠 Legend（解释升级版）
 */
function LegendCard({ mode }) {
  const isRaw = mode === "raw";
  const [open, setOpen] = useState(true);

  const rawBands = [
    { label: "< 24", color: "#eff6ff" },
    { label: "24 – 28", color: "#bfdbfe" },
    { label: "28 – 32", color: "#60a5fa" },
    { label: "32 – 36", color: "#2563eb" },
    { label: "> 36", color: "#1e3a8a" },
  ];

  const burdenBands = [
    { label: "< 0.8", color: "#3182ce" },
    { label: "0.8 – 0.95", color: "#93c5fd" },
    { label: "0.95 – 1.05", color: "#cbd5e0" },
    { label: "1.05 – 1.2", color: "#fca5a5" },
    { label: "> 1.2", color: "#e53e3e" },
  ];

  const bands = isRaw ? rawBands : burdenBands;

  return (
    <div
      style={{
        position: "absolute",
        left: 16,
        bottom: 16,
        zIndex: 999,
        width: open ? 380 : 56,
        background: "rgba(255,255,255,0.94)",
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        padding: open ? 14 : 10,
        boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
        backdropFilter: "blur(8px)",
        transition: "width 200ms ease, padding 200ms ease",
        overflow: "hidden",
        pointerEvents: "auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: isRaw ? "#2563eb" : "#e53e3e",
            flexShrink: 0,
          }}
        />

        {open && (
          <div style={{ fontWeight: 900, letterSpacing: "-0.2px", flex: 1 }}>
            {isRaw ? "Raw NO₂ concentration (µg/m³)" : "Population burden (ratio)"}
          </div>
        )}

        <button
          onClick={() => setOpen((v) => !v)}
          title={open ? "Hide legend" : "Show legend"}
          aria-label={open ? "Hide legend" : "Show legend"}
          style={{
            marginLeft: "auto",
            border: "1px solid #e2e8f0",
            background: "white",
            borderRadius: 10,
            width: 34,
            height: 34,
            cursor: "pointer",
            fontWeight: 900,
            fontSize: 18,
            lineHeight: "32px",
          }}
        >
          {open ? "–" : "?"}
        </button>
      </div>

      {open && (
        <>
          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {bands.map((it) => (
              <div
                key={it.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 13,
                  color: "#334155",
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 6,
                    background: it.color,
                    border: "1px solid rgba(0,0,0,0.06)",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontWeight: 800 }}>{it.label}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12, fontSize: 12.5, color: "#475569", lineHeight: 1.5 }}>
            {isRaw ? (
              <>
                <strong>Raw NO₂</strong> shows borough-level average concentration (µg/m³).
                <div style={{ marginTop: 6, opacity: 0.9 }}>Higher values = worse average air.</div>
                <div style={{ marginTop: 6, opacity: 0.9 }}>
                  Tip: switch to <strong>Population Burden</strong> to see where population density amplifies risk.
                </div>
              </>
            ) : (
              <>
                <strong>Population Burden (ratio)</strong> compares a borough’s share of total exposure with its share
                of London’s population.
                <div style={{ marginTop: 6, opacity: 0.9 }}>
                  <strong>1.0</strong> = proportional (burden share matches population share)
                </div>
                <div style={{ marginTop: 6, opacity: 0.9 }}>
                  <strong>&gt; 1.0</strong> = disproportionate exposure • <strong>&lt; 1.0</strong> = lower-than-expected burden
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("raw"); // "raw" | "weighted"
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [showIntro, setShowIntro] = useState(true);

  // ✅ dramaturgy: toast
  const [showReorderToast, setShowReorderToast] = useState(false);

  const { data, error } = useLondonData();
  const mapRef = useRef(null);

  const flyToFeature = (id) => {
    const map = mapRef.current?.getMap?.();
    const feature = data?.features?.find((f) => f.id === id);
    if (!map || !feature) return;

    const scan = (coords) => {
      let minLng = Infinity,
        minLat = Infinity,
        maxLng = -Infinity,
        maxLat = -Infinity;

      const inner = (c) => {
        if (typeof c[0] === "number") {
          minLng = Math.min(minLng, c[0]);
          minLat = Math.min(minLat, c[1]);
          maxLng = Math.max(maxLng, c[0]);
          maxLat = Math.max(maxLat, c[1]);
        } else {
          c.forEach(inner);
        }
      };

      inner(coords);
      return [
        [minLng, minLat],
        [maxLng, maxLat],
      ];
    };

    map.fitBounds(scan(feature.geometry.coordinates), {
      padding: { right: 480, top: 50, bottom: 50, left: 50 },
      duration: 1200,
    });
  };

  const handleSelect = (id) => {
    setSelectedId(id);
    if (id && data) flyToFeature(id);
  };

  const handleCaseSelect = (id) => {
    setMode("weighted");
    setShowIntro(false);
    setTimeout(() => handleSelect(id), 600);
  };

  // ✅ Mode 切换 dramaturgy：toast + 自动聚焦最大 rankJump
  const triggerReorderDramaturgy = (nextMode) => {
    setShowReorderToast(true);
    window.setTimeout(() => setShowReorderToast(false), 1200);

    if (nextMode === "weighted" && data?.features?.length) {
      const best = data.features.reduce((prev, cur) => {
        const a = Math.abs(prev?.properties?.rankJump ?? 0);
        const b = Math.abs(cur?.properties?.rankJump ?? 0);
        return b > a ? cur : prev;
      }, data.features[0]);

      if (best?.id) {
        setTimeout(() => handleSelect(best.id), 450);
      }
    }
  };

  if (error) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        <h2 style={{ margin: 0 }}>Load Error</h2>
        <p style={{ color: "#475569" }}>Failed to load London dataset. Please check the data path or network.</p>
      </div>
    );
  }

  const isLoading = !data;

  return (
    <div style={{ display: "flex", height: "100vh", flexDirection: "column", background: "#f8f9fa" }}>
      {showIntro && <IntroModal onStart={() => setShowIntro(false)} onSelectCase={handleCaseSelect} />}

      {/* Header */}
      <header
        style={{
          height: 65,
          background: "#fff",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 30px",
          zIndex: 100,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, background: "#1a202c", borderRadius: 8 }} />
          <div>
            <h1 style={{ fontSize: 19, fontWeight: 900, letterSpacing: "-0.5px", margin: 0 }}>
              London Air <span style={{ color: "#2563eb" }}>Impact</span>
            </h1>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              Switch metrics to reveal hidden inequality
            </div>
          </div>
        </div>

        <div style={{ background: "#f1f5f9", padding: 4, borderRadius: 10, display: "flex" }}>
          <button
            onClick={() => {
              setMode("raw");
              triggerReorderDramaturgy("raw");
            }}
            style={{
              padding: "8px 20px",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              background: mode === "raw" ? "#fff" : "transparent",
              fontWeight: 700,
              color: mode === "raw" ? "#2563eb" : "#64748b",
            }}
          >
            Raw NO₂
          </button>
          <button
            onClick={() => {
              setMode("weighted");
              triggerReorderDramaturgy("weighted");
            }}
            style={{
              padding: "8px 20px",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              background: mode === "weighted" ? "#fff" : "transparent",
              fontWeight: 700,
              color: mode === "weighted" ? "#e53e3e" : "#64748b",
            }}
          >
            Population Burden
          </button>
        </div>
      </header>

      {/* ✅ Narrative Intro */}
      <NarrativeIntro mode={mode} onReplayIntro={() => setShowIntro(true)} />

      {/* ✅ Toast dramaturgy */}
      {showReorderToast && (
        <div
          style={{
            position: "fixed",
            top: 78,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(15,23,42,0.92)",
            color: "white",
            padding: "10px 14px",
            borderRadius: 14,
            fontSize: 13,
            fontWeight: 800,
            zIndex: 9999,
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            backdropFilter: "blur(10px)",
          }}
        >
          The city has been reordered.
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        <aside style={{ width: 380, background: "#fff", borderRight: "1px solid #e2e8f0", overflowY: "auto" }}>
          {isLoading ? (
            <div style={{ padding: 18, color: "#64748b" }}>Loading charts…</div>
          ) : (
            <BarRankChart
              data={data}
              mode={mode}
              selectedId={selectedId}
              onSelect={handleSelect}
              onHover={setHoveredId}
            />
          )}
        </aside>

        <main style={{ flex: 1, position: "relative" }}>
          {isLoading ? (
            <div style={{ padding: 18, color: "#64748b" }}>Loading map…</div>
          ) : (
            <>
              <MapView
                data={data}
                mode={mode}
                mapRef={mapRef}
                selectedId={selectedId}
                onSelectedId={handleSelect}
                hoveredId={hoveredId}
                onHoveredId={setHoveredId}
              />
              <LegendCard mode={mode} />
            </>
          )}
        </main>

        {selectedId && data && (
          <aside
            style={{
              width: 420,
              background: "#fff",
              borderLeft: "1px solid #e2e8f0",
              zIndex: 10,
              overflowY: "auto",
            }}
          >
            <DetailPanel
              selectedFeature={data.features.find((f) => f.id === selectedId)}
              mode={mode}
              onClose={() => setSelectedId(null)}
            />
          </aside>
        )}
      </div>

      {/* Footer reflection */}
      <footer
        style={{
          padding: "20px 30px",
          background: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
          fontSize: 12,
          color: "#64748b",
          lineHeight: 1.6,
          flexShrink: 0,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 40 }}>
          <div style={{ flex: 2 }}>
            <strong style={{ color: "#1a202c", display: "block", marginBottom: 4 }}>
              Interface Reflection:
            </strong>
            This project challenges the apparent neutrality of environmental data. By shifting from raw NO₂
            concentrations to a population-weighted burden ratio, the interface makes visible how spatial averages
            can conceal uneven exposure. In this sense, the map acts not only as a visualisation, but as a prompt for
            interpreting environmental inequality across London.
          </div>

          <div style={{ flex: 1 }}>
            <strong style={{ color: "#1a202c", display: "block", marginBottom: 4 }}>
              Target Users & Agency:
            </strong>
            Intended for London residents, campaigners, and local decision-makers, the platform positions users not
            as passive viewers but as active interpreters—supporting comparison, discussion, and advocacy around
            spatial inequality.
          </div>
        </div>
      </footer>
    </div>
  );
}





