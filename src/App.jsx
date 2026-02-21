import { useRef, useState } from "react";
import MapView from "./components/MapView";
import BarRankChart from "./components/BarRankChart";
import DetailPanel from "./components/DetailPanel";
import ModeToggle from "./components/ModeToggle";
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
        padding: 18,
      }}
    >
      <div
        style={{
          width: "min(920px, 100%)",
          borderRadius: 18,
          background: "rgba(255,255,255,0.96)",
          border: "1px solid rgba(226,232,240,0.9)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: 18,
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ width: 34, height: 34, background: "#0f172a", borderRadius: 10 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 950, fontSize: 16, letterSpacing: "-0.4px", color: "#0f172a" }}>
              Average Air, Uneven Burdens
            </div>
            <div style={{ fontSize: 12.5, color: "#475569", marginTop: 2 }}>A mode switch can reorder the city.</div>
          </div>
          <button
            onClick={onStart}
            style={{
              border: "1px solid #e2e8f0",
              background: "white",
              padding: "10px 12px",
              borderRadius: 12,
              cursor: "pointer",
              fontWeight: 900,
              fontSize: 12,
              color: "#0f172a",
            }}
          >
            Start Exploring →
          </button>
        </div>

        <div style={{ padding: 18, display: "grid", gap: 14 }}>
          <div style={{ fontSize: 13.2, color: "#334155", lineHeight: 1.6 }}>
            This interface compares two lenses on London’s NO₂:
            <ul style={{ margin: "10px 0 0 18px" }}>
              <li>
                <strong>The Statistical Average</strong>: borough mean concentration.
              </li>
              <li>
                <strong>The Lived Burden</strong>: population-weighted exposure (and its inequality signals).
              </li>
            </ul>
            <div style={{ marginTop: 8 }}>Switch modes to see how rankings change when people are counted.</div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => onSelectCase("E09000005")}
              style={{
                border: "1px solid #e2e8f0",
                background: "#0f172a",
                color: "white",
                padding: "10px 12px",
                borderRadius: 12,
                cursor: "pointer",
                fontWeight: 900,
                fontSize: 12,
              }}
            >
              Jump case: Brent →
            </button>

            <button
              onClick={onStart}
              style={{
                border: "1px solid #e2e8f0",
                background: "white",
                padding: "10px 12px",
                borderRadius: 12,
                cursor: "pointer",
                fontWeight: 900,
                fontSize: 12,
                color: "#0f172a",
              }}
            >
              Explore freely
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Narrative Intro (你原有的，保留)
 */
