import { useMemo, useState } from "react";
import Map, { Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

function formatNum(x, digits = 2) {
  if (x === null || x === undefined || Number.isNaN(Number(x))) return "N/A";
  return Number(x).toFixed(digits);
}

function formatPct01(x, digits = 1) {
  if (x === null || x === undefined || Number.isNaN(Number(x))) return "N/A";
  return `${(Number(x) * 100).toFixed(digits)}%`;
}

export default function MapView({
  data,
  mode,
  mapRef,
  selectedId,
  onSelectedId,
  hoveredId,
  onHoveredId,
  spotlightId,
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
    const labelLayer = layers.find((l) => l.type === "symbol" && l.layout?.["text-field"]);
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

    // ✅ weighted: 颜色依据是 burdenRatio，但同时显示 share，避免“7% 为什么红”的误解
    const ratio = p.burdenRatio;
    const burdenShare = p.burdenShare; // 0~1
    const popShare = p.populationShare ?? p.popShare; // 0~1

    return {
      title: name,
      lines: [
        `Burden ratio (color): ${formatNum(ratio, 2)}×`,
        `Burden share: ${formatPct01(burdenShare, 1)}`,
        `Population share: ${formatPct01(popShare, 2)}`,
        `1.00 = proportional (share ÷ share)`,
      ],
    };
  }, [hoverPopup, mode]);

  const showMeaningCard = mode !== "raw";

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

            {/* ✅ Spotlight（模式切换后的“后果”更强） */}
            <Layer
              id="borough-spotlight-outline"
              type="line"
              beforeId={labelLayerId}
              filter={["==", ["get", "LAD22CD"], spotlightId || ""]}
              paint={{
                "line-color": "#111827",
                "line-width": 2.5,
                "line-opacity": 0.85,
              }}
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

      {/* ✅ 小型“意义卡片”：补全 legend 解释（不替代 App 的 LegendCard） */}
      {showMeaningCard && (
        <div
          style={{
            position: "absolute",
            right: 16,
            bottom: 16,
            zIndex: 1200,
            width: 320,
            background: "rgba(255,255,255,0.92)",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            padding: "10px 12px",
            boxShadow: "0 10px 24px rgba(0,0,0,0.10)",
            backdropFilter: "blur(8px)",
            pointerEvents: "none",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>
            Color meaning
          </div>
          <div style={{ marginTop: 6, fontSize: 12.5, color: "#334155", lineHeight: 1.35 }}>
            Map color encodes <strong>burden ratio</strong> ={" "}
            <strong>burden share</strong> ÷ <strong>population share</strong>.
            <div style={{ marginTop: 6, color: "#475569" }}>
              A borough can be red even if its burden share is small, if its population share is even smaller.
            </div>
          </div>
        </div>
      )}

      {/* ✅ Hover tooltip */}
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
            maxWidth: 260,
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 6, color: "#111827" }}>{tooltip.title}</div>
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