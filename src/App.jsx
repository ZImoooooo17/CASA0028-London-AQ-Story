import { useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import IntroModal from "./components/IntroModal";
import MapView from "./components/MapView";
import BarRankChart from "./components/BarRankChart";
import DetailPanel from "./components/DetailPanel";
import ModeToggle from "./components/ModeToggle";
import Legend from "./components/Legend";
import useLondonData from "./hooks/useLondonData";

/**
 * Narrative Intro - 这里承担具体的 Mode 解释
 */
function NarrativeIntro({ mode, onReplayIntro }) {
  const [openWhy, setOpenWhy] = useState(false);
  return (
    <section style={{ background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 30px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 950, color: "#0f172a", letterSpacing: "-0.2px" }}>
              {mode === "raw" ? "Lens 1 — Average View" : "Lens 2 — Burden View"}
            </div>
            <p style={{ margin: "6px 0 0", color: "#475569", fontSize: 13.2, lineHeight: 1.55 }}>
              {mode === "raw" 
                ? "Borough mean NO₂ concentration is useful — but it can hide how many people live with exposure." 
                : "Population weighting (Burden Ratio) reorders rankings — revealing where “average” air hides disproportionate exposure."}
            </p>
            <div style={{ marginTop: 8 }}>
              <button
                onClick={() => setOpenWhy((v) => !v)}
                style={{ border: "1px solid #e2e8f0", background: "white", padding: "8px 10px", borderRadius: 12, cursor: "pointer", fontWeight: 900, fontSize: 12, color: "#0f172a" }}
              >
                {openWhy ? "Hide technical details" : "Why do rankings change?"}
              </button>
            </div>
            {openWhy && (
              <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 14, border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: 12.8 }}>
                <strong>Burden View</strong> compares a borough’s <em>share of total exposure</em> with its <em>share of population</em>.
              </div>
            )}
          </div>
          <button onClick={onReplayIntro} style={{ border: "1px solid #e2e8f0", background: "white", padding: "10px 12px", borderRadius: 12, fontWeight: 800, fontSize: 12 }}>
            Replay Intro
          </button>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [mode, setMode] = useState("raw");
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [showIntro, setShowIntro] = useState(true);

  const { data, error } = useLondonData();
  const mapRef = useRef(null);

  const findFeatureById = (id) => {
    if (!id || !data?.features?.length) return null;
    const sid = String(id);
    return data.features.find((f) => String(f?.id) === sid || String(f?.properties?.LAD22CD) === sid);
  };

  const flyToFeature = (id) => {
    const map = mapRef.current?.getMap?.();
    const feature = findFeatureById(id);
    if (!map || !feature) return;

    const bounds = new maplibregl.LngLatBounds();
    const extendCoords = (c) => {
      if (typeof c[0] === "number" && typeof c[1] === "number") {
        bounds.extend(c);
      } else if (Array.isArray(c)) {
        c.forEach(extendCoords);
      }
    };
    extendCoords(feature.geometry.coordinates);

    map.resize(); 
    map.fitBounds(bounds, {
      padding: { top: 60, bottom: 60, left: 60, right: id ? 420 : 60 },
      duration: 1000,
    });
  };

  const handleSelect = (id) => {
    setSelectedId(id);
    if (id && data) requestAnimationFrame(() => flyToFeature(id));
  };

  if (error) return <div style={{ padding: 24 }}>Load Error.</div>;
  const isLoading = !data;
  const selectedFeature = selectedId ? findFeatureById(selectedId) : null;

  return (
    <div className="storyPage">
      {showIntro && <IntroModal data={data} onStart={() => setShowIntro(false)} onSelectCase={(id) => { setMode("weighted"); setShowIntro(false); setTimeout(() => handleSelect(id), 600); }} />}

      {/* 🚀 恢复理论副标题后的完整 Header */}
      <header style={{ height: 72, background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, background: "#1a202c", borderRadius: 8 }} />
          <div>
            <h1 style={{ fontSize: 19, fontWeight: 950, margin: 0, letterSpacing: "-0.5px" }}>Average Air, Uneven Burdens</h1>
            <div style={{ fontSize: 12.5, color: "#475569", marginTop: 2, lineHeight: 1.4 }}>
              When we talk about London’s “average” air quality, what inequalities disappear?
            </div>
          </div>
        </div>
        <div style={{ background: "#0f172a", padding: 4, borderRadius: 12 }}>
          <ModeToggle mode={mode} onMode={(next) => { setSelectedId(null); setMode(next); }} />
        </div>
      </header>

      <NarrativeIntro mode={mode} onReplayIntro={() => setShowIntro(true)} />

      <section className="interactiveSection">
        <div className="interactiveShell">
          <aside style={{ flex: "0 0 380px", background: "#fff", borderRight: "1px solid #e2e8f0", overflowY: "auto" }}>
            {!isLoading && <BarRankChart data={data} mode={mode} selectedId={selectedId} onSelect={handleSelect} onHover={setHoveredId} />}
          </aside>

          <main style={{ flex: "1 1 auto", position: "relative", overflow: "visible" }}>
            {!isLoading && (
              <>
                <MapView data={data} mode={mode} mapRef={mapRef} selectedId={selectedId} onSelectedId={handleSelect} hoveredId={hoveredId} onHoveredId={setHoveredId} />
                <Legend mode={mode} defaultOpen={false} anchor="top-left" />
              </>
            )}
          </main>

          <aside style={{ flex: selectedId ? "0 0 420px" : "0", opacity: selectedId ? 1 : 0, transition: "all 0.3s ease", background: "#fff", borderLeft: selectedId ? "1px solid #e2e8f0" : "none", overflowY: "auto" }}>
            {selectedFeature && <DetailPanel selectedFeature={selectedFeature} mode={mode} onClose={() => setSelectedId(null)} />}
          </aside>
        </div>
      </section>

      <footer style={{ padding: "18px 30px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", fontSize: 12, color: "#64748b" }}>
        Representation is never neutral. This interface shows how measurement choices quietly redraw who is seen.
      </footer>
    </div>
  );
}




