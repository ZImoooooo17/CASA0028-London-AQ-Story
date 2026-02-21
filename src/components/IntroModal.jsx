export default function IntroModal({ onStart, onSelectCase, data }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.88)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "min(1000px, 95%)",
          borderRadius: 24,
          background: "rgba(255,255,255,0.98)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 22,
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div
              style={{
                width: 40,
                height: 40,
                background: "#0f172a",
                borderRadius: 12,
              }}
            />
            <div>
              <div style={{ fontWeight: 950, fontSize: 18 }}>
                Average Air, Uneven Burdens
              </div>
              <div style={{ fontSize: 14, color: "#475569" }}>
                London’s air quality is routinely reported as an average —
                but every average hides as much as it reveals.
              </div>
            </div>
          </div>

          <button
            onClick={onStart}
            style={{
              padding: "10px 16px",
              borderRadius: 14,
              border: "1px solid #cbd5e1",
              background: "#f8fafc",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Start Exploring →
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 28, lineHeight: 1.7 }}>
          <p style={{ fontSize: 16 }}>
            This interface offers <strong>two ways of seeing</strong> the same data:
          </p>

          <ul style={{ marginTop: 10, fontSize: 15 }}>
            <li>
              <strong>Average View:</strong> borough mean NO₂ concentration.
            </li>
            <li>
              <strong>Burden View:</strong> population-weighted exposure
              (and its inequality signals).
            </li>
          </ul>

          <p style={{ marginTop: 18, fontSize: 15 }}>
            Switch between them and notice what changes — and what quietly
            fades from sight.
          </p>

          <p
            style={{
              marginTop: 12,
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            Changing the viewing mode does not just change colour —
            it reshapes the city.
          </p>

          <div style={{ marginTop: 28, display: "flex", gap: 16 }}>
            <button
              onClick={() =>
                onSelectCase(data?.meta?.maxUpJumpId || "E09000005")
              }
              style={{
                padding: "12px 18px",
                borderRadius: 16,
                background: "#0f172a",
                color: "white",
                fontWeight: 900,
                cursor: "pointer",
                border: "none",
              }}
            >
              Spotlight: Biggest rank jump (Brent) →
            </button>

            <button
              onClick={onStart}
              style={{
                padding: "12px 18px",
                borderRadius: 16,
                border: "1px solid #cbd5e1",
                background: "#f1f5f9",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Explore freely
            </button>
          </div>

          <div
            style={{
              marginTop: 26,
              fontSize: 13,
              color: "#64748b",
            }}
          >
            Tip: Hover the chart to locate boroughs on the map.
            Click to open the narrative panel.
          </div>
        </div>
      </div>
    </div>
  );
}