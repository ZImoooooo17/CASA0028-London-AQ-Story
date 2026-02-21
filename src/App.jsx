import { useMemo, useRef, useState } from "react";
import MapView from "./components/MapView";
import BarRankChart from "./components/BarRankChart";
import DetailPanel from "./components/DetailPanel";
import useLondonData from "./hooks/useLondonData";

export default function App() {
  const [mode, setMode] = useState("raw"); // "raw" | "weighted"
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  const { data, error } = useLondonData();
  const mapRef = useRef(null);

  // ✅ Step 2 核心：计算当前选中的 Borough 特征数据
  const selectedFeature = useMemo(() => {
    if (!data || !selectedId) return null;
    return data.features.find((f) => f.id === selectedId) || null;
  }, [data, selectedId]);

  // 飞行跳转逻辑
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
      // ✅ 增加右侧 padding (350)，确保 Borough 飞到左侧可见区域，不被详情面板挡住
      { padding: { top: 50, bottom: 50, left: 50, right: selectedId ? 380 : 50 }, duration: 1000 }
    );
  };

  const handleSelect = (id) => {
    setSelectedId(id);
    if (id) flyToFeature(id);
  };

  if (error) return <div style={{ p: 20, color: "red" }}>Error: {error.message}</div>;

  return (
    <div style={{ display: "flex", height: "100vh", flexDirection: "column", background: "#f8f9fa", overflow: "hidden" }}>
      
      {/* 1. Header (Control Panel) */}
      <header style={{ 
        height: "60px", 
        background: "#fff", 
        borderBottom: "1px solid #e0e0e0", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        padding: "0 25px",
        zIndex: 10 
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", background: "#007bff", borderRadius: "6px" }} />
          <h1 style={{ fontSize: "18px", fontWeight: "bold", margin: 0, color: "#1a1a1a" }}>
            London Air Quality <span style={{ color: "#007bff" }}>Interface</span>
          </h1>
        </div>

        <div style={{ background: "#f0f2f5", padding: "4px", borderRadius: "8px", display: "flex" }}>
          <button 
            onClick={() => setMode("raw")}
            style={{ 
              padding: "6px 16px", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "500",
              background: mode === "raw" ? "#fff" : "transparent",
              boxShadow: mode === "raw" ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
              color: mode === "raw" ? "#007bff" : "#666"
            }}
          >Raw NO₂ Mode</button>
          <button 
            onClick={() => setMode("weighted")}
            style={{ 
              padding: "6px 16px", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "500",
              background: mode === "weighted" ? "#fff" : "transparent",
              boxShadow: mode === "weighted" ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
              color: mode === "weighted" ? "#007bff" : "#666"
            }}
          >Population Burden Mode</button>
        </div>
      </header>

      {/* 2. Main Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        
        {/* 左侧：BarRankChart */}
        <aside style={{ width: "360px", background: "#fff", borderRight: "1px solid #e0e0e0", overflowY: "auto", zIndex: 5 }}>
          <BarRankChart 
            data={data} 
            mode={mode} 
            selectedId={selectedId} 
            onSelect={handleSelect}
            onHover={setHoveredId}
          />
        </aside>

        {/* 中间：MapView */}
        <main style={{ flex: 1, position: "relative", background: "#eee" }}>
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

        {/* ✅ 右侧：DetailPanel (Step 2 叙事核心) */}
        {selectedFeature && (
          <aside style={{ 
            width: "380px", 
            background: "#fff", 
            borderLeft: "1px solid #e0e0e0", 
            boxShadow: "-4px 0 15px rgba(0,0,0,0.05)",
            zIndex: 10,
            animation: "slideIn 0.3s ease-out" 
          }}>
            <DetailPanel 
              selectedFeature={selectedFeature} 
              onClose={() => setSelectedId(null)} 
            />
          </aside>
        )}
      </div>

      {/* 简单的 CSS 动画 */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}







