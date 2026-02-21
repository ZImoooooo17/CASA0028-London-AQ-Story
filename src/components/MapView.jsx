import { useMemo, useState } from "react";
import Map, { Source, Layer, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapView({ data, mode, mapRef, selectedId, onSelectedId, hoveredId, onHoveredId }) {
  const [hoverPopup, setHoverPopup] = useState(null);
  const [labelLayerId, setLabelLayerId] = useState(null);

  // 根据模式选择数据字段
  const metricKey = mode === "weighted" ? "totalExposure" : "NO2";

  // 1. 阶梯式颜色表达式 (Step Color Expression)
  const fillColorExpr = useMemo(() => {
    const key = metricKey;
    const missingColor = "#d1d5db";

    if (mode === "raw") {
      // NO2 原始浓度 (µg/m³) 分段
      return [
        "step", ["coalesce", ["get", key], -1],
        missingColor, 0,
        "#eff6ff", 24, // < 24
        "#bfdbfe", 28, // 24-28
        "#60a5fa", 32, // 28-32
        "#2563eb", 36, // 32-36
        "#1e3a8a"      // > 36
      ];
    } else {
      // Total Exposure (总负担) 分段 - 数值范围约 50-150
      return [
        "step", ["coalesce", ["get", key], -1],
        missingColor, 0,
        "#eff6ff", 60, 
        "#bfdbfe", 80, 
        "#60a5fa", 100, 
        "#2563eb", 120, 
        "#1e3a8a"
      ];
    }
  }, [metricKey, mode]);

  // 找回地名层 ID
  const onMapLoad = (e) => {
    const layers = e.target.getStyle().layers;
    const labelLayer = layers.find(l => l.type === 'symbol' && l.layout?.['text-field']);
    if (labelLayer) setLabelLayerId(labelLayer.id);
  };

  // 图例配置
  const legendItems = mode === "raw" 
    ? [ { c: "#eff6ff", t: "< 24" }, { c: "#bfdbfe", t: "24-28" }, { c: "#60a5fa", t: "28-32" }, { c: "#2563eb", t: "32-36" }, { c: "#1e3a8a", t: "> 36" } ]
    : [ { c: "#eff6ff", t: "< 60" }, { c: "#bfdbfe", t: "60-80" }, { c: "#60a5fa", t: "80-100" }, { c: "#2563eb", t: "100-120" }, { c: "#1e3a8a", t: "> 120" } ];

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
              paint={{ "fill-color": fillColorExpr, "fill-opacity": 0.7 }}
            />
            
            {/* 悬停高亮边框 */}
            <Layer
              id="borough-hover-outline"
              type="line"
              beforeId={labelLayerId}
              filter={["==", ["get", "LAD22CD"], hoveredId || ""]}
              paint={{ "line-color": "#f59e0b", "line-width": 3 }}
            />

            {/* 选中高亮边框 */}
            <Layer
              id="borough-select-outline"
              type="line"
              filter={["==", ["get", "LAD22CD"], selectedId || ""]}
              paint={{ "line-color": "#ef4444", "line-width": 3 }}
            />
          </Source>
        )}

        {/* Legend 图例 */}
        <div style={{
          position: "absolute", bottom: "30px", left: "20px",
          background: "white", padding: "12px", borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)", fontSize: "11px", zIndex: 20
        }}>
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
            {mode === "raw" ? "NO₂ Intensity (µg/m³)" : "Total Population Burden"}
          </div>
          {legendItems.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
              <div style={{ width: "12px", height: "12px", background: item.c, marginRight: "8px", borderRadius: "2px" }} />
              <span style={{ color: "#666" }}>{item.t}</span>
            </div>
          ))}
        </div>

        {hoverPopup && (
          <Popup longitude={hoverPopup.lng} latitude={hoverPopup.lat} closeButton={false} offset={10}>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{hoverPopup.props.LAD22NM}</div>
          </Popup>
        )}
      </Map>
    </div>
  );
}