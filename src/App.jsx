import { useMemo, useRef, useState, useEffect } from "react";
import MapView from "./components/MapView";
import BarRankChart from "./components/BarRankChart";
import DetailPanel from "./components/DetailPanel";
import useLondonData from "./hooks/useLondonData";

function IntroModal({ onStart, onSelectCase }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      backgroundColor: "rgba(0,0,0,0.85)", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(10px)"
    }}>
      <div style={{
        maxWidth: "550px", background: "white", padding: "40px", borderRadius: "24px",
        textAlign: "center", animation: "modalFadeIn 0.5s ease-out"
      }}>
        <h1 style={{ margin: "0 0 15px 0", fontSize: "28px", fontWeight: "800" }}>
          The Hidden Burden of London's Air
        </h1>
        <p style={{ color: "#4a5568", fontSize: "16px", lineHeight: "1.6", marginBottom: "25px" }}>
          Does every citizen breathe the same air? By re-ranking London via <strong>Population Burden</strong>, 
          we reveal how systemic exposure is masked by raw concentration averages.
        </p>

        {/* P1: 快捷故事入口 */}
        <div style={{ marginBottom: "30px", padding: "20px", background: "#f8fafc", borderRadius: "16px" }}>
          <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "12px", fontWeight: "800", textTransform: "uppercase" }}>
            Start with a Story:
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
            {[
              { id: "E09000005", name: "Brent: The Hidden Jump", color: "#e53e3e" },
              { id: "E09000019", name: "Islington: Dense Exposure", color: "#e53e3e" },
              { id: "E09000007", name: "Bromley: Low Impact", color: "#3182ce" }
            ].map(c => (
              <button
                key={c.id}
                onClick={() => onSelectCase(c.id)}
                style={{
                  padding: "8px 16px", borderRadius: "20px", border: `2px solid ${c.color}`,
                  background: "white", color: c.color, fontSize: "12px", cursor: "pointer",
                  fontWeight: "700", transition: "all 0.2s"
                }}
                onMouseOver={(e) => { e.target.style.background = c.color; e.target.style.color = "white"; }}
                onMouseOut={(e) => { e.target.style.background = "white"; e.target.style.color = c.color; }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={onStart}
          style={{
            background: "#1a202c", color: "white", border: "none", padding: "14px 40px",
            borderRadius: "12px", fontSize: "16px", fontWeight: "600", cursor: "pointer"
          }}
        >
          Explore All Boroughs
        </button>
      </div>
      <style>{`
        @keyframes modalFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
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
    if (id && data) {
      const feature = data.features.find(f => f.id === id);
      if (feature && mapRef.current) {
        // 飞行逻辑保持原样
        flyToFeature(id);
      }
    }
  };

  const flyToFeature = (id) => {
    const map = mapRef.current?.getMap?.();
    const feature = data?.features?.find((f) => f.id === id);
    if (!map || !feature) return;
    
    // 简化的边界计算用于飞行动画
    const coords = feature.geometry.coordinates;
    let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
    const scan = (c) => {
      if (typeof c[0] === "number") {
        minLng = Math.min(minLng, c[0]); minLat = Math.min(minLat, c[1]);
        maxLng = Math.max(maxLng, c[0]); maxLat = Math.max(maxLat, c[1]);
      } else c.forEach(scan);
    };
    scan(coords);
    map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: { right: 450, top: 50, bottom: 50, left: 50 }, duration: 1000 });
  };

  const handleCaseSelect = (id) => {
    setMode("weighted");
    setShowIntro(false);
    setTimeout(() => handleSelect(id), 500);
  };

  if (error) return <div>Error loading data</div>;

  return (
    <div style={{ display: "flex", height: "100vh", flexDirection: "column", background: "#f8f9fa", overflow: "hidden" }}>
      {showIntro && <IntroModal onStart={() => setShowIntro(false)} onSelectCase={handleCaseSelect} />}
      
      <header style={{ height: "60px", background: "#fff", borderBottom: "1px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 25px", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", background: "#1a202c", borderRadius: "8px" }} />
          <h1 style={{ fontSize: "18px", fontWeight: "800", margin: 0 }}>London Air <span style={{ color: "#2563eb" }}>Impact</span></h1>
        </div>
        <div style={{ background: "#f1f5f9", padding: "4px", borderRadius: "8px", display: "flex" }}>
          <button onClick={() => setMode("raw")} style={{ padding: "6px 16px", border: "none", borderRadius: "6px", cursor: "pointer", background: mode === "raw" ? "#fff" : "transparent", fontWeight: "600", color: mode === "raw" ? "#2563eb" : "#64748b" }}>Raw NO₂</button>
          <button onClick={() => setMode("weighted")} style={{ padding: "6px 16px", border: "none", borderRadius: "6px", cursor: "pointer", background: mode === "weighted" ? "#fff" : "transparent", fontWeight: "600", color: mode === "weighted" ? "#e53e3e" : "#64748b" }}>Population Burden</button>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <aside style={{ width: "380px", background: "#fff", borderRight: "1px solid #e0e0e0", overflowY: "auto" }}>
          <BarRankChart data={data} mode={mode} selectedId={selectedId} onSelect={handleSelect} onHover={setHoveredId} />
        </aside>
        <main style={{ flex: 1, position: "relative" }}>
          <MapView data={data} mode={mode} mapRef={mapRef} selectedId={selectedId} onSelectedId={handleSelect} hoveredId={hoveredId} onHoveredId={setHoveredId} />
        </main>
        {selectedId && data && (
          <aside style={{ width: "400px", background: "#fff", borderLeft: "1px solid #e0e0e0", zIndex: 10 }}>
            <DetailPanel selectedFeature={data.features.find(f => f.id === selectedId)} onClose={() => setSelectedId(null)} />
          </aside>
        )}
      </div>
    </div>
  );
}





