import { useMemo, useState } from "react";
import Map, { Source, Layer, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapView({ data, mode, mapRef, selectedId, onSelectedId, hoveredId, onHoveredId }) {
  const [hoverPopup, setHoverPopup] = useState(null);
  const [labelLayerId, setLabelLayerId] = useState(null);

  // 1. 发散色阶逻辑：以 1.0 为中心，并强化中间灰色的存在感
  const fillColorExpr = useMemo(() => {
    const missingColor = "#f3f4f6";

    if (mode === "raw") {
      // 原始 NO2 浓度色阶
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
      // 优化后的 Burden Ratio 发散色阶
      return [
        "step", ["coalesce", ["get", "burdenRatio"], -1],
        missingColor, 0,
        "#3182ce", 0.8,   // 负担显著较低 (深蓝)
        "#93c5fd", 0.95,  // 略低于平均 (浅蓝)
        "#cbd5e0", 1.05,  // 修改点：使用更扎实的灰色代表 City Average
        "#fca5a5", 1.2,   // 略高于平均 (浅红)
        "#e53e3e"         // 负担显著极重 (深红)
      ];
    }
  }, [mode]);

  // 找回地图的地名层，确保行政区填充在文字下方
  const onMapLoad = (e) => {
    const layers = e.target.getStyle().layers;
    const labelLayer = layers.find(l => l.type === 'symbol' && l.layout?.['text-field']);
    if (labelLayer) setLabelLayerId(labelLayer.id);
  };

  // 2. 更新图例说明
  const legendItems = mode === "raw" 
    ? [ { c: "#eff6ff", t: "< 24" }, { c: "#bfdbfe", t: "24-28" }, { c: "#60a5fa", t: "28-32" }, { c: "#2563eb", t: "32-36" }, { c: "#1e3a8a", t: "> 36" } ]
    : [ 
        { c: "#3182ce", t: "Lower Burden (< 0.8)" }, 
        { c: "#93c5fd", t: "0.8 - 0.95" }, 
        { c: "#cbd5e0", t: "City Average (1.0)" }, 
        { c: "#fca5a5", t: "1.05 - 1.2" }, 
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
            {/* 颜色填充层 */}
            <Layer
              id="borough-fill"
              type="fill"
              beforeId={labelLayerId}
              paint={{ 
                "fill-color": fillColorExpr, 
                "fill-opacity": 0.85 // 提高不透明度，确保灰色区域不再像“透明”
              }}
            />
            
            {/* 悬停高亮 */}
            <Layer
              id="borough-hover-outline"
              type="line"
              beforeId={labelLayerId}
              filter={["==", ["get", "LAD22CD"], hoveredId || ""]}
              paint={{ "line-color": "#f59e0b", "line-width": 3 }}
            />

            {/* 选中高亮 */}
            <Layer
              id="borough-select-outline"
              type="line"
              filter={["==", ["get", "LAD22CD"], selectedId || ""]}
              paint={{ "line-color": "#1a202c", "line-width": 3 }}
            />
          </Source>
        )}

        {/* Legend 图例 */}
        <div style={{
          position: "absolute", bottom: "30px", left: "20px",
          background: "white", padding: "16px", borderRadius: "12px",
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", fontSize: "11px", zIndex: 20,
          border: "1px solid #e2e8f0"
        }}>
          <div style={{ fontWeight: "800", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {mode === "raw" ? "NO₂ Intensity (µg/m³)" : "Inequity: Burden Ratio"}
          </div>
          {legendItems.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
              <div style={{ 
                width: "14px", height: "14px", background: item.c, 
                marginRight: "10px", borderRadius: "3px", border: "1px solid #eee" 
              }} />
              <span style={{ color: "#4a5568", fontWeight: "500" }}>{item.t}</span>
            </div>
          ))}
        </div>

        {hoverPopup && (
          <Popup longitude={hoverPopup.lng} latitude={hoverPopup.lat} closeButton={false} offset={10}>
            <div style={{ fontSize: '12px', fontWeight: '800', padding: "2px" }}>{hoverPopup.props.LAD22NM}</div>
          </Popup>
        )}
      </Map>
    </div>
  );
}