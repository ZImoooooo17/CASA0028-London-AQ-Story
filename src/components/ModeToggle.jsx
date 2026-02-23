import React from "react";

export default function ModeToggle({ mode, onMode }) {
  return (
    <div style={container}>
      <div style={heading}>CHOOSE VIEW</div>

      <div style={wrap}>
        <button
          onClick={() => onMode("raw")}
          style={{
            ...btn,
            ...(mode === "raw" ? activeBlue : null),
          }}
        >
          Average
        </button>

        <button
          onClick={() => onMode("weighted")}
          style={{
            ...btn,
            ...(mode === "weighted" ? activeRed : null),
          }}
        >
          Burden
        </button>
      </div>

      <div style={desc}>
        {mode === "raw"
          ? "Ranked by mean NO₂."
          : "Ranked by population exposure."}
      </div>
    </div>
  );
}

/* ===== STYLES ===== */

const container = {
  background: "rgba(15,23,42,0.95)",
  padding: "8px 10px",
  borderRadius: 12,
  boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
  display: "flex",
  flexDirection: "column",
  gap: 6,
  width: "100%",
  maxWidth: 220,
};

const heading = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 0.5,
  textTransform: "uppercase",
  color: "#cbd5e1",
};

const wrap = {
  display: "flex",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 8,
  overflow: "hidden",
  height: 34,
};

const btn = {
  flex: 1,
  border: "none",
  background: "rgba(255,255,255,0.05)",
  color: "#94a3b8",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const activeBlue = {
  background: "rgba(59,130,246,0.25)",
  color: "#1e40af",
};

const activeRed = {
  background: "rgba(239,68,68,0.25)",
  color: "#991b1b",
};

const desc = {
  fontSize: 10,
  color: "#94a3b8",
  lineHeight: 1.3,
};