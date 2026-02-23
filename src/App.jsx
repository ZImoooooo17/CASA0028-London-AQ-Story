import { useRef, useState, useMemo } from "react";
import IntroModal from "./components/IntroModal";
import MapView from "./components/MapView";
import BarRankChart from "./components/BarRankChart";
import DetailPanel from "./components/DetailPanel";
import ModeToggle from "./components/ModeToggle";
import Legend from "./components/Legend";
import useLondonData from "./hooks/useLondonData";

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

  const selectedFeature = selectedId ? findFeatureById(selectedId) : null;
  const isLoading = !data;

  const rankExtremes = useMemo(() => {
    if (!data?.features?.length) return null;
    const features = data.features.map((f) => ({ id: f.properties.LAD22CD, name: f.properties.LAD22NM, jump: f.properties.rankJump }));
    const upward = [...features].filter((f) => f.jump > 0).sort((a, b) => b.jump - a.jump)[0];
    const downward = [...features].filter((f) => f.jump < 0).sort((a, b) => a.jump - b.jump)[0];
    return { upward, downward };
  }, [data]);

  if (error) return <div style={{ padding: 24 }}>Load Error.</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {showIntro && (
        <IntroModal data={data} onStart={() => setShowIntro(false)} onSelectCase={(id) => { setMode("weighted"); setShowIntro(false); setTimeout(() => setSelectedId(id), 500); }} />
      )}

      {/* HEADER：增加相对定位和 zIndex */}
      <header style={{ height: 70, background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", padding: "0 28px", position: "relative", zIndex: 50 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Average Air, Uneven Burdens</h1>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Changing the metric reshapes the geography of concern.</div>
        </div>
      </header>

      {/* MAIN INTERACTIVE ZONE */}
      <section style={{ position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", height: "75vh", position: "relative" }}>
          
          {/* LEFT RANK：通过不透明背景和 zIndex 解决阅读问题 */}
          <aside style={{ flex: "0 0 360px", background: "rgba(255,255,255,0.98)", borderRight: "1px solid #e2e8f0", overflowY: "auto", position: "relative", zIndex: 20 }}>
            {!isLoading && <BarRankChart data={data} mode={mode} selectedId={selectedId} onSelect={setSelectedId} onHover={setHoveredId} />}
          </aside>

          {/* MAP AREA */}
          <main style={{ flex: 1, position: "relative" }}>
            {!isLoading && (
              <>
                <MapView data={data} mode={mode} mapRef={mapRef} selectedId={selectedId} onSelectedId={setSelectedId} hoveredId={hoveredId} onHoveredId={setHoveredId} />
                <div style={{ position: "absolute", top: 16, left: 16, zIndex: 40, width: 220 }}>
                  <ModeToggle mode={mode} onMode={(next) => { setSelectedId(null); setMode(next); }} />
                </div>
                <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 40 }}>
                  <Legend mode={mode} defaultOpen={true} />
                </div>
                {selectedId && selectedFeature && (
                  <div style={{ position: "absolute", top: 0, right: 0, width: 400, height: "100%", background: "#fff", borderLeft: "1px solid #e2e8f0", zIndex: 30, overflowY: "auto", boxShadow: "-10px 0 20px rgba(0,0,0,0.05)" }}>
                    <DetailPanel selectedFeature={selectedFeature} mode={mode} onClose={() => setSelectedId(null)} />
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </section>

      {/* RANK SHIFT & FOOTER：恢复流式布局，确保不被地图覆盖 */}
      {rankExtremes && (
        <section style={{ background: "#fff", borderTop: "1px solid #e2e8f0", padding: "50px 28px", position: "relative", zIndex: 10 }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <h2 style={{ fontWeight: 900 }}>When population is considered, London is reordered</h2>
            <div style={{ display: "flex", gap: 80, marginTop: 30 }}>
              {rankExtremes.upward && (
                <div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>Largest upward shift</div>
                  <div onClick={() => { setMode("weighted"); setSelectedId(rankExtremes.upward.id); }} style={{ fontWeight: 900, cursor: "pointer" }}>{rankExtremes.upward.name}</div>
                  <div>+{rankExtremes.upward.jump} places</div>
                </div>
              )}
              {rankExtremes.downward && (
                <div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>Largest downward shift</div>
                  <div onClick={() => { setMode("weighted"); setSelectedId(rankExtremes.downward.id); }} style={{ fontWeight: 900, cursor: "pointer" }}>{rankExtremes.downward.name}</div>
                  <div>{rankExtremes.downward.jump} places</div>
                </div>
              )}
            </div>
            <p style={{ marginTop: 25, color: "#475569" }}>Dense boroughs rise in concern even when raw concentration is not highest.</p>
          </div>
        </section>
      )}

      <footer style={{ padding: "40px 28px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <strong>What does this interface show?</strong>
          <p style={{ marginTop: 12 }}>By changing the metric, we change which boroughs appear most concerning. Measurement is not neutral. It shapes spatial visibility and political priority.</p>
        </div>
      </footer>
    </div>
  );
}


