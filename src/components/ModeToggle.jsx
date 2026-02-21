export default function ModeToggle({ mode, onMode }) {
  return (
    <div style={wrap}>
      <button
        onClick={() => onMode("raw")}
        style={{
          ...btn,
          ...(mode === "raw" ? btnActiveBlue : null),
          ...(mode === "raw" ? { color: "#1e40af" } : null),
        }}
      >
        Average View
      </button>

      <button
        onClick={() => onMode("weighted")}
        style={{
          ...btn,
          ...(mode === "weighted" ? btnActiveRed : null),
          ...(mode === "weighted" ? { color: "#991b1b" } : null),
        }}
      >
        Burden View
      </button>
    </div>
  );
}

const wrap = {
  display: "flex",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 12,
  overflow: "hidden",
  height: 44,
};

const btn = {
  appearance: "none",
  border: "none",
  background: "rgba(255,255,255,0.04)",
  color: "#e5e7eb",
  padding: "10px 12px",
  cursor: "pointer",
  fontWeight: 800,
  fontSize: 13,
};

const btnActiveBlue = {
  background: "rgba(59,130,246,0.22)",
};

const btnActiveRed = {
  background: "rgba(229,62,62,0.18)",
};