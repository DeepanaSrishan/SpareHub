import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  RotateCcw,
  Sliders,
  Play,
  Pause,
  Layers,
  ShieldCheck,
  Zap,
  Activity,
  Maximize2,
} from "lucide-react";

/**
 * PartDetailsModal:
 * Accessible slide-over telemetry drawer with technical specs,
 * dynamic interaction controls (speed sliders, explode toggles, compression triggers),
 * Reset View and Close handlers.
 */
export default function PartDetailsModal({
  selectedPartId,
  onClose,
  onResetView,
  pistonSpeed,
  setPistonSpeed,
  pistonRunning,
  setPistonRunning,
  isExploded,
  setIsExploded,
  onCompressShock,
}) {
  if (!selectedPartId) return null;

  const partDetailsMap = {
    rotor: {
      category: "Braking & Kinetic Energy",
      name: "Carbon-Ceramic Ventilated Rotor & 6-Piston Caliper",
      oem: "OEM Part #SH-BRK-9901 • Brembo GT Homologation",
      specs: "380mm x 34mm Curved Vane Rotor • Monobloc Aircraft Aluminum Caliper • 420°C Thermal Rating",
      description:
        "High-performance directional ventilated rotor designed for maximum heat dissipation under endurance braking. Equipped with 6 titanium pistons and high-friction ceramic composite pads.",
      controls: "drag",
    },
    tyre: {
      category: "Chassis & Wheel Dynamics",
      name: "Track-Spec Compound Tyre & Forged Monoblock Wheel",
      oem: "OEM Part #SH-TYR-4420 • FIA GT3 Approved",
      specs: "275/35 R19 Semi-Slick • 19x9.5J ET25 Forged T6061 Aluminum • 8.4kg Ultra-Lightweight",
      description:
        "Engineered with asymmetric multi-compound rubber for uncompromising lateral grip. The forged aluminum barrel features back-milled split spokes to eliminate unsprung mass.",
      controls: "tyre",
    },
    piston: {
      category: "Engine Internals & Reciprocating Assembly",
      name: "Forged Billet Piston & 4340 H-Beam Connecting Rod",
      oem: "OEM Part #SH-PST-8812 • Cosworth Tolerance",
      specs: "82.5mm Bore • 21mm Tool Steel Wrist Pin • 9000+ RPM Rated • 4340 Chrome Moly Rod",
      description:
        "Precision balanced slider-crank reciprocating assembly. Features moly-coated skirt skirts, CNC valve relief pockets, and ARP2000 high-tensile rod bolts.",
      controls: "piston",
    },
    gears: {
      category: "Transmission & Drivetrain",
      name: "Synchronized Interlocking Spur Transmission Gears",
      oem: "OEM Part #SH-GEA-3310 • Getrag Performance Spec",
      specs: "Case-Hardened 8620 Alloy Steel • Involute Tooth Geometry • 1.5:1 Synchronous Ratio",
      description:
        "Dual precision-ground spur gear pair designed for zero backlash and immense torque delivery across extreme thermal expansion cycles.",
      controls: "gears",
    },
    shock: {
      category: "Suspension & Damping",
      name: "Inverted Monotube Coilover Damper with Piggyback",
      oem: "OEM Part #SH-SHK-7715 • Öhlins TTX Spec",
      specs: "46mm High-Flow Nitrogen Piston • 12kg/mm Silicon Chrome Spring • Dual-Speed Damping",
      description:
        "Inverted shock absorber featuring a remote nitrogen gas reservoir to isolate foaming and ensure consistent high-frequency damping compliance.",
      controls: "shock",
    },
    engine: {
      category: "Powertrain Modular Assembly",
      name: "VTEC Turbo Inline-4 Modular Engine Core",
      oem: "OEM Part #SH-ENG-2026 • Factory Racing Platform",
      specs: "2.0L Turbocharged • 315HP @ 6500 RPM • Quad DOHC 16-Valve • Direct Cylinder Injection",
      description:
        "Complete race-ready powertrain core including billet crankcase, CNC ported cylinder head, low-inertia intake runners, and tuned equal-length exhaust headers.",
      controls: "engine",
    },
  };

  const details = partDetailsMap[selectedPartId] || partDetailsMap.rotor;

  return (
    <motion.div
      className="showroom-details-drawer"
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      role="dialog"
      aria-label="Part Specification & Kinematic Controls"
    >
      {/* Header */}
      <div className="showroom-drawer-header">
        <div>
          <span className="showroom-drawer-category">{details.category}</span>
          <h3 className="showroom-drawer-title">{details.name}</h3>
        </div>
        <button
          type="button"
          className="showroom-drawer-close"
          onClick={onClose}
          aria-label="Close part details"
        >
          <X size={20} />
        </button>
      </div>

      {/* OEM & Certification Tag */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 10px",
          borderRadius: "6px",
          background: "rgba(16, 185, 129, 0.12)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          color: "#34d399",
          fontSize: "0.75rem",
          fontWeight: 750,
          marginBottom: "14px",
        }}
      >
        <ShieldCheck size={14} />
        <span>{details.oem}</span>
      </div>

      {/* Description */}
      <p className="showroom-drawer-description">{details.description}</p>

      {/* Technical Specs Box */}
      <div
        style={{
          padding: "12px 14px",
          borderRadius: "10px",
          background: "rgba(56, 189, 248, 0.08)",
          border: "1px solid rgba(56, 189, 248, 0.25)",
          marginBottom: "18px",
          fontSize: "0.8rem",
          color: "#e0f2fe",
          lineHeight: "1.45",
        }}
      >
        <div style={{ fontWeight: 800, color: "#38bdf8", marginBottom: "4px", fontSize: "0.74rem", letterSpacing: "0.08em" }}>
          ENGINEERING SPECIFICATIONS
        </div>
        {details.specs}
      </div>

      {/* Interactive Controls based on active part */}
      {details.controls === "piston" && (
        <div className="showroom-control-box">
          <div className="showroom-control-label">
            <span>Crankshaft Velocity: {(pistonSpeed * 300).toFixed(0)} RPM</span>
            <button
              type="button"
              onClick={() => setPistonRunning(!pistonRunning)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 10px",
                borderRadius: "6px",
                background: pistonRunning ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.1)",
                border: `1px solid ${pistonRunning ? "#10b981" : "rgba(255, 255, 255, 0.2)"}`,
                color: pistonRunning ? "#34d399" : "#cbd5e1",
                fontSize: "0.75rem",
                fontWeight: 750,
                cursor: "pointer",
              }}
            >
              {pistonRunning ? <Pause size={12} /> : <Play size={12} />}
              <span>{pistonRunning ? "ACTIVE" : "PAUSED"}</span>
            </button>
          </div>
          <input
            type="range"
            min="0.5"
            max="4.0"
            step="0.1"
            value={pistonSpeed}
            onChange={(e) => setPistonSpeed(parseFloat(e.target.value))}
            className="showroom-slider-input"
            aria-label="Piston crankshaft speed"
          />
        </div>
      )}

      {details.controls === "engine" && (
        <div className="showroom-control-box">
          <div className="showroom-control-label">
            <span>Exploded Assembly State</span>
            <span style={{ color: isExploded ? "#38bdf8" : "#94a3b8" }}>
              {isExploded ? "DISASSEMBLED" : "ASSEMBLED"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsExploded(!isExploded)}
            className="showroom-drawer-btn"
            style={{
              background: isExploded ? "rgba(56, 189, 248, 0.25)" : "rgba(255, 255, 255, 0.08)",
              borderColor: isExploded ? "#38bdf8" : "rgba(255, 255, 255, 0.2)",
            }}
          >
            <Layers size={16} />
            <span>{isExploded ? "Assemble Components" : "Explode Components"}</span>
          </button>
        </div>
      )}

      {details.controls === "shock" && (
        <div className="showroom-control-box">
          <div className="showroom-control-label">
            <span>Dynamic Spring Compression</span>
          </div>
          <button
            type="button"
            onPointerDown={() => onCompressShock?.(true)}
            onPointerUp={() => onCompressShock?.(false)}
            className="showroom-drawer-btn"
          >
            <Activity size={16} />
            <span>Press & Hold to Compress Damper</span>
          </button>
        </div>
      )}

      {/* Drawer Action Buttons: Reset View & Close */}
      <div className="showroom-drawer-actions">
        <button
          type="button"
          onClick={onResetView}
          className="showroom-drawer-btn"
          title="Reset 3D camera and component positions"
        >
          <RotateCcw size={15} />
          <span>Reset View</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="showroom-drawer-btn"
          style={{ background: "rgba(255, 255, 255, 0.08)", borderColor: "rgba(255, 255, 255, 0.15)" }}
        >
          <span>Done</span>
        </button>
      </div>
    </motion.div>
  );
}
