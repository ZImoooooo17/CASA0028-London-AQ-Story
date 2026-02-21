import { useMemo, useState, useRef, useEffect } from "react";
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
  selectedId,     // ✅ LAD22CD
  onSelectedId,   // ✅ expects LAD22CD
  hoveredId,      // ✅ LAD22CD
  onHoveredId,    // ✅ expects LAD22CD
  spotlightId,    // ✅ LAD22CD
}) {
  const wrapperRef = useRef(null);
  const [hoverPopup, setHoverPopup] = useState(null);
  const [labelLayerId, setLabelLayerId] = useState(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const map = mapRef.current?.getMap?.();
      if (map) map.resize();
    });

    ro.observe(el);

    const map = mapRef.current?.getMap?.();
    if (map) map.resize();

    return () => ro.disconnect();
  }, [mapRef]);

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
      "case",
      ["!", ["has", "burdenRatio"]],
      missingColor,
      [
        "interpolate",
        ["linear"],
        ["to-number", ["get", "burdenRatio"]],
        0.7,
        "#2563eb",
        1.0,
        "#f3f4f6",
        1.3,
        "#dc2626",
      ],
    ];
  }, [mode]);

  const onMapLoad = (e) => {
    const layers = e.target.getStyle().layers;
    const labelLayer = layers?.find((l) => l.type === "symbol" && l.layout?.["text-field"]);
    if (labelLayer) setLabelLayerId(labelLayer.id);

    const map = mapRef.current?.getMap?.();
    if (map) map.resize();
  };

  const tooltip = useMemo(() => {
    if (!hoverPopup?.props) return null;
    const p = hoverPopup.props;
    const name = p.LAD22NM || "Borough";

    if (mode === "raw") {
      return { title: name, lines: [`NO₂: ${formatNum(p.NO2, 1)} µg/m³`] };
    }

    return {
      title: name,
      lines: [
        `Burden ratio (color): ${formatNum(p.burdenRatio, 2)}×`,
        `Burden share: ${formatPct01(p.burdenShare, 1)}`,
        `Population share: ${formatPct01(p.populationShare ?? p.popShare, 2)}`,
        `1.00 = proportional (share ÷ share)`,
      ],
    };
  }, [hoverPopup, mode]);

  return (
    <div ref={wrapperRef} style={{ position: "absolute", inset: 0 }}>
      <Map
        ref={mapRef}
        initialViewState={{ longitude: -0.12, latitude: 51.5, zoom: 9.5 }}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        onLoad={onMapLoad}
        interactiveLayerIds={["borough-fill"]}
        onMouseMove={(e) => {
          const f = e.features?.[0];
          if (f) {
            const code = f.properties?.LAD22CD; // ✅ 统一
            if (code) onHoveredId(code);
            setHoverPopup({
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
        onClick={(e) => {
          const f = e.features?.[0];
          const code = f?.properties?.LAD22CD; // ✅ 统一
          onSelectedId(code || null);
        }}
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
              id="borough-spotlight-outline"
              type="line"
              beforeId={labelLayerId}
              filter={["==", ["get", "LAD22CD"], spotlightId || ""]}
              paint={{ "line-color": "#111827", "line-width": 2.5, "line-opacity": 0.85 }}
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
