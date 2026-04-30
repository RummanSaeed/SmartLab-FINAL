import React from "react";
import HeroScene from "./HeroScene";

const Hero: React.FC = () => {
  return (
    <section className="hero-banner">
      <div className="container hero-banner__inner">
        <header className="hero-banner__top">
          <div className="pill pill-ghost">Learn about the SmartLab Hybrid Simulation Engine</div>
        </header>

        <div className="hero-banner__body">
          <h1 className="hero-banner__title">Your AI-driven Virtual Science Lab</h1>
          <p className="hero-banner__sub">
            Build real-feel Physics and Chemistry experiments with cinematic visuals, hazard-aware outcomes,
            and an AI tutor that keeps every step aligned to the Federal Board syllabus.
          </p>
          <div className="cta-row">
            <a href="/experiments"><button className="btn-primary">Book demo</button></a>
            <a href="/signup"><button className="btn-ghost">Start for free</button></a>
          </div>
        </div>

        <div className="hero-banner__visual glass">
          <div className="hero-banner__badge">
            <div className="badge badge-live">Live sandbox</div>
            <div className="chip">AI tutor on-call</div>
          </div>
          <HeroScene />
          <div className="hero-banner__footer">
            <div>
              <div className="stat-label">Expected outcome</div>
              <div className="stat-value">Titration endpoint 22.6 ml</div>
            </div>
            <div>
              <div className="stat-label">Hazard check</div>
              <div className="stat-value">Proceed with warning</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;