// src/components/Intro.jsx
import React from "react";

export default function Intro({ mode }) {
  const isBurden = mode === "burden" || mode === "population" || mode === "weighted";

  return (
    <section className="intro">
      <h1 className="intro-title">Average Air, Uneven Burdens</h1>

      <p className="intro-text">
        London’s air quality looks different depending on how it is measured.
        This interface lets you switch between <strong>Raw Concentration</strong> and{" "}
        <strong>Population Burden</strong> to see how statistical framing can reorder
        the geography of inequality.
      </p>

      <div className="intro-hint">
        <span className="pill">Try this</span>
        <span>
          Switch to <strong>Population Burden</strong>, then click a borough to see{" "}
          <strong>rank change</strong> and <strong>disproportionate exposure</strong>.
        </span>
      </div>

      <div className="intro-mode">
        <span className="intro-mode-label">Current view:</span>
        <span className={`intro-mode-badge ${isBurden ? "burden" : "raw"}`}>
          {isBurden ? "Population Burden" : "Raw Concentration"}
        </span>
      </div>
    </section>
  );
}
