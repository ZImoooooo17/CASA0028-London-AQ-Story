export default function ModeToggle({ mode, onMode }) {
  return (
    <div style={wrap}>
      <button
        onClick={() => onMode("raw")}
        style={{ ...btn, ...(mode === "raw" ? btnActive : null) }}
      >
        Raw NO₂
      </button>
      <button
        onClick={() => onMode("burden")}
        style={{ ...btn, ...(mode === "burden" ? btnActive : null) }}
      >
        Population Burden
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

const btnActive = {
  background: "rgba(59,130,246,0.35)",
};