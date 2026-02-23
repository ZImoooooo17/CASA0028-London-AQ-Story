import { useRef, useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [showRankingCue, setShowRankingCue] = useState(false);

  const { data, error } = useLondonData();
  const mapRef = useRef(null);

  // 🎬 Dramatic cue when switching to Burden view
  useEffect(() => {
    if (mode === "weighted") {
      setShowRankingCue(true);
      const t = setTimeout(() => setShowRankingCue(false), 800);
      return () => clearTimeout(t);
    }
  }, [mode]);

  const findFeatureById = (id) => {
    if (!id || !data?.features?.length) return null;
    const sid = String(id);
    return data.features.find(
      (f) =>
        String(f?.id) === sid ||
        String(f?.properties?.LAD22CD) === sid
    );
  };

  const selectedFeature = selectedId
    ? findFeatureById(selectedId)
    : null;

  const isLoading = !data;

  if (error) return <div style={{ padding: 24 }}>Load Error.</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {showIntro && (
        <IntroModal
          data={data}
          onStart={() => setShowIntro(false)}
          onSelectCase={(id) => {
            setMode("weighted");
            setShowIntro(false);
            setTimeout(() => setSelectedId(id), 500);
          }}
        />
      )}

      {/* Header */}
      <header
        style={{
          background: "#fff",
          borderBottom: "1px solid #e2e8f0",
          padding: "18px 28px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>
          Average Air, Uneven Burdens
        </h1>

        <div
          style={{
            fontSize: 14,
            color: "#64748b",
            marginTop: 8,
            maxWidth: 760,
            lineHeight: 1.6,
          }}
        >
          Air pollution in London is often reduced to an average.
          But averages can flatten difference. When exposure is
          weighted by population, boroughs shift position —
          and the geography of concern changes.
        </div>
      </header>

      {/* Main Interactive */}
      <section style={{ position: "relative" }}>
        <div style={{ display: "flex", height: "75vh" }}>
          <aside
            style={{
              flex: "0 0 360px",
              background: "rgba(255,255,255,0.98)",
              borderRight: "1px solid #e2e8f0",
              overflowY: "auto",
            }}
          >
            {!isLoading && (
              <BarRankChart
                data={data}
                mode={mode}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onHover={setHoveredId}
              />
            )}
          </aside>

          <main style={{ flex: 1, position: "relative" }}>
            {!isLoading && (
              <>
                <MapView
                  data={data}
                  mode={mode}
                  mapRef={mapRef}
                  selectedId={selectedId}
                  onSelectedId={setSelectedId}
                  hoveredId={hoveredId}
                  onHoveredId={setHoveredId}
                />

                {/* Dramatic ranking cue */}
                <AnimatePresence>
                  {showRankingCue && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      style={{
                        position: "absolute",
                        top: "40%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        background: "rgba(15,23,42,0.92)",
                        color: "white",
                        padding: "18px 28px",
                        borderRadius: 20,
                        fontWeight: 800,
                        fontSize: 16,
                        textAlign: "center",
                        zIndex: 100,
                        pointerEvents: "none",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
                      }}
                    >
                      <div>The ranking has changed.</div>
                      <div
                        style={{
                          marginTop: 6,
                          fontWeight: 600,
                          fontSize: 14,
                          opacity: 0.85,
                        }}
                      >
                        Who rises now?
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div style={{ position: "absolute", top: 16, left: 16 }}>
                  <ModeToggle
                    mode={mode}
                    onMode={(next) => {
                      setSelectedId(null);
                      setMode(next);
                    }}
                  />
                </div>

                <div style={{ position: "fixed", bottom: 24, right: 24 }}>
                  <Legend mode={mode} />
                </div>

                {selectedId && selectedFeature && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: 400,
                      height: "100%",
                      background: "#fff",
                      borderLeft: "1px solid #e2e8f0",
                      overflowY: "auto",
                      boxShadow: "-10px 0 20px rgba(0,0,0,0.05)",
                    }}
                  >
                    <DetailPanel
                      selectedFeature={selectedFeature}
                      mode={mode}
                      onClose={() => setSelectedId(null)}
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </section>

      {/* Conditional Punchline Section */}
      <AnimatePresence>
  {mode === "weighted" && (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: "#ffffff",
        borderTop: "1px solid #e2e8f0",
        padding: "80px 28px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        
        {/* Headline */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            marginBottom: 40,
          }}
        >
          When population is considered,
          London is reordered.
        </div>

        {/* Punchline */}
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            lineHeight: 1.6,
            marginBottom: 60,
          }}
        >
          The ranking has changed.
          <br />
          So has the map of concern.
        </div>

        {/* Evidence Block */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 80,
            flexWrap: "wrap",
            marginBottom: 40,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                color: "#64748b",
                marginBottom: 6,
                fontWeight: 700,
              }}
            >
              Largest upward shift
            </div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>
              Croydon
            </div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>
              +17 places
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                color: "#64748b",
                marginBottom: 6,
                fontWeight: 700,
              }}
            >
              Largest downward shift
            </div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>
              City of London
            </div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>
              –32 places
            </div>
          </div>
        </div>

        {/* Closing Summary */}
        <div
          style={{
            fontSize: 15,
            color: "#475569",
            maxWidth: 600,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Dense boroughs rise in concern
          even when raw concentration is not highest.
        </div>

      </div>
    </motion.section>
  )}
</AnimatePresence>

      {/* Footer */}
      <footer
        style={{
          padding: "40px 28px",
          background: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <strong>What does this experiment reveal?</strong>
          <p
            style={{
              marginTop: 12,
              lineHeight: 1.7,
              color: "#475569",
            }}
          >
            When we change the metric, we change which boroughs demand
            attention. Measurement is not neutral — it shapes what
            becomes visible, and therefore what becomes urgent.
          </p>
        </div>
      </footer>
    </div>
  );
}


