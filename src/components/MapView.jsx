import { useMemo, useState } from "react";
import Map, { Source, Layer, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapView({ data, mode, mapRef, selectedId, onSelectedId, hoveredId, onHoveredId }) {
  const [hoverPopup, setHoverPopup] = useState(null);
  const [labelLayerId, setLabelLayerId] = useState(null);

  // P0: 发散色阶逻辑，将“平均值”可视化为坚实的参考点
  const fillColorExpr = useMemo(() => {
    const missingColor = "#f3f4f6";

    if (mode === "raw") {
      return [
        "step", ["coalesce", ["get", "NO2"], -1],
        missingColor, 0,
        "#eff6ff", 24, 
        "#bfdbfe", 28, 
        "#60a5fa", 32, 
        "#2563eb", 36, 
        "#1e3a8a"
      ];
    } else {
      // Diverging Scale: 以 1.0 (Burden Ratio) 为道德分界线
      return [
        "step", ["coalesce", ["get", "burdenRatio"], -1],
        missingColor, 0,
        "#3182ce", 0.8,   // 显著低负担 (深蓝)
        "#93c5fd", 0.95,  // 略低负担 (浅蓝)
        "#cbd5e0", 1.05,  // 市平均水平 (灰色参考点)
        "#fca5a5", 1.2,   // 略高负担 (浅红)
        "#e53e3e"         // 显著高负担 (深红 - 揭示不公平)
      ];
    }
  }, [mode]);

  const onMapLoad = (e) => {
    const layers = e.target.getStyle().layers;
    const labelLayer = layers.find(l => l.type === 'symbol' && l.layout?.['text-field']);
    if (labelLayer) setLabelLayerId(labelLayer.id);
  };

  const legendItems = mode === "raw" 
    ? [ { c: "#eff6ff", t: "< 24" }, { c: "#bfdbfe", t: "24-28" }, { c: "#60a5fa", t: "28-32" }, { c: "#2563eb", t: "32-36" }, { c: "#1e3a8a", t: "> 36" } ]
    : [ 
        { c: "#3182ce", t: "Lower Burden (< 0.8)" }, 
        { c: "#cbd5e0", t: "City Average (1.0)" }, 
        { c: "#e53e3e", t: "Higher Burden (> 1.2)" } 
      ];

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Map
        ref={mapRef}
        initialViewState={{ longitude: -0.12, latitude: 51.5, zoom: 9.5 }}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        onLoad={onMapLoad}
        interactiveLayerIds={["borough-fill"]}
        onMouseMove={(e) => {
          const f = e.features?.[0];
          if (f) {
            onHoveredId(f.id);
            setHoverPopup({ lng: e.lngLat.lng, lat: e.lngLat.lat, props: f.properties });
          } else {
            onHoveredId(null); setHoverPopup(null);
          }
        }}
        onMouseLeave={() => { onHoveredId(null); setHoverPopup(null); }}
        onClick={(e) => onSelectedId(e.features?.[0]?.id || null)}
      >
        {data && (
          <Source id="boroughs" type="geojson" data={data} promoteId="LAD22CD">
            <Layer
              id="borough-fill"
              type="fill"
              beforeId={labelLayerId}
              paint={{ "fill-color": fillColorExpr, "fill-opacity": 0.85 }}
            />
            <Layer
              id="borough-hover-outline"
              type="line"
              beforeId={labelLayerId}
              filter={["==", ["get", "LAD22CD"], hoveredId || ""]}
              paint={{ "line-color": "#f59e0b", "line-width": 3 }}
            />
            <Layer
              id="borough-select-outline"
              type="line"
              filter={["==", ["get", "LAD22CD"], selectedId || ""]}
              paint={{ "line-color": "#1a202c", "line-width": 3 }}
            />
          </Source>
        )}

        <div style={{
          position: "absolute", bottom: "30px", left: "20px",
          background: "white", padding: "16px", borderRadius: "12px",
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", fontSize: "11px", zIndex: 20
        }}>
          <div style={{ fontWeight: "800", marginBottom: "10px", textTransform: "uppercase" }}>
            {mode === "raw" ? "NO₂ (µg/m³)" : "Inequity: Burden Ratio"}
          </div>
          {legendItems.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
              <div style={{ width: "14px", height: "14px", background: item.c, marginRight: "10px", borderRadius: "3px" }} />
              <span style={{ color: "#4a5568", fontWeight: "500" }}>{item.t}</span>
            </div>
          ))}
        </div>
      </Map>
    </div>
  );
}