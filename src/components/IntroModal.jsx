export default function IntroModal({
  onStart,
  onSelectCase,
  data,
}) {
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
        <div
          style={{
            padding: 28,
            lineHeight: 1.7,
          }}
        >
          <h2 style={{ fontWeight: 900 }}>
            Average Air, Uneven Burdens
          </h2>

          <p style={{ fontSize: 16, marginTop: 12 }}>
            London’s air quality is usually summarised as a single
            number. But when we change the way we measure exposure,
            the city rearranges itself.
          </p>

          <p style={{ marginTop: 16 }}>
            This story begins with a simple question:
            <strong> What changes when we change the metric?</strong>
          </p>

          <ul
            style={{
              marginTop: 14,
              fontSize: 15,
              lineHeight: 1.7,
            }}
          >
            <li>
              <strong>Average View:</strong> ranks boroughs
              by mean NO₂ concentration.
            </li>
            <li>
              <strong>Burden View:</strong> ranks boroughs
              by total exposure (NO₂ × population).
            </li>
          </ul>

          <p style={{ marginTop: 20 }}>
            Switch between them and watch boroughs rise and
            fall. The map stays the same — but the ranking
            does not.
          </p>

          <p
            style={{
              marginTop: 16,
              fontSize: 17,
              fontWeight: 800,
            }}
          >
            Changing the metric does not just change colour.
            It changes who appears most at risk.
          </p>

          <div style={{ marginTop: 28 }}>
            <button
              onClick={onStart}
              style={{
                padding: "12px 20px",
                borderRadius: 16,
                background: "#0f172a",
                color: "white",
                fontWeight: 900,
                cursor: "pointer",
                border: "none",
              }}
            >
              Start Exploring →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}