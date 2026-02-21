export default function IntroModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div style={backdrop} onMouseDown={onClose}>
      <div style={panel} onMouseDown={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 950, fontSize: 22, letterSpacing: "-0.4px" }}>
              What changes when we stop looking at averages?
            </div>

            <div
              style={{
                marginTop: 10,
                lineHeight: 1.6,
                fontSize: 14,
                color: "#cbd5e1",
              }}
            >
              London’s air quality is often summarised as a borough average.
              But averages can obscure how many people actually live with exposure.
              <br />
              <br />
              This interface lets you switch perspectives — and watch the city reorder itself.
            </div>
          </div>

          <button onClick={onClose} style={closeBtn}>
            ✕
          </button>
        </div>

        {/* Tension cards */}
        <div style={cards}>
          <div style={card}>
            <div style={cardTitle}>Lens 1</div>
            <div style={cardText}>
              Boroughs ranked by mean NO₂ concentration.
            </div>
          </div>

          <div style={card}>
            <div style={cardTitle}>Lens 2</div>
            <div style={cardText}>
              Boroughs re-ranked by population-weighted exposure.
            </div>
          </div>

          <div style={card}>
            <div style={cardTitle}>Notice</div>
            <div style={cardText}>
              When the ranking shifts, ask: who becomes more visible — and why?
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
          <button onClick={onClose} style={primaryBtn}>
            Enter the Interface
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===========================
   Styles
=========================== */

const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "grid",
  placeItems: "center",
  zIndex: 50,
  padding: 16,
};

const panel = {
  width: "min(760px, 100%)",
  background: "rgba(15,23,42,0.98)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 18,
  padding: 24,
  boxShadow: "0 25px 80px rgba(0,0,0,0.6)",
  color: "#e5e7eb",
};

const closeBtn = {
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.06)",
  color: "#e5e7eb",
  borderRadius: 10,
  width: 36,
  height: 36,
  cursor: "pointer",
  fontWeight: 900,
};

const cards = {
  marginTop: 20,
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 14,
};

const card = {
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 16,
  padding: 14,
  background: "rgba(255,255,255,0.05)",
};

const cardTitle = {
  fontWeight: 900,
  marginBottom: 6,
  fontSize: 12,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#94a3b8",
};

const cardText = {
  fontSize: 13,
  lineHeight: 1.5,
  color: "#e2e8f0",
};

const primaryBtn = {
  border: "1px solid rgba(59,130,246,0.55)",
  background: "rgba(59,130,246,0.35)",
  color: "#e5e7eb",
  padding: "12px 16px",
  borderRadius: 14,
  cursor: "pointer",
  fontWeight: 900,
  fontSize: 14,
  transition: "all 0.25s ease",
};
