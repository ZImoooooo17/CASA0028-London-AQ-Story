export default function IntroModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div style={backdrop} onMouseDown={onClose}>
      <div style={panel} onMouseDown={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>
              Why two modes?
            </div>
            <div style={{ marginTop: 6, opacity: 0.9, lineHeight: 1.45, fontSize: 13 }}>
              London’s “average” air quality is not neutral.
              Borough averages can conceal how many people live with high exposure.
              Switching modes shows how rankings shift when population is considered—revealing uneven burdens.
            </div>
          </div>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        <div style={tips}>
          <div style={tipCard}>
            <div style={tipTitle}>Try this</div>
            <div style={tipText}>Pick a borough in Raw mode, then switch to Population Burden.</div>
          </div>
          <div style={tipCard}>
            <div style={tipTitle}>Look for</div>
            <div style={tipText}>Large rank jumps and high burden ratios (burden share ÷ population share).</div>
          </div>
          <div style={tipCard}>
            <div style={tipTitle}>Interpretation</div>
            <div style={tipText}>A ratio above 1 means the borough bears more pollution burden than its population share.</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
          <button onClick={onClose} style={primaryBtn}>Start exploring</button>
        </div>
      </div>
    </div>
  );
}

const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  display: "grid",
  placeItems: "center",
  zIndex: 50,
  padding: 16,
};

const panel = {
  width: "min(720px, 100%)",
  background: "rgba(15,23,42,0.98)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
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

const tips = {
  marginTop: 14,
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 10,
};

const tipCard = {
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 14,
  padding: 12,
  background: "rgba(255,255,255,0.04)",
};

const tipTitle = { fontWeight: 900, marginBottom: 6, fontSize: 12, opacity: 0.9 };
const tipText = { fontSize: 12.5, lineHeight: 1.35, opacity: 0.95 };

const primaryBtn = {
  border: "1px solid rgba(59,130,246,0.55)",
  background: "rgba(59,130,246,0.35)",
  color: "#e5e7eb",
  padding: "10px 12px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 900,
};
