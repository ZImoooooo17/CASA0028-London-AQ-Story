import { useRef, useState, useEffect, useMemo } from "react";
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

  useEffect(() => {
    if (mode === "weighted") {
      setShowRankingCue(true);
      const t = setTimeout(() => setShowRankingCue(false), 800);
      return () => clearTimeout(t);
    }
  }, [mode]);

  /* =============================
     强重排逻辑（基于 rankJump）
  ============================== */
  const shiftStats = useMemo(() => {
    if (!data?.features?.length) return null;

    const shifts = data.features
      .filter(f => typeof f.properties?.rankJump === "number")
      .map(f => ({
        name: f.properties.LAD22NM,
        shift: f.properties.rankJump
      }));

    if (!shifts.length) return null;

    const maxUp = shifts.reduce((a, b) =>
      b.shift > a.shift ? b : a
    );

    const maxDown = shifts.reduce((a, b) =>
      b.shift < a.shift ? b : a
    );

    const avgShift =
      shifts.reduce((sum, s) => sum + Math.abs(s.shift), 0) /
      shifts.length;

    return {
      upward: maxUp,
      downward: maxDown,
      average: avgShift.toFixed(1)
    };
  }, [data]);

  const findFeatureById = (id) => {
    if (!id || !data?.features?.length) return null;
    return data.features.find(
      f => String(f.properties?.LAD22CD) === String(id)
    );
  };

  const selectedFeature = selectedId
    ? findFeatureById(selectedId)
    : null;

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
      <header style={{
        background: "#fff",
        borderBottom: "1px solid #e2e8f0",
        padding: "18px 28px",
      }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>
          Average Air, Uneven Burdens
        </h1>
        <div style={{
          fontSize: 14,
          color: "#64748b",
          marginTop: 8,
          maxWidth: 760,
          lineHeight: 1.6,
        }}>
          Air pollution in London is often reduced to an average.
          But averages flatten difference. When exposure is
          weighted by population, boroughs shift position —
          and the geography of concern changes.
        </div>
      </header>

      {/* Interactive */}
      <section style={{ position: "relative" }}>
        <div style={{ display: "flex", height: "75vh" }}>
          
          <aside style={{
            flex: "0 0 360px",
            background: "#fff",
            borderRight: "1px solid #e2e8f0",
            overflowY: "auto",
          }}>
            {data && (
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
            {data && (
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

                <AnimatePresence>
                  {showRankingCue && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        position: "absolute",
                        top: "42%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        background: "rgba(15,23,42,0.92)",
                        color: "white",
                        padding: "16px 24px",
                        borderRadius: 18,
                        fontWeight: 700,
                        fontSize: 14,
                        zIndex: 100,
                      }}
                    >
                      The ranking has changed.
                    </motion.div>
                  )}
                </AnimatePresence>

                <div style={{ position: "absolute", top: 16, left: 16 }}>
                  <ModeToggle
                    mode={mode}
                    onMode={(next) => setMode(next)}
                  />
                </div>

                <div style={{ position: "fixed", bottom: 24, right: 24 }}>
                  <Legend mode={mode} />
                </div>

                {selectedId && selectedFeature && (
                  <div style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 400,
                    height: "100%",
                    background: "#fff",
                    borderLeft: "1px solid #e2e8f0",
                    overflowY: "auto",
                  }}>
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

      {/* 🔥 Research-style Summary Block */}
      {mode === "weighted" && shiftStats && (
        <section style={{
          background: "#ffffff",
          borderTop: "1px solid #e2e8f0",
          padding: "60px 28px",
        }}>
          <div style={{
            maxWidth: 1000,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: 60,
            alignItems: "center"
          }}>
            
            {/* Left – Narrative */}
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>
                When population is considered, London is reordered.
              </div>

              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>
                The ranking has changed. So has the map of concern.
              </div>

              <div style={{
                fontSize: 14,
                color: "#475569",
                lineHeight: 1.6
              }}>
                Dense boroughs rise in concern even when raw concentration is not highest.
              </div>
            </div>

            {/* Right – Metrics */}
            <div style={{
              background: "#f8fafc",
              borderRadius: 16,
              padding: "24px 28px",
              border: "1px solid #e2e8f0"
            }}>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 8 }}>
                LARGEST UPWARD SHIFT
              </div>
              <div style={{ fontSize: 18, fontWeight: 900 }}>
                {shiftStats.upward.name}
              </div>
              <div style={{ marginBottom: 18 }}>
                +{shiftStats.upward.shift} places
              </div>

              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 8 }}>
                LARGEST DOWNWARD SHIFT
              </div>
              <div style={{ fontSize: 18, fontWeight: 900 }}>
                {shiftStats.downward.name}
              </div>
              <div style={{ marginBottom: 18 }}>
                {shiftStats.downward.shift} places
              </div>

              <div style={{
                borderTop: "1px solid #e2e8f0",
                paddingTop: 14,
                fontSize: 13,
                color: "#475569"
              }}>
                Average absolute rank change: {shiftStats.average} places
              </div>
            </div>

          </div>
        </section>
      )}

      <footer style={{
        padding: "40px 28px",
        background: "#f8fafc",
        borderTop: "1px solid #e2e8f0",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <strong>What does this experiment reveal?</strong>
          <p style={{
            marginTop: 12,
            lineHeight: 1.7,
            color: "#475569",
          }}>
            Measurement is not neutral — it shapes what becomes visible,
            and therefore what becomes urgent.
          </p>
        </div>
      </footer>
    </div>
  );
}