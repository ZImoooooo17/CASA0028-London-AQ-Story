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
        {mode === "raw"
          ? "NO₂ concentration (µg/m³)"
          : "Population burden ratio"}
      </div>

      <div style={{ fontSize: 13, lineHeight: 1.4, opacity: 0.85 }}>
        {mode === "raw" ? (
          <>
            Higher value = higher average NO₂ concentration in the borough.
          </>
        ) : (
          <>
            1 = proportional burden (burden share matches population share). <br />
            &gt; 1 = disproportionate exposure burden.
          </>
        )}
      </div>
    </div>
  );
}