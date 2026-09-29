import { useState } from "react";
import { CarFront, AlertCircle, RefreshCw } from "lucide-react";

/**
 * ShowroomFallback:
 * Rendered when WebGL is unsupported or disabled.
 * Displays high-res visual reference fallback with descriptive automotive telemetry.
 */
export default function ShowroomFallback({ onOpenSignIn }) {
  return (
    <div className="showroom-fallback-view" role="region" aria-label="Automotive Showroom Preview">
      <img
        src="/images/sparehub-assembly.png"
        alt="SpareHub Vehicles and Performance Spare Parts"
        className="showroom-fallback-img"
      />
      <div
        style={{
          position: "absolute",
          bottom: "32px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "16px 24px",
          borderRadius: "16px",
          background: "rgba(10, 16, 22, 0.9)",
          border: "1px solid rgba(56, 189, 248, 0.3)",
          backdropFilter: "blur(16px)",
          display: "flex",
          alignItems: "center",
          gap: "18px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.8)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <CarFront size={22} style={{ color: "#38bdf8" }} />
          <div>
            <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#ffffff" }}>
              SpareHub 3D Automotive Studio
            </div>
            <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
              Precision Parts Catalog & Fleet Solutions
            </div>
          </div>
        </div>

        <button
          type="button"
          className="showroom-btn-primary"
          onClick={onOpenSignIn}
        >
          Sign In to Portal
        </button>
      </div>
    </div>
  );
}
