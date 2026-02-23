import { useMemo, useState, useEffect } from "react";
import Map, { Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

/* ===========================
   工具函数
=========================== */
function getFeatureBounds(feature) {
  if (!feature?.geometry?.coordinates) return null;
  let coords = [];
  const collect = (arr) => {
    if (typeof arr[0] === "number") coords.push(arr);
    else arr.forEach(collect);
  };
  collect(feature.geometry.coordinates);

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  coords.forEach(([x, y]) => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });

  return [[minX, minY], [maxX, maxY]];
}

function formatNum(x, digits = 2) {
  const n = Number(x);
  return Number.isFinite(n) ? n.toFixed(digits) : "N/A";
}

function formatPct01(x, digits = 1) {
  const n = Number(x);
  return Number.isFinite(n)
    ? `${(n * 100).toFixed(digits)}%`
    : "N/A";
}

/* ===========================
   主组件
=========================== */
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

  /* 自动缩放 */
  useEffect(() => {
    if (!selectedId || !mapRef?.current || !data) return;

    const timerId = setTimeout(() => {
      const map = mapRef.current?.getMap();
      if (!map) return;

      const feature = data.features.find(
        (f) =>
          String(f.properties?.LAD22CD) ===
          String(selectedId)
      );
      if (!feature) return;

      const bounds = getFeatureBounds(feature);
      if (!bounds) return;

      map.fitBounds(bounds, {
        padding: {
          top: 80,
          bottom: 80,
          left: 340,
          right: 450,
        },
        duration: 800,
        maxZoom: 10,
        essential: true,
      });
    }, 150);

    return () => clearTimeout(timerId);
  }, [selectedId, data, mapRef]);

  useEffect(() => {
    // 如果当前有选中区域，就不要做模式呼吸
    if (selectedId) return;
    if (!mapRef?.current) return;
  
    const map = mapRef.current.getMap();
    if (!map) return;
  
    const currentZoom = map.getZoom();
  
    // 微呼吸：放大
    map.easeTo({
      zoom: currentZoom + 0.2,
      duration: 600,
      easing: (t) => 1 - Math.pow(1 - t, 3)
    });
  
    // 再回到原位
    const timer = setTimeout(() => {
      map.easeTo({
        zoom: currentZoom,
        duration: 600,
        easing: (t) => 1 - Math.pow(1 - t, 3)
      });
    }, 600);
  
    return () => clearTimeout(timer);
  
  }, [mode]);

  /* 填充颜色 */
  const fillColorExpr = useMemo(() => {
    const missing = "#f1f5f9";

    if (mode === "raw") {
      return [
        "step",
        ["coalesce", ["get", "NO2"], -1],
        missing,
        0,
        "#f8fafc",
        24,
        "#dbeafe",
        28,
        "#93c5fd",
        32,
        "#3b82f6",
        36,
        "#1d4ed8",
        40,
        "#0f172a",
      ];
    }

    return [
      "step",
      ["coalesce", ["get", "burdenRatio"], -1],
      missing,
      0,
      "#e2e8f0",
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

  const tooltip = useMemo(() => {
    if (!hoverPopup?.props) return null;
    const p = hoverPopup.props;

    if (mode === "raw") {
      return {
        title: p.LAD22NM,
        lines: [
          `NO₂: ${formatNum(p.NO2, 1)} µg/m³`,
        ],
      };
    }

    return {
      title: p.LAD22NM,
      lines: [
        `Burden ratio: ${formatNum(
          p.burdenRatio,
          2
        )}×`,
        `Burden share: ${formatPct01(
          p.burdenShare,
          1
        )}`,
        `Population share: ${formatPct01(
          p.populationShare ??
            p.popShare,
          1
        )}`,
      ],
    };
  }, [hoverPopup, mode]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
      }}
    >
      <Map
        ref={mapRef}
        style={{ width: "100%", height: "100%" }}
        initialViewState={{
          longitude: -0.12,
          latitude: 51.5,
          zoom: 9.5,
        }}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        interactiveLayerIds={[
          "borough-fill",
        ]}
        onLoad={(e) => {
          const layers =
            e.target.getStyle().layers;
          const labelLayer =
            layers.find(
              (l) =>
                l.type === "symbol" &&
                l.layout?.["text-field"]
            );
          if (labelLayer)
            setLabelLayerId(labelLayer.id);
        }}
        onMouseMove={(e) => {
          const f = e.features?.[0];
          if (!f) {
            onHoveredId?.(null);
            setHoverPopup(null);
            return;
          }
          console.log(f.properties);
          onHoveredId?.(
            String(
              f.properties?.LAD22CD ?? ""
            )
          );
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
          if (f) {
            onSelectedId?.(
              String(
                f.properties?.LAD22CD ??
                  ""
              )
            );
          }
        }}
      >
        {data && (
          <Source
            id="boroughs"
            type="geojson"
            data={data}
            promoteId="LAD22CD"
          >
            {/* 主填充层：选中前景化 */}
            <Layer
              id="borough-fill"
              type="fill"
              beforeId={labelLayerId}
              paint={{
                "fill-color":
                  fillColorExpr,
                  "fill-opacity": [
                    "case",
                    ["==", ["get", "LAD22CD"], String(selectedId || "")],
                    0.95,
                    [
                      "case",
                      ["==", String(selectedId || ""), ""],
                      0.88,   // 没有选中时保持原始强度
                      0.35    // 有选中时其他退后
                    ]
                  ],
              }}
            />

            {/* 选中光晕 */}
            <Layer
              id="borough-select-glow"
              type="line"
              filter={[
                "==",
                ["get", "LAD22CD"],
                String(
                  selectedId || ""
                ),
              ]}
              paint={{
                "line-color":
                  "#ffffff",
                "line-width": 6,
                "line-opacity": 0.7,
              }}
            />

            {/* 选中主描边 */}
            <Layer
              id="borough-select-outline"
              type="line"
              filter={[
                "==",
                ["get", "LAD22CD"],
                String(
                  selectedId || ""
                ),
              ]}
              paint={{
                "line-color":
                  "#1e40af",
                "line-width": 4,
              }}
            />

            {/* Hover 描边 */}
            <Layer
              id="borough-hover-outline"
              type="line"
              filter={[
                "==",
                ["get", "LAD22CD"],
                String(
                  hoveredId || ""
                ),
              ]}
              paint={{
                "line-color":
                  "#f59e0b",
                "line-width": 3,
              }}
            />
          </Source>
        )}
      </Map>

      {tooltip && hoverPopup && (
        <div
          style={{
            position: "absolute",
            left: hoverPopup.x + 12,
            top: hoverPopup.y + 12,
            pointerEvents: "none",
            background:
              "rgba(255,255,255,0.96)",
            border:
              "1px solid #e2e8f0",
            borderRadius: 14,
            padding: "10px 12px",
            boxShadow:
              "0 10px 24px rgba(0,0,0,0.12)",
            zIndex: 100,
          }}
        >
          <div
            style={{
              fontWeight: 900,
            }}
          >
            {tooltip.title}
          </div>
          <div
            style={{
              fontSize: 12.5,
              lineHeight: 1.4,
            }}
          >
            {tooltip.lines.map(
              (t, i) => (
                <div key={i}>{t}</div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}