function NarrativeIntro({ mode, onReplayIntro }) {
  const [openWhy, setOpenWhy] = useState(false);

  return (
    <section style={{ background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 30px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 950, color: "#0f172a", letterSpacing: "-0.2px" }}>
              {mode === "raw" ? "Lens 1 — The Statistical Average" : "Lens 2 — The Lived Burden"}
            </div>

            <p style={{ margin: "6px 0 0", color: "#475569", fontSize: 13.2, lineHeight: 1.55 }}>
              {mode === "raw" ? (
                <>Borough mean NO₂ concentration is useful — but it can hide how many people live with exposure.</>
              ) : (
                <>Population weighting can reorder rankings — revealing where “average” air hides disproportionate exposure.</>
              )}
            </p>

            <div style={{ marginTop: 8 }}>
              <button
                onClick={() => setOpenWhy((v) => !v)}
                style={{
                  border: "1px solid #e2e8f0",
                  background: "white",
                  padding: "8px 10px",
                  borderRadius: 12,
                  cursor: "pointer",
                  fontWeight: 900,
                  fontSize: 12,
                  color: "#0f172a",
                }}
              >
                {openWhy ? "Hide why" : "Why do rankings change?"}
              </button>
            </div>

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
                <strong>The Statistical Average</strong> is an average concentration. <strong>The Lived Burden</strong>{" "}
                compares a borough’s <em>share of total exposure</em> with its <em>share of population</em>. That’s why
                the map can “reorder” — the same pollution level can imply very different impacts depending on how
                many people are exposed.
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
                <span style={{ color: "#e53e3e", fontWeight: 800 }}>The Lived Burden</span>, then click a borough to
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
 * ✅ 可折叠 Legend（你原有的，保留）
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
            {isRaw ? "Borough-average NO₂ (µg/m³)" : "Population burden (ratio)"}
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
                <strong>The Statistical Average</strong> shows borough-level average concentration (µg/m³).
                <div style={{ marginTop: 6, opacity: 0.9 }}>Higher values = worse average air.</div>
                <div style={{ marginTop: 6, opacity: 0.9 }}>
                  Tip: switch to <strong>The Lived Burden</strong> to see where population exposure amplifies risk.
                </div>
              </>
            ) : (
              <>
                <strong>The Lived Burden (ratio)</strong> compares a borough’s share of total exposure with its share of
                London’s population.
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

  const [showReorderToast, setShowReorderToast] = useState(false);
  const [spotlightId, setSpotlightId] = useState(null);

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

  const triggerReorderDramaturgy = (nextMode) => {
    setShowReorderToast(true);
    window.setTimeout(() => setShowReorderToast(false), 1600);

    if (!data?.features?.length) return;

    if (nextMode === "weighted") {
      const focusId = data?.meta?.maxUpJumpId || data?.meta?.maxAbsJumpId;
      if (focusId) {
        setSpotlightId(focusId);
        setTimeout(() => handleSelect(focusId), 450);
      }
    } else {
      setSpotlightId(null);
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

  const headerExplain =
    mode === "raw"
      ? "The Statistical Average shows borough mean NO₂. Averages can hide how many people live with exposure."
      : "The Lived Burden uses a population-weighted burden ratio (exposure share vs population share). Rankings can shift—revealing disproportionate exposure.";

  return (
    <div style={{ display: "flex", height: "100vh", flexDirection: "column", background: "#f8f9fa" }}>
      {showIntro && <IntroModal onStart={() => setShowIntro(false)} onSelectCase={handleCaseSelect} />}

      {/* Header */}
      <header
        style={{
          height: 68,
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
            <h1 style={{ fontSize: 19, fontWeight: 950, letterSpacing: "-0.6px", margin: 0 }}>
              Average Air, Uneven Burdens
            </h1>

            {/* ✅ 改 1：更强的 opening statement（固定两行） */}
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, lineHeight: 1.25 }}>
              London’s air pollution appears average — until we change how we measure it.
              <span style={{ display: "block" }}>Switch viewing modes to see how borough rankings change.</span>

              {/* ✅ 改 2：ethical hint 仅在 weighted 出现 */}
              {mode === "weighted" && <span style={{ display: "block" }}>Averages may obscure lived exposure.</span>}
            </div>
          </div>
        </div>

        {/* ✅ 改 4：toggle 旁边加 “Viewing mode reshapes the city.” */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>Viewing mode reshapes the city.</div>

          <div style={{ background: "#0f172a", padding: 4, borderRadius: 12 }}>
            <ModeToggle
              mode={mode}
              onMode={(next) => {
                setMode(next);
                triggerReorderDramaturgy(next);
              }}
            />
          </div>
        </div>
      </header>

      {/* ✅ 轻量 explanatory text（模式切换即时解释） */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "10px 30px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", fontSize: 12.8, color: "#475569" }}>
          <strong style={{ color: "#0f172a" }}>Mode:</strong> {headerExplain}
        </div>
      </div>

      {/* Narrative Intro */}
      <NarrativeIntro mode={mode} onReplayIntro={() => setShowIntro(true)} />

      {/* Toast dramaturgy */}
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
          Look what just happened.
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
                spotlightId={spotlightId}
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

      {/* Footer reflection（你原有的，保留） */}
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
            <strong style={{ color: "#1a202c", display: "block", marginBottom: 4 }}>Interface Reflection:</strong>
            This project challenges the apparent neutrality of environmental data. By shifting from raw NO₂
            concentrations to a population-weighted burden ratio, the interface makes visible how spatial averages
            can conceal uneven exposure. In this sense, the map acts not only as a visualisation, but as a prompt for
            interpreting environmental inequality across London.
          </div>

          <div style={{ flex: 1 }}>
            <strong style={{ color: "#1a202c", display: "block", marginBottom: 4 }}>Target Users & Agency:</strong>
            Intended for London residents, campaigners, and local decision-makers, the platform positions users not
            as passive viewers but as active interpreters—supporting comparison, discussion, and advocacy around
            spatial inequality.
          </div>
        </div>
      </footer>
    </div>
  );
}





