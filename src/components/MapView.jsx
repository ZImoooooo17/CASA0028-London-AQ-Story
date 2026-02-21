import { useMemo, useState } from "react";
import Map, { Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

function formatNum(x, digits = 2) {
  const n = Number(x);
  return Number.isFinite(n) ? n.toFixed(digits) : "N/A";
}
function formatPct01(x, digits = 1) {
  const n = Number(x);
  return Number.isFinite(n) ? `${(n * 100).toFixed(digits)}%` : "N/A";
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

  // ✅ 图3：Color meaning 默认收起
  const [meaningOpen, setMeaningOpen] = useState(false);

  const fillColorExpr = useMemo(() => {
    const missing = "#f3f4f6";
    if (mode === "raw") {
      return [
        "step",
        ["coalesce", ["get", "NO2"], -1],
        missing,
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
      missing,
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
      return { title: name, lines: [`NO₂: ${formatNum(p.NO2, 1)} µg/m³`] };
    }

    const ratio = p.burdenRatio;
    const burdenShare = p.burdenShare;
    const popShare = p.populationShare ?? p.popShare;

    return {
      title: name,
      lines: [
        `Burden ratio (color): ${formatNum(ratio, 2)}×`,
        `Burden share: ${formatPct01(burdenShare, 1)}`,
        `Population share: ${formatPct01(popShare, 2)}`,
      ],
    };
  }, [hoverPopup, mode]);

  const showMeaning = mode !== "raw";

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
          if (!f) {
            onHoveredId?.(null);
            setHoverPopup(null);
            return;
          }
          const hid = f.properties?.LAD22CD ?? f.id ?? null;
          onHoveredId?.(hid);
          setHoverPopup({ x: e.point?.x, y: e.point?.y, props: f.properties });
        }}
        onMouseLeave={() => {
          onHoveredId?.(null);
          setHoverPopup(null);
        }}
        onClick={(e) => {
          const f = e.features?.[0];
          const id = f?.properties?.LAD22CD ?? f?.id ?? null;
          onSelectedId?.(id);
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

      {/* ✅ 图3：Color meaning 可折叠 */}
      {showMeaning && (
        <div style={{ position: "absolute", right: 12, bottom: 12, zIndex: 120, pointerEvents: "auto" }}>
          {!meaningOpen ? (
            <button
              type="button"
              onClick={() => setMeaningOpen(true)}
              aria-label="Show color meaning"
              title="Show color meaning"
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                background: "rgba(255,255,255,0.92)",
                boxShadow: "0 10px 24px rgba(0,0,0,0.10)",
                cursor: "pointer",
                fontWeight: 900,
                color: "#0f172a",
                backdropFilter: "blur(8px)",
              }}
            >
              i
            </button>
          ) : (
            <div
              style={{
                width: 300,
                background: "rgba(255,255,255,0.92)",
                border: "1px solid #e2e8f0",
                borderRadius: 16,
                padding: "10px 12px",
                boxShadow: "0 10px 24px rgba(0,0,0,0.10)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#64748b",
                    flex: 1,
                  }}
                >
                  Color meaning
                </div>
                <button
                  type="button"
                  onClick={() => setMeaningOpen(false)}
                  aria-label="Hide color meaning"
                  title="Hide"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    background: "white",
                    cursor: "pointer",
                    fontWeight: 900,
                    color: "#0f172a",
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginTop: 6, fontSize: 12.5, color: "#334155", lineHeight: 1.35 }}>
                Map color encodes <strong>burden ratio</strong> = <strong>burden share</strong> ÷{" "}
                <strong>population share</strong>.
                <div style={{ marginTop: 6, color: "#475569" }}>
                  A borough can be red even if its burden share is small, if its population share is even smaller.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tooltip（永远不挡拖动） */}
      {tooltip && hoverPopup?.x != null && hoverPopup?.y != null && (
        <div
          style={{
            position: "absolute",
            left: hoverPopup.x + 12,
            top: hoverPopup.y + 12,
            zIndex: 140,
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