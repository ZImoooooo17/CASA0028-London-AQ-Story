// src/components/Legend.jsx
export default function Legend({ mode }) {
  return (
    <div
      style={{
        padding: 12,
        border: "1px solid #e5e5e5",
        borderRadius: 12,
        background: "rgba(255,255,255,0.9)",
        maxWidth: 360,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6 }}>
        {mode === "raw" ? "Raw NO₂ concentration (µg/m³)" : "Population-burden ratio"}
      </div>

      <div style={{ fontSize: 13, lineHeight: 1.4, opacity: 0.85 }}>
        {mode === "raw" ? (
          <>
            Borough-level mean concentration.
            <br />
            Higher value = worse average air.
          </>
        ) : (
          <>
            Ratio = burden share ÷ population share.
            <br />
            1.00 = proportional • &gt; 1.00 = disproportionate exposure.
          </>
        )}
      </div>
    </div>
  );
}