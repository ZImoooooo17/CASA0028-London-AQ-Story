import { useRef, useState, useMemo } from "react";
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

  const handleSelect = (id) => {
    setSelectedId(id);
  };

  if (error) return <div style={{ padding: 24 }}>Load Error.</div>;
  const isLoading = !data;
  const selectedFeature = selectedId ? findFeatureById(selectedId) : null;

  /* ================= RANK REORDERING ================= */

  const rankExtremes = useMemo(() => {
    if (!data?.features?.length) return null;

    const features = data.features.map((f) => ({
      id: f.properties.LAD22CD,
      name: f.properties.LAD22NM,
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
            setTimeout(() => setSelectedId(id), 600);
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
          <h1 style={{ fontSize: 20, fontWeight: 950, margin: 0 }}>
            Average Air, Uneven Burdens
          </h1>
          <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>
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

          {/* LEFT LIST */}
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

          {/* MAP */}
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

          {/* RIGHT PANEL */}
          {selectedId && selectedFeature && (
            <aside
              style={{
                flex: "0 0 420px",
                background: "#fff",
                borderLeft: "1px solid #e2e8f0",
                overflowY: "auto",
              }}
            >
              <DetailPanel
                selectedFeature={selectedFeature}
                mode={mode}
                onClose={() => setSelectedId(null)}
              />
            </aside>
          )}
        </div>
      </section>

      {/* ================= CLICKABLE RANK SECTION ================= */}

      {rankExtremes && (
        <section
          style={{
            background: "#ffffff",
            borderTop: "1px solid #e2e8f0",
            padding: "50px 30px",
          }}
        >
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <h2 style={{ fontSize: 18, fontWeight: 900 }}>
              When population is considered, London is reordered
            </h2>

            <div style={{ display: "flex", gap: 80, marginTop: 30 }}>
              
              {rankExtremes.upward && (
                <div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>
                    Largest upward shift
                  </div>

                  <div
                    onClick={() => {
                      setMode("weighted");
                      setSelectedId(rankExtremes.upward.id);
                    }}
                    style={{
                      fontWeight: 900,
                      cursor: "pointer",
                      fontSize: 16,
                      marginTop: 4,
                    }}
                  >
                    {rankExtremes.upward.name}
                  </div>

                  <div>+{rankExtremes.upward.jump} places</div>
                </div>
              )}

              {rankExtremes.downward && (
                <div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>
                    Largest downward shift
                  </div>

                  <div
                    onClick={() => {
                      setMode("weighted");
                      setSelectedId(rankExtremes.downward.id);
                    }}
                    style={{
                      fontWeight: 900,
                      cursor: "pointer",
                      fontSize: 16,
                      marginTop: 4,
                    }}
                  >
                    {rankExtremes.downward.name}
                  </div>

                  <div>{rankExtremes.downward.jump} places</div>
                </div>
              )}
            </div>

            <p style={{ marginTop: 25, color: "#475569" }}>
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




