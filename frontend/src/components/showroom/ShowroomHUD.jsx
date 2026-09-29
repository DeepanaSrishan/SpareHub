import { CarFront, ArrowRight, LogIn, Sparkles, SlidersHorizontal } from "lucide-react";

/**
 * ShowroomHUD:
 * Overlay HUD displaying the compact navbar, "Precision Parts. Powerful Performance." headline,
 * interactive hints strip, and dynamic hover tooltip.
 */
export default function ShowroomHUD({
  onOpenSignIn,
  onExploreParts,
  hoveredPart,
  tooltipPos,
}) {
  return (
    <>
      {/* 1. COMPACT TOP NAVBAR */}
      <nav className="showroom-navbar" aria-label="Showroom Navigation">
        <div className="showroom-brand-group">
          <div className="showroom-brand-emblem">
            <CarFront size={22} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="showroom-brand-title">SPAREHUB</span>
              <span className="showroom-brand-badge">3D SHOWROOM</span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", letterSpacing: "0.04em" }}>
              PRECISION AUTOMOTIVE SYSTEMS
            </div>
          </div>
        </div>

        <div className="showroom-nav-actions">
          <button
            type="button"
            className="showroom-btn-secondary"
            onClick={onExploreParts}
            aria-label="Explore automotive parts showroom"
          >
            Explore Parts
          </button>
          <button
            type="button"
            className="showroom-btn-primary"
            onClick={onOpenSignIn}
            aria-label="Open sign in panel"
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </button>
        </div>
      </nav>

      {/* 2. HERO HEADLINE & BADGE OVERLAY */}
      <header className="showroom-hero-overlay">
        <div className="showroom-hero-eyebrow">
          <Sparkles size={14} />
          <span>Cinematic Dual Motorcycle Assembly • Real-Time Kinematics</span>
        </div>
        <h1 className="showroom-hero-headline">
          Precision Parts.
          <br />
          Powerful Performance.
        </h1>
        <p className="showroom-hero-sub">
          Watch authentic motorcycle spare parts assemble in real time, alternating between Cruiser
          and Streetfighter builds. Move your cursor horizontally across the screen to control vehicle
          assembly or explore our genuine parts catalog.
        </p>
      </header>

      {/* 3. DYNAMIC HOVER TOOLTIP */}
      {hoveredPart && tooltipPos && (
        <div
          className="showroom-hover-tooltip"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
          }}
          role="tooltip"
        >
          <span className="showroom-tooltip-title">{hoveredPart.name}</span>
          <span className="showroom-tooltip-hint">{hoveredPart.hint}</span>
        </div>
      )}
    </>
  );
}
