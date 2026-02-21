// src/components/ModeToggle.jsx
export default function ModeToggle({ mode, onChange }) {
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          onClick={() => onChange("raw")}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
            background: mode === "raw" ? "#111" : "#fff",
            color: mode === "raw" ? "#fff" : "#111",
            cursor: "pointer",
          }}
        >
          Raw Concentration
        </button>
  
        <button
          onClick={() => onChange("burden")}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
            background: mode === "burden" ? "#111" : "#fff",
            color: mode === "burden" ? "#fff" : "#111",
            cursor: "pointer",
          }}
        >
          Population Burden
        </button>
      </div>
    );
  }