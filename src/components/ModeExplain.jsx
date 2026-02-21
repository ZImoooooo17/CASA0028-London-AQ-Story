export default function ModeExplain({ mode }) {
    const isBurden = mode !== "raw"; // 兼容你用 raw/weighted
  
    const title = isBurden ? "Viewing mode: Population Burden" : "Viewing mode: Raw concentration";
    const text = isBurden
      ? "This view weights exposure by population share. Rankings can shift—revealing where more people carry a disproportionate burden."
      : "This view shows borough-average NO₂ concentration. Averages can hide how many people live with that exposure.";
  
    return (
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.06)",
          padding: "10px 12px",
          borderRadius: 14,
          maxWidth: 820,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.9, marginBottom: 4 }}>
          {title}
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.35, opacity: 0.95 }}>
          {text}
        </div>
      </div>
    );
  }
  