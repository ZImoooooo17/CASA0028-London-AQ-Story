import { useMemo, useRef, useState, useEffect } from "react";
import MapView from "./components/MapView";
import BarRankChart from "./components/BarRankChart";
import DetailPanel from "./components/DetailPanel";
import useLondonData from "./hooks/useLondonData";

// 内部组件：IntroModal
// 放在同一个文件或单独创建 components/IntroModal.jsx
function IntroModal({ onStart }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      backgroundColor: "rgba(0,0,0,0.85)", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(8px)", transition: "all 0.5s ease"
    }}>
      <div style={{
        maxWidth: "550px", background: "white", padding: "40px", borderRadius: "24px",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", textAlign: "center",
        animation: "modalFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
      }}>
        <div style={{ 
          width: "60px", height: "6px", background: "#007bff", 
          borderRadius: "3px", margin: "0 auto 20px auto" 
        }} />
        
        <h1 style={{ margin: "0 0 15px 0", fontSize: "28px", fontWeight: "800", color: "#1a202c", letterSpacing: "-0.5px" }}>
          The Hidden Burden of London's Air
        </h1>
        
        <p style={{ color: "#4a5568", fontSize: "16px", lineHeight: "1.6", marginBottom: "25px" }}>
          London’s air quality data usually shows <strong>concentrations</strong> (where the air is dirty). 
          But focus on "averages" can obscure systemic inequalities.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "30px" }}>
          <div style={{ padding: "20px", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontWeight: "bold", color: "#2563eb", marginBottom: "8px", fontSize: "14px", textTransform: "uppercase" }}>Raw Mode</div>
            <div style={{ fontSize: "13px", color: "#64748b" }}>Where is the NO₂ intensity highest?</div>
          </div>
          <div style={{ padding: "20px", background: "#fff5f5", borderRadius: "16px", border: "1px solid #fed7d7" }}>
            <div style={{ fontWeight: "bold", color: "#e53e3e", marginBottom: "8px", fontSize: "14px", textTransform: "uppercase" }}>Burden Mode</div>
            <div style={{ fontSize: "13px", color: "#9b2c2c" }}>Who suffers most when density is factored in?</div>
          </div>
        </div>

        <p style={{ fontStyle: "italic", fontSize: "14px", color: "#94a3b8", marginBottom: "35px" }}>
          "Re-ranking London: From measuring toxic air to measuring human impact."
        </p>

        <button 
          onClick={onStart}
          style={{
            background: "#1a202c", color: "white", border: "none", padding: "14px 40px",
            borderRadius: "12px", fontSize: "16px", fontWeight: "600", cursor: "pointer",
            transition: "all 0.2s ease", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
          }}
          onMouseOver={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.2)";
          }}
          onMouseOut={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 6px -1px rgba(0,0,0,0.1)";
          }}
        >
          Begin Story
        </button>
      </div>
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("raw"); // "raw" | "weighted"
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [showIntro, setShowIntro] = useState(false);

  const { data, error } = useLondonData();
  const mapRef = useRef(null);

  // 检查是否首次访问
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem("hasSeenLondonAQIntro");
    if (!hasSeenIntro) {
      setShowIntro(true);
    }
  }, []);

  const closeIntro = () => {
    setShowIntro(false);
    localStorage.setItem("hasSeenLondonAQIntro", "true");
  };

  const selectedFeature = useMemo(() => {
    if (!data || !selectedId) return null;
    return data.features.find((f) => f.id === selectedId) || null;
  }, [data, selectedId]);

  const flyToFeature = (id) => {
    const map = mapRef.current?.getMap?.();
    const feature = data?.features?.find((f) => f.id === id);
    if (!map || !feature?.geometry) return;

    let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
    const scan = (coords) => {
      if (typeof coords[0] === "number") {
        const [lng, lat] = coords;
        minLng = Math.min(minLng, lng); minLat = Math.min(minLat, lat);
        maxLng = Math.max(maxLng, lng); maxLat = Math.max(maxLat, lat);
        return;
      }
      coords.forEach(scan);
    };
    scan(feature.geometry.coordinates);

    map.fitBounds(
      [[minLng, minLat], [maxLng, maxLat]],
      // 增加右侧 padding，确保 Borough 飞到左侧可见区域
      { padding: { top: 80, bottom: 80, left: 80, right: selectedId ? 450 : 80 }, duration: 1200 }
    );
  };

  const handleSelect = (id) => {
    setSelectedId(id);
    if (id) flyToFeature(id);
  };

  if (error) return <div style={{ padding: 20, color: "red" }}>Error: {error.message}</div>;

  return (
    <div style={{ display: "flex", height: "100vh", flexDirection: "column", background: "#f8f9fa", overflow: "hidden", fontFamily: "Inter, system-ui, sans-serif" }}>
      
      {/* 入场引导层 */}
      {showIntro && <IntroModal onStart={closeIntro} />}

      {/* 1. Header */}
      <header style={{ 
        height: "65px", 
        background: "#fff", 
        borderBottom: "1px solid #e2e8f0", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        padding: "0 30px",
        zIndex: 100 
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "32px", height: "32px", background: "#1a202c", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "12px" }}>AQ</div>
          <h1 style={{ fontSize: "18px", fontWeight: "800", margin: 0, color: "#1a1a1a", letterSpacing: "-0.5px" }}>
            London Air <span style={{ color: "#007bff" }}>Impact</span>
          </h1>
        </div>

        <div style={{ background: "#f1f5f9", padding: "4px", borderRadius: "10px", display: "flex" }}>
          <button 
            onClick={() => setMode("raw")}
            style={{ 
              padding: "8px 20px", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600",
              background: mode === "raw" ? "#fff" : "transparent",
              boxShadow: mode === "raw" ? "0 4px 6px -1px rgba(0,0,0,0.1)" : "none",
              color: mode === "raw" ? "#2563eb" : "#64748b",
              transition: "all 0.2s"
            }}
          >Raw NO₂</button>
          <button 
            onClick={() => setMode("weighted")}
            style={{ 
              padding: "8px 20px", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600",
              background: mode === "weighted" ? "#fff" : "transparent",
              boxShadow: mode === "weighted" ? "0 4px 6px -1px rgba(0,0,0,0.1)" : "none",
              color: mode === "weighted" ? "#e53e3e" : "#64748b",
              transition: "all 0.2s"
            }}
          >Population Burden</button>
        </div>
      </header>

      {/* 2. Main Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        
        {/* 左侧：BarRankChart */}
        <aside style={{ width: "380px", background: "#fff", borderRight: "1px solid #e2e8f0", overflowY: "auto", zIndex: 5, boxShadow: "4px 0 10px rgba(0,0,0,0.02)" }}>
          <BarRankChart 
            data={data} 
            mode={mode} 
            selectedId={selectedId} 
            onSelect={handleSelect}
            onHover={setHoveredId}
          />
        </aside>

        {/* 中间：MapView */}
        <main style={{ flex: 1, position: "relative", background: "#f1f5f9" }}>
          <MapView 
            data={data}
            mode={mode}
            mapRef={mapRef}
            selectedId={selectedId}
            onSelectedId={handleSelect}
            hoveredId={hoveredId}
            onHoveredId={setHoveredId}
          />
        </main>

        {/* 右侧：DetailPanel */}
        {selectedFeature && (
          <aside style={{ 
            width: "400px", 
            background: "#fff", 
            borderLeft: "1px solid #e2e8f0", 
            boxShadow: "-10px 0 20px rgba(0,0,0,0.05)",
            zIndex: 10,
            animation: "slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)" 
          }}>
            <DetailPanel 
              selectedFeature={selectedFeature} 
              onClose={() => setSelectedId(null)} 
            />
          </aside>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0.5; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}





