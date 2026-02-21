export default function StoryHeader({ title, subtitle }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 0.2 }}>
          {title}
        </div>
        <div style={{ fontSize: 13, opacity: 0.9, maxWidth: 900, lineHeight: 1.35 }}>
          {subtitle}
        </div>
      </div>
    );
  }
  