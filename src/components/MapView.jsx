import { useMemo, useState, useEffect } from "react";
import Map, { Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

/* ===========================
   🔹 手写 bbox 计算函数
=========================== */
function getFeatureBounds(feature) {
  if (!feature?.geometry?.coordinates) return null;

  let coords = [];

  const collectCoords = (arr) => {
    if (typeof arr[0] === "number") {
      coords.push(arr);
    } else {
      arr.forEach(collectCoords);
    }
  };

  collectCoords(feature.geometry.coordinates);

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  coords.forEach(([x, y]) => {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  });

  return [
    [minX, minY],
    [maxX, maxY],
  ];
}

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

  /* ===========================
     🎯 自动聚焦逻辑
  =========================== */
  useEffect(() => {
    if (!selectedId || !mapRef?.current || !data) return;

    const map = mapRef.current.getMap();

    const feature = data.features.find(
      (f) => f.properties?.LAD22CD === selectedId
    );

    if (!feature) return;

    const bounds = getFeatureBounds(feature);
    if (!bounds) return;

    map.resize();

    map.fitBounds(bounds, {
      padding: 60,
      duration: 900,
      maxZoom: 12,
    });
  }, [selectedId, data, mapRef]);

  /* ===========================
     🎨 强化对立色阶
  =========================== */
  const fillColorExpr = useMemo(() => {
    const missing = "#f1f5f9";

    // ===========================
    // RAW = 冷理性蓝（技术感）
    // ===========================
    if (mode === "raw") {
      return [
        "step",
        ["coalesce", ["get", "NO2"], -1],
        missing,

        0,
        "#f8fafc",   // 几乎白蓝

        24,
        "#dbeafe",

        28,
        "#93c5fd",

        32,
        "#3b82f6",

        36,
        "#1d4ed8",

        40,
        "#0f172a",   // 深冷蓝（接近黑蓝）
      ];
    }

    // ===========================
    // BURDEN = 冷灰 → 红 → 深红
    // ===========================
    return [
      "step",
      ["coalesce", ["get", "burdenRatio"], -1],
      missing,

      0,
      "#e2e8f0",   // 冷灰（低负担）

      0.85,
      "#fecaca",

      0.95,
      "#fca5a5",

      1.05,
      "#ef4444",

      1.2,
      "#b91c1c",

      1.4,
      "#7f1d1d",
    ];
  }, [mode]);

  /* 🔥 三、模式切换时强制 repaint (优化位置) */
  useEffect(() => {
    const map = mapRef?.current?.getMap?.();
    if (!map) return;
    map.triggerRepaint();
  }, [mode, mapRef]);

  const onMapLoad = (e) => {
    const layers = e.target.getStyle().layers;
    const labelLayer = layers.find(
      (l) => l.type === "symbol" && l.layout?.["text-field"]
    );
    if (labelLayer) setLabelLayerId(labelLayer.id);
  };

  /* ===========================
     Tooltip
  =========================== */
  const tooltip = useMemo(() => {
    if (!hoverPopup?.props) return null;
    const p = hoverPopup.props;
    const name = p.LAD22NM || "Borough";

    if (mode === "raw") {
      return {
        title: name,
        lines: [
          `NO₂: ${formatNum(p.NO2, 1)} µg/m³`,
          "Click to compare ranking under both views.",
        ],
      };
    }

    return {
      title: name,
      lines: [
        `Burden ratio (color): ${formatNum(p.burdenRatio, 2)}×`,
        `Burden share: ${formatPct01(p.burdenShare, 1)}`,
        `Population share: ${formatPct01(
          p.populationShare ?? p.popShare,
          2
        )}`,
        "Click to compare ranking under both views.",
      ],
    };
  }, [hoverPopup, mode]);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: -0.12,
          latitude: 51.5,
          zoom: 9.5,
        }}
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
          setHoverPopup({
            x: e.point?.x,
            y: e.point?.y,
            props: f.properties,
          });
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
          <Source
            id="boroughs"
            type="geojson"
            data={data}
            promoteId="LAD22CD"
          >
            {/* 🔥 一、给 fill layer 加颜色过渡 */}
            <Layer
              id="borough-fill"
              type="fill"
              beforeId={labelLayerId}
              paint={{
                "fill-color": fillColorExpr,
                "fill-opacity": 0.88,
                "fill-color-transition": {
                  duration: 600,
                  delay: 0,
                },
                "fill-opacity-transition": {
                  duration: 400,
                },
              }}
            />

            {/* 🔥 二、修改 spotlight outline：黑色强化 + Transition */}
            <Layer
              id="borough-spotlight-outline"
              type="line"
              beforeId={labelLayerId}
              filter={["==", ["get", "LAD22CD"], spotlightId || ""]}
              paint={{
                "line-color": "#0f172a",
                "line-width": 3,
                "line-opacity": 0.95,
                "line-width-transition": { duration: 400 },
                "line-opacity-transition": { duration: 300 },
              }}
            />

            {/* 🔥 四、hover outline 也加 transition */}
            <Layer
              id="borough-hover-outline"
              type="line"
              beforeId={labelLayerId}
              filter={["==", ["get", "LAD22CD"], hoveredId || ""]}
              paint={{
                "line-color": "#f59e0b",
                "line-width": 3,
                "line-width-transition": { duration: 200 },
              }}
            />

            {/* 🔥 二、修改 selected outline：蓝色强化 + Transition */}
            <Layer
              id="borough-select-outline"
              type="line"
              filter={["==", ["get", "LAD22CD"], selectedId || ""]}
              paint={{
                "line-color": "#1e40af",
                "line-width": 3.5,
                "line-opacity": 0.95,
                "line-width-transition": { duration: 300 },
              }}
            />
          </Source>
        )}
      </Map>

      {/* Tooltip */}
      {tooltip && hoverPopup?.x != null && hoverPopup?.y != null && (
        <div
          style={{
            position: "absolute",
            left: hoverPopup.x + 12,
            top: hoverPopup.y + 12,
            pointerEvents: "none",
            background: "rgba(255,255,255,0.96)",
            border: "1px solid #e2e8f0",
            borderRadius: 14,
            padding: "10px 12px",
            maxWidth: 260,
            boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
          }}
        >
          <div style={{ fontWeight: 900 }}>{tooltip.title}</div>
          <div style={{ fontSize: 12.5, lineHeight: 1.4 }}>
            {tooltip.lines.map((t, i) => (
              <div key={i}>{t}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}