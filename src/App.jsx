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
 * ✅ 可折叠 Legend（分段与 MapView.jsx 的 step 完全一致）
 * Raw:
 *   <24, 24–28, 28–32, 32–36, >36
 * Weighted (burdenRatio):
 *   <0.8, 0.8–0.95, 0.95–1.05, 1.05–1.2, >1.2
 */
function LegendCard({ mode }) {
  const isRaw = mode === "raw";
  const [open, setOpen] = useState(true);

  // 与 MapView.jsx raw step 一致（缺失色不在 legend 显示）
  const rawBands = [
    { label: "< 24", color: "#eff6ff" },
    { label: "24 – 28", color: "#bfdbfe" },
    { label: "28 – 32", color: "#60a5fa" },
    { label: "32 – 36", color: "#2563eb" },
    { label: "> 36", color: "#1e3a8a" },
  ];

  // 与 MapView.jsx weighted step 一致
  const burdenBands = [
    { label: "< 0.8", color: "#3182ce" },   // 0 ~ 0.8 之前
    { label: "0.8 – 0.95", color: "#93c5fd" },
    { label: "0.95 – 1.05", color: "#cbd5e0" }, // city average band
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
      {/* Header */}
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
          {/* Color bands */}
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

          {/* Explanation */}
          <div style={{ marginTop: 12, fontSize: 12.5, color: "#475569", lineHeight: 1.45 }}>
            {isRaw ? (
              <>
                Higher values indicate worse air quality on average.
                <div style={{ marginTop: 6, opacity: 0.9 }}>
                  Tip: switch to <strong>Population Burden</strong> to reveal disproportionate exposure.
                </div>
              </>
            ) : (
              <>
                <strong>1</strong> means proportional burden (pollution share matches population share). Values
                <strong> &gt; 1</strong> indicate disproportionate exposure pressure.
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
            onClick={() => setMode("raw")}
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
            onClick={() => setMode("weighted")}
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






