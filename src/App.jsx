import { useRef, useState, useMemo } from "react";
import maplibregl from "maplibre-gl";
import IntroModal from "./components/IntroModal";
import MapView from "./components/MapView";
import BarRankChart from "./components/BarRankChart";
import DetailPanel from "./components/DetailPanel";
import ModeToggle from "./components/ModeToggle";
import Legend from "./components/Legend";
import useLondonData from "./hooks/useLondonData";

export default function App() {
  const [mode, setMode] = useState("raw");
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [showIntro, setShowIntro] = useState(true);

  const { data, error } = useLondonData();
  const mapRef = useRef(null);

  const findFeatureById = (id) => {
    if (!id || !data?.features?.length) return null;
    const sid = String(id);
    return data.features.find(
      (f) =>
        String(f?.id) === sid ||
        String(f?.properties?.LAD22CD) === sid
    );
  };

  const flyToFeature = (id) => {
    const map = mapRef.current?.getMap?.();
    const feature = findFeatureById(id);
    if (!map || !feature) return;

    const bounds = new maplibregl.LngLatBounds();

    const extendCoords = (c) => {
      if (typeof c[0] === "number" && typeof c[1] === "number") {
        bounds.extend(c);
      } else if (Array.isArray(c)) {
        c.forEach(extendCoords);
      }
    };

    extendCoords(feature.geometry.coordinates);

    map.resize();
    map.fitBounds(bounds, {
      padding: { top: 60, bottom: 60, left: 60, right: id ? 420 : 60 },
      duration: 1000,
    });
  };

  const handleSelect = (id) => {
    setSelectedId(id);
    if (id && data) requestAnimationFrame(() => flyToFeature(id));
  };

  if (error) return <div style={{ padding: 24 }}>Load Error.</div>;
  const isLoading = !data;
  const selectedFeature = selectedId ? findFeatureById(selectedId) : null;

  /* ---------- Rank Reordering Calculation ---------- */

  const rankExtremes = useMemo(() => {
    if (!data?.features?.length) return null;

    const features = data.features.map((f) => ({
      name: f.properties.LAD22NM,
      rawRank: f.properties.rawRank,
      weightedRank: f.properties.weightedRank,
      jump: f.properties.rankJump,
    }));

    const upward = [...features]
      .filter((f) => f.jump > 0)
      .sort((a, b) => b.jump - a.jump)[0];

    const downward = [...features]
      .filter((f) => f.jump < 0)
      .sort((a, b) => a.jump - b.jump)[0];

    return { upward, downward };
  }, [data]);

  return (
    <div className="storyPage">
      {showIntro && (
        <IntroModal
          data={data}
          onStart={() => setShowIntro(false)}
          onSelectCase={(id) => {
            setMode("weighted");
            setShowIntro(false);
            setTimeout(() => handleSelect(id), 600);
          }}
        />
      )}

      {/* ================= HEADER ================= */}

      <header
        style={{
          height: 78,
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 30px",
          zIndex: 100,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 950,
              margin: 0,
              letterSpacing: "-0.4px",
            }}
          >
            Average Air, Uneven Burdens
          </h1>

          <div
            style={{
              fontSize: 13,
              color: "#475569",
              marginTop: 4,
              lineHeight: 1.4,
            }}
          >
            Average air quality is not neutral. Switching the metric reshapes the map of concern.
          </div>
        </div>

        <div style={{ background: "#0f172a", padding: 4, borderRadius: 12 }}>
          <ModeToggle
            mode={mode}
            onMode={(next) => {
              setSelectedId(null);
              setMode(next);
            }}
          />
        </div>
      </header>

      {/* ================= INTERACTIVE ZONE ================= */}

      <section className="interactiveSection">
        <div className="interactiveShell">
          <aside
            style={{
              flex: "0 0 380px",
              background: "#fff",
              borderRight: "1px solid #e2e8f0",
              overflowY: "auto",
            }}
          >
            {!isLoading && (
              <BarRankChart
                data={data}
                mode={mode}
                selectedId={selectedId}
                onSelect={handleSelect}
                onHover={setHoveredId}
              />
            )}
          </aside>

          <main style={{ flex: "1 1 auto", position: "relative" }}>
            {!isLoading && (
              <>
                <MapView
                  data={data}
                  mode={mode}
                  mapRef={mapRef}
                  selectedId={selectedId}
                  onSelectedId={handleSelect}
                  hoveredId={hoveredId}
                  onHoveredId={setHoveredId}
                />
                <Legend mode={mode} defaultOpen={false} anchor="top-left" />
              </>
            )}
          </main>

          <aside
            style={{
              flex: selectedId ? "0 0 420px" : "0",
              opacity: selectedId ? 1 : 0,
              transition: "all 0.3s ease",
              background: "#fff",
              borderLeft: selectedId ? "1px solid #e2e8f0" : "none",
              overflowY: "auto",
            }}
          >
            {selectedFeature && (
              <DetailPanel
                selectedFeature={selectedFeature}
                mode={mode}
                onClose={() => setSelectedId(null)}
              />
            )}
          </aside>
        </div>
      </section>

      {/* ================= RANK REORDERING SECTION ================= */}

      {rankExtremes && (
        <section
          style={{
            background: "#ffffff",
            borderTop: "1px solid #e2e8f0",
            padding: "50px 30px",
          }}
        >
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 30 }}>
              When population is considered, London is reordered
            </h2>

            <div style={{ display: "flex", gap: 80 }}>
              {rankExtremes.upward && (
                <div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>
                    Largest upward shift
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>
                    {rankExtremes.upward.name}
                  </div>
                  <div style={{ fontSize: 14 }}>
                    +{rankExtremes.upward.jump} places
                  </div>
                </div>
              )}

              {rankExtremes.downward && (
                <div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>
                    Largest downward shift
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>
                    {rankExtremes.downward.name}
                  </div>
                  <div style={{ fontSize: 14 }}>
                    {rankExtremes.downward.jump} places
                  </div>
                </div>
              )}
            </div>

            <p
              style={{
                marginTop: 25,
                fontSize: 14,
                color: "#475569",
              }}
            >
              Dense boroughs rise in concern, even when their raw concentration is not the highest.
            </p>
          </div>
        </section>
      )}

      {/* ================= REFLECTION ================= */}

      <footer
        style={{
          padding: "40px 30px",
          background: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
          fontSize: 14,
          color: "#475569",
          lineHeight: 1.6,
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <strong>What does this interface show?</strong>
          <p style={{ marginTop: 12 }}>
            By changing the metric, we change which boroughs appear most concerning.
            Measurement is not neutral. It shapes spatial visibility and political priority.
          </p>
        </div>
      </footer>
    </div>
  );
}




