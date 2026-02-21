import React from "react";

export default function ModeToggle({ mode, onMode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      
      {/* Toggle Buttons */}
      <div style={wrap}>
        <button
          onClick={() => onMode("raw")}
          style={{
            ...btn,
            ...(mode === "raw" ? activeBlue : null),
          }}
        >
          Average View
        </button>

        <button
          onClick={() => onMode("weighted")}
          style={{
            ...btn,
            ...(mode === "weighted" ? activeRed : null),
          }}
        >
          Burden View
        </button>
      </div>

      {/* Semantic Description */}
      <div style={desc}>
        {mode === "raw"
          ? "Boroughs ranked by mean NO₂ concentration."
          : "Boroughs re-ranked by population-weighted exposure burden."}
      </div>
    </div>
  );
}

/* ---------------- Styles ---------------- */

const wrap = {
  display: "flex",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 12,
  overflow: "hidden",
  height: 44,
};

const btn = {
  flex: 1,
  appearance: "none",
  border: "none",
  background: "rgba(255,255,255,0.04)",
  color: "#94a3b8",
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: 800,
  fontSize: 13,
  transition: "all 0.3s ease",
};

const activeBlue = {
  background: "rgba(59,130,246,0.22)",
  color: "#1e40af",
};

const activeRed = {
  background: "rgba(229,62,62,0.18)",
  color: "#991b1b",
};

const desc = {
  fontSize: 11,
  color: "#94a3b8",
  lineHeight: 1.4,
  maxWidth: 260,
  transition: "opacity 0.3s ease",
};