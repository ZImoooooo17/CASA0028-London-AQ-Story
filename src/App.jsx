import { useMemo, useRef, useState, useEffect } from "react";
import MapView from "./components/MapView";
import BarRankChart from "./components/BarRankChart";
import DetailPanel from "./components/DetailPanel";
import useLondonData from "./hooks/useLondonData";

function IntroModal({ onStart, onSelectCase }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      backgroundColor: "rgba(0,0,0,0.9)", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(12px)"
    }}>
      <div style={{
        maxWidth: "600px", background: "white", padding: "40px", borderRadius: "28px",
        textAlign: "center", animation: "modalFadeIn 0.6s ease-out"
      }}>
        <h1 style={{ margin: "0 0 10px 0", fontSize: "32px", fontWeight: "900", letterSpacing: "-1px" }}>
          London's Hidden <span style={{ color: "#e53e3e" }}>Inequity</span>
        </h1>
        
        {/* P3: 视觉对比预览钩子 */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", margin: "20px 0" }}>
           <div style={{ padding: "10px", background: "#f1f5f9", borderRadius: "12px", flex: 1 }}>
              <div style={{ height: "40px", background: "linear-gradient(90deg, #bfdbfe, #1e3a8a)", borderRadius: "4px", marginBottom: "8px" }} />
              <div style={{ fontSize: "10px", fontWeight: "bold" }}>RAW CONCENTRATION</div>
           </div>
           <div style={{ fontSize: "24px", alignSelf: "center" }}>→</div>
           <div style={{ padding: "10px", background: "#fef2f2", borderRadius: "12px", flex: 1 }}>
              <div style={{ height: "40px", background: "linear-gradient(90deg, #3182ce, #cbd5e0, #e53e3e)", borderRadius: "4px", marginBottom: "8px" }} />
              <div style={{ fontSize: "10px", fontWeight: "bold", color: "#e53e3e" }}>SYSTEMIC BURDEN</div>
           </div>
        </div>

        <p style={{ color: "#4a5568", fontSize: "16px", lineHeight: "1.6", marginBottom: "30px" }}>
          Concentration levels only tell half the story. By re-ranking London, we expose where population density turns "average" air into a disproportionate health burden.
        </p>

        {/* P1: 快捷故事入口 */}
        <div style={{ marginBottom: "35px" }}>
          <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "12px", fontWeight: "800", textTransform: "uppercase" }}>
            Explore High-Impact Shifts:
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            {[
              { id: "E09000005", name: "Brent: The Silent Jump", color: "#e53e3e" },
              { id: "E09000019", name: "Islington: Dense Burden", color: "#e53e3e" },
              { id: "E09000030", name: "Waltham Forest: Re-Ranked", color: "#e53e3e" }
            ].map(c => (
              <button
                key={c.id}
                onClick={() => onSelectCase(c.id)}
                style={{
                  padding: "10px 18px", borderRadius: "30px", border: `2px solid ${c.color}`,
                  background: "white", color: c.color, fontSize: "13px", cursor: "pointer",
                  fontWeight: "800", transition: "all 0.2s"
                }}
                onMouseOver={(e) => { e.target.style.transform = "scale(1.05)"; e.target.style.background = c.color; e.target.style.color = "white"; }}
                onMouseOut={(e) => { e.target.style.transform = "scale(1)"; e.target.style.background = "white"; e.target.style.color = c.color; }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <button onClick={onStart} style={{ background: "#1a202c", color: "white", border: "none", padding: "16px 48px", borderRadius: "14px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}>
          Free Exploration
        </button>
      </div>
      <style>{` @keyframes modalFadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } `}</style>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("raw");
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [showIntro, setShowIntro] = useState(true);

  const { data, error } = useLondonData();
  const mapRef = useRef(null);

  const handleSelect = (id) => {
    setSelectedId(id);
    if (id && data) flyToFeature(id);
  };

  const flyToFeature = (id) => {
    const map = mapRef.current?.getMap?.();
    const feature = data?.features?.find((f) => f.id === id);
    if (!map || !feature) return;
    const scan = (c) => {
      let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
      const inner = (coords) => {
        if (typeof coords[0] === "number") {
          minLng = Math.min(minLng, coords[0]); minLat = Math.min(minLat, coords[1]);
          maxLng = Math.max(maxLng, coords[0]); maxLat = Math.max(maxLat, coords[1]);
        } else coords.forEach(inner);
      };
      inner(c);
      return [[minLng, minLat], [maxLng, maxLat]];
    };
    map.fitBounds(scan(feature.geometry.coordinates), { padding: { right: 480, top: 50, bottom: 50, left: 50 }, duration: 1200 });
  };

  const handleCaseSelect = (id) => {
    setMode("weighted");
    setShowIntro(false);
    setTimeout(() => handleSelect(id), 600);
  };

  if (error) return <div>Load Error</div>;

  return (
    <div style={{ display: "flex", height: "100vh", flexDirection: "column", background: "#f8f9fa", overflow: "hidden" }}>
      {showIntro && <IntroModal onStart={() => setShowIntro(false)} onSelectCase={handleCaseSelect} />}
      <header style={{ height: "65px", background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", background: "#1a202c", borderRadius: "8px" }} />
          <h1 style={{ fontSize: "19px", fontWeight: "900", letterSpacing: "-0.5px" }}>London Air <span style={{ color: "#2563eb" }}>Impact</span></h1>
        </div>
        <div style={{ background: "#f1f5f9", padding: "4px", borderRadius: "10px", display: "flex" }}>
          <button onClick={() => setMode("raw")} style={{ padding: "8px 20px", border: "none", borderRadius: "8px", cursor: "pointer", background: mode === "raw" ? "#fff" : "transparent", fontWeight: "700", color: mode === "raw" ? "#2563eb" : "#64748b" }}>Raw NO₂</button>
          <button onClick={() => setMode("weighted")} style={{ padding: "8px 20px", border: "none", borderRadius: "8px", cursor: "pointer", background: mode === "weighted" ? "#fff" : "transparent", fontWeight: "700", color: mode === "weighted" ? "#e53e3e" : "#64748b" }}>Population Burden</button>
        </div>
      </header>
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <aside style={{ width: "380px", background: "#fff", borderRight: "1px solid #e2e8f0", overflowY: "auto" }}>
          <BarRankChart data={data} mode={mode} selectedId={selectedId} onSelect={handleSelect} onHover={setHoveredId} />
        </aside>
        <main style={{ flex: 1, position: "relative" }}><MapView data={data} mode={mode} mapRef={mapRef} selectedId={selectedId} onSelectedId={handleSelect} hoveredId={hoveredId} onHoveredId={setHoveredId} /></main>
        {selectedId && data && (
          <aside style={{ width: "420px", background: "#fff", borderLeft: "1px solid #e2e8f0", zIndex: 10 }}>
            <DetailPanel selectedFeature={data.features.find(f => f.id === selectedId)} onClose={() => setSelectedId(null)} />
          </aside>
        )}
      </div>
    </div>
  );
}






