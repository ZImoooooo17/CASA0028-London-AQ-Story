import { useMemo, useState } from "react";
import Map, { Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

function formatNum(x, digits = 2) {
  if (x === null || x === undefined || Number.isNaN(Number(x))) return "N/A";
  return Number(x).toFixed(digits);
}

export default function MapView({
  data,
  mode,
  mapRef,
  selectedId,
  onSelectedId,
  hoveredId,
  onHoveredId,
}) {
  const [hoverPopup, setHoverPopup] = useState(null);
  const [labelLayerId, setLabelLayerId] = useState(null);

  // 色阶表达：与 legend 分段一致
  const fillColorExpr = useMemo(() => {
    const missingColor = "#f3f4f6";

    if (mode === "raw") {
      return [
        "step",
        ["coalesce", ["get", "NO2"], -1],
        missingColor,
        0,
        "#eff6ff",
        24,
        "#bfdbfe",
        28,
        "#60a5fa",
        32,
        "#2563eb",
        36,
        "#1e3a8a",
      ];
    }

    return [
      "step",
      ["coalesce", ["get", "burdenRatio"], -1],
      missingColor,
      0,
      "#3182ce",
      0.8,
      "#93c5fd",
      0.95,
      "#cbd5e0",
      1.05,
      "#fca5a5",
      1.2,
      "#e53e3e",
    ];
  }, [mode]);

  const onMapLoad = (e) => {
    const layers = e.target.getStyle().layers;
    const labelLayer = layers.find(
      (l) => l.type === "symbol" && l.layout?.["text-field"]
    );
    if (labelLayer) setLabelLayerId(labelLayer.id);
  };

  const tooltip = useMemo(() => {
    if (!hoverPopup?.props) return null;
    const p = hoverPopup.props;
    const name = p.LAD22NM || "Borough";

    if (mode === "raw") {
      const no2 = p.NO2;
      return {
        title: name,
        lines: [`NO₂: ${formatNum(no2, 1)} µg/m³`],
      };
    }

    const ratio = p.burdenRatio;
    return {
      title: name,
      lines: [
        `Burden ratio: ${formatNum(ratio, 2)}`,
        `1.00 = proportional burden`,
      ],
    };
  }, [hoverPopup, mode]);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
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
            setHoverPopup({
              lng: e.lngLat.lng,
              lat: e.lngLat.lat,
              x: e.point?.x,
              y: e.point?.y,
              props: f.properties,
            });
          } else {
            onHoveredId(null);
            setHoverPopup(null);
          }
        }}
        onMouseLeave={() => {
          onHoveredId(null);
          setHoverPopup(null);
        }}
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
      </Map>

      {/* ✅ Hover tooltip（关键：之前你算了 hoverPopup 但没渲染） */}
      {tooltip && hoverPopup?.x != null && hoverPopup?.y != null && (
        <div
          style={{
            position: "absolute",
            left: hoverPopup.x + 12,
            top: hoverPopup.y + 12,
            zIndex: 2000,
            pointerEvents: "none",
            background: "rgba(255,255,255,0.95)",
            border: "1px solid #e2e8f0",
            borderRadius: 14,
            padding: "10px 12px",
            boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
            maxWidth: 240,
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 6, color: "#111827" }}>
            {tooltip.title}
          </div>
          <div style={{ fontSize: 12.5, color: "#334155", lineHeight: 1.35 }}>
            {tooltip.lines.map((t, i) => (
              <div key={i}>{t}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
