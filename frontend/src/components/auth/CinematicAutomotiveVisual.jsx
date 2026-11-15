import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  Cpu,
  Layers,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Wrench,
  Zap,
  Shield,
  Sliders,
  ChevronRight,
} from "lucide-react";

// Hotspot definitions positioned accurately over the parts in the user's image
const SPARE_PARTS = [
  {
    id: "BRK-01",
    name: "Ventilated Disc & 6-Piston Caliper",
    category: "Braking Systems",
    x: 6.5,
    y: 50,
    targetX: 42,
    targetY: 62,
    specs: "380mm Drilled Rotor • Monobloc Caliper",
    oem: "OEM Certified • Brembo Spec",
  },
  {
    id: "PST-02",
    name: "Forged Piston & Connecting Rod",
    category: "Engine Internals",
    x: 10.5,
    y: 70,
    targetX: 45,
    targetY: 55,
    specs: "82mm Bore • H-Beam Forged Steel Rod",
    oem: "Direct Factory Tolerance",
  },
  {
    id: "ALT-03",
    name: "High-Output Alternator & Filter",
    category: "Electrical & Intake",
    x: 21,
    y: 67,
    targetX: 47,
    targetY: 56,
    specs: "140A Stator • Micro-Pleat Air Filter",
    oem: "Heavy Duty Duty-Cycle",
  },
  {
    id: "TRK-04",
    name: "Commercial Prime Mover Chassis",
    category: "Heavy Vehicle Fleet",
    x: 48,
    y: 20,
    targetX: 48,
    targetY: 30,
    specs: "Euro-6 Turbocharged 540HP Platform",
    oem: "Fleet Logistics Spec",
  },
  {
    id: "MTR-05",
    name: "Apex 1000cc Superbike Core",
    category: "Two-Wheeler Dynamics",
    x: 45,
    y: 54,
    targetX: 45,
    targetY: 54,
    specs: "Inline-4 210HP • Twin-Spar Frame",
    oem: "SuperSport Homologation",
  },
  {
    id: "CHN-06",
    name: "Gold O-Ring Drive Chain & Sprocket",
    category: "Drivetrain",
    x: 37,
    y: 84,
    targetX: 44,
    targetY: 65,
    specs: "525-Pitch Tensile Links • Steel Sprocket",
    oem: "Pre-Stretched Endurance",
  },
  {
    id: "SHK-07",
    name: "Wave Rotor & Nitrogen Damper",
    category: "Suspension & Braking",
    x: 63,
    y: 81,
    targetX: 47,
    targetY: 58,
    specs: "Floating Wave Rotor • Piggyback Reservoir",
    oem: "Track-Tuned Compression",
  },
  {
    id: "CLT-08",
    name: "Twin-Plate Clutch & Pressure Ring",
    category: "Transmission",
    x: 80,
    y: 79,
    targetX: 46,
    targetY: 57,
    specs: "Diaphragm Spring • Ceramic-Friction Discs",
    oem: "High-Torque Transfer",
  },
  {
    id: "RAD-09",
    name: "Dual-Core Radiator & Gas Strut",
    category: "Cooling & Suspension",
    x: 91,
    y: 59,
    targetX: 52,
    targetY: 45,
    specs: "Brazed Aluminum Fins • High-Pressure Strut",
    oem: "Thermal Efficiency Rated",
  },
];

export default function CinematicAutomotiveVisual() {
  const containerRef = useRef(null);
  const particlesCanvasRef = useRef(null);

  // Mode: "cursor" (cursor position controls assembly) vs "auto" (continuous smooth cycle)
  const [controlMode, setControlMode] = useState("cursor");
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [selectedPart, setSelectedPart] = useState(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [assemblyProgress, setAssemblyProgress] = useState(0.65); // 0.0 (Exploded) to 1.0 (Assembled)

  // Cursor motion tracking
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const pixelX = useMotionValue(300);
  const pixelY = useMotionValue(300);

  // Smooth springs for 3D tilt
  const springConfig = { damping: 28, stiffness: 140 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [0, 1], [7, -7]);
  const rotateY = useTransform(smoothMouseX, [0, 1], [-7, 7]);

  // Touch device check
  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
    setIsTouchDevice(isTouch);
  }, []);

  // Automated oscillating assembly loop if in 'auto' mode
  useEffect(() => {
    if (controlMode !== "auto" || !isAutoPlaying) return;

    let animId;
    let direction = 1;
    let current = assemblyProgress;

    const animateLoop = () => {
      current += 0.0035 * direction;
      if (current >= 1.0) {
        current = 1.0;
        direction = -1;
      } else if (current <= 0.08) {
        current = 0.08;
        direction = 1;
      }
      setAssemblyProgress(current);
      animId = requestAnimationFrame(animateLoop);
    };

    animId = requestAnimationFrame(animateLoop);

    return () => cancelAnimationFrame(animId);
  }, [controlMode, isAutoPlaying, assemblyProgress]);

  // Pointer move handler: Drives assembly progress & 3D tilt
  const handlePointerMove = (e) => {
    if (isTouchDevice) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const normY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    mouseX.set(normX);
    mouseY.set(normY);
    pixelX.set(e.clientX - rect.left);
    pixelY.set(e.clientY - rect.top);

    // In cursor mode, horizontal cursor position (X) controls the assembly progression!
    if (controlMode === "cursor") {
      setAssemblyProgress(normX);
    }
  };

  const handlePointerLeave = () => {
    if (isTouchDevice) return;
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  // Ambient particles
  useEffect(() => {
    const canvas = particlesCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", onResize);

    const particles = Array.from({ length: 24 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.8,
      speedY: Math.random() * 0.35 + 0.15,
      speedX: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.45 + 0.15,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += p.speedX;

        if (p.y < 0) {
          p.y = height + 5;
          p.x = Math.random() * width;
        }

        ctx.fillStyle = `rgba(16, 185, 129, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Compute assembly stage description
  const percentNumber = Math.round(assemblyProgress * 100);
  let stageLabel = "STAGE 01: EXPLODED SPARE PARTS";
  let stageColor = "#38bdf8";

  if (assemblyProgress > 0.82) {
    stageLabel = "STAGE 04: FULL VEHICLE ASSEMBLY VERIFIED";
    stageColor = "#10b981";
  } else if (assemblyProgress > 0.55) {
    stageLabel = "STAGE 03: POWERTRAIN & CHASSIS DOCKING";
    stageColor = "#34d399";
  } else if (assemblyProgress > 0.28) {
    stageLabel = "STAGE 02: KINEMATIC COMPONENT ALIGNMENT";
    stageColor = "#fbbf24";
  }

  return (
    <section
      ref={containerRef}
      className="cinematic-visual-panel"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-label="Interactive 3D Automotive Spare Parts Assembly"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#050505",
      }}
    >
      {/* 1. Main 3D Tilt Container */}
      <motion.div
        className="cinematic-tilt-container"
        style={{
          rotateX: isTouchDevice ? 0 : rotateX,
          rotateY: isTouchDevice ? 0 : rotateY,
        }}
      >
        <div className="cinematic-canvas-wrapper" style={{ position: "relative" }}>
          {/* Main User Image: Vehicle & Spare Parts Masterpiece */}
          <motion.img
            src="/images/sparehub-assembly.png"
            alt="SpareHub Vehicles and Spare Parts Assembly"
            className="cinematic-canvas"
            style={{
              objectFit: "contain",
              transformOrigin: "center center",
              scale: 1.04 + (1 - assemblyProgress) * 0.05,
              filter: `contrast(1.08) brightness(${0.92 + assemblyProgress * 0.16})`,
              transition: "filter 0.3s ease",
            }}
          />

          {/* Laser Scanner Beam following Cursor / Assembly progress */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${assemblyProgress * 100}%`,
              width: "2px",
              background: "linear-gradient(to bottom, transparent 5%, #10b981 50%, transparent 95%)",
              boxShadow: "0 0 18px 3px rgba(16, 185, 129, 0.75)",
              pointerEvents: "none",
              zIndex: 3,
              transition: controlMode === "auto" ? "none" : "left 0.05s ease-out",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "14%",
                left: "-50px",
                padding: "2px 8px",
                borderRadius: "4px",
                background: "rgba(16, 185, 129, 0.9)",
                color: "#050505",
                fontSize: "10px",
                fontWeight: "800",
                letterSpacing: "0.08em",
                whiteSpace: "nowrap",
                boxShadow: "0 0 10px rgba(16, 185, 129, 0.5)",
              }}
            >
              SCANNER // {percentNumber}%
            </div>
          </div>

          {/* Vignette Edge Blending into #050505 */}
          <div className="cinematic-canvas-vignette" />

          {/* Interactive Cursor Spotlight */}
          {!isTouchDevice && (
            <motion.div
              className="cinematic-spotlight"
              style={{
                background: `radial-gradient(550px circle at ${pixelX.get()}px ${pixelY.get()}px, rgba(16, 185, 129, 0.18), transparent 70%)`,
              }}
            />
          )}

          {/* Interactive Spare Parts Hotspots and Parallax Vectors */}
          {SPARE_PARTS.map((part) => {
            // Calculate exploded delta offset: as assembly decreases (0 = exploded), part floats outwards
            const explodeOffset = (1 - assemblyProgress) * 26;
            const isHovered = selectedPart?.id === part.id;

            return (
              <motion.div
                key={part.id}
                style={{
                  position: "absolute",
                  left: `${part.x}%`,
                  top: `${part.y}%`,
                  zIndex: isHovered ? 20 : 6,
                  cursor: "pointer",
                }}
                animate={{
                  y: -explodeOffset,
                  scale: isHovered ? 1.15 : 1,
                }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                onClick={() => setSelectedPart(isHovered ? null : part)}
                onMouseEnter={() => setSelectedPart(part)}
                onMouseLeave={() => setSelectedPart(null)}
              >
                {/* Glowing Part Pin */}
                <div
                  style={{
                    position: "relative",
                    width: "28px",
                    height: "28px",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      background: assemblyProgress > 0.8 ? "rgba(16, 185, 129, 0.4)" : "rgba(56, 189, 248, 0.35)",
                      animation: "radarPing 2s infinite",
                    }}
                  />
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: assemblyProgress > 0.8 ? "#10b981" : "#38bdf8",
                      boxShadow: `0 0 10px ${assemblyProgress > 0.8 ? "#10b981" : "#38bdf8"}`,
                      border: "2px solid #ffffff",
                    }}
                  />
                </div>

                {/* Floating Telemetry Callout on Hover / Selection */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.92 }}
                      style={{
                        position: "absolute",
                        bottom: "34px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "240px",
                        padding: "12px 14px",
                        borderRadius: "14px",
                        background: "rgba(8, 16, 12, 0.94)",
                        border: "1px solid rgba(16, 185, 129, 0.4)",
                        backdropFilter: "blur(18px)",
                        boxShadow: "0 14px 35px rgba(0, 0, 0, 0.85), 0 0 20px rgba(16, 185, 129, 0.2)",
                        color: "#ffffff",
                        pointerEvents: "none",
                        zIndex: 30,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontSize: "10px", fontWeight: "800", color: "#10b981", letterSpacing: "0.08em" }}>
                          {part.id} // {part.category}
                        </span>
                        <CheckCircle2 size={12} style={{ color: "#10b981" }} />
                      </div>
                      <div style={{ fontSize: "12px", fontWeight: "800", marginBottom: "4px", color: "#ffffff" }}>
                        {part.name}
                      </div>
                      <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.65)", lineHeight: "1.3" }}>
                        {part.specs}
                      </div>
                      <div style={{ marginTop: "6px", fontSize: "10px", color: "#34d399", fontWeight: "700" }}>
                        {part.oem}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {/* Ambient Particles */}
          <canvas ref={particlesCanvasRef} className="cinematic-particles-canvas" />
        </div>
      </motion.div>

      {/* 2. Top Header Telemetry Bar */}
      <div className="cinematic-telemetry-header">
        <div className="cinematic-brand-pill">
          <span className="cinematic-brand-dot" />
          <span>Automotive Assembly & Spare Parts Studio</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Mode Switcher */}
          <button
            type="button"
            onClick={() => {
              if (controlMode === "cursor") {
                setControlMode("auto");
                setIsAutoPlaying(true);
              } else {
                setControlMode("cursor");
              }
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "999px",
              background: controlMode === "cursor" ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.08)",
              border: `1px solid ${controlMode === "cursor" ? "#10b981" : "rgba(255, 255, 255, 0.15)"}`,
              color: controlMode === "cursor" ? "#10b981" : "#cbd5e1",
              fontSize: "11px",
              fontWeight: "750",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {controlMode === "cursor" ? <Sliders size={12} /> : <Play size={12} />}
            <span>{controlMode === "cursor" ? "CURSOR DOCKED" : "AUTO-PULSE"}</span>
          </button>

          <div className="cinematic-telemetry-badge">
            60FPS DYNAMICS
          </div>
        </div>
      </div>

      {/* 3. Interactive Assembly Progress & Scrubbing Controls */}
      <div
        style={{
          position: "relative",
          zIndex: 8,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          padding: "16px 20px",
          borderRadius: "18px",
          background: "rgba(10, 18, 14, 0.88)",
          border: "1px solid rgba(16, 185, 129, 0.25)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 16px 40px rgba(0, 0, 0, 0.75)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="cinematic-hud-radar">
              <span className="cinematic-hud-radar-ping" />
              <span className="cinematic-hud-radar-dot" />
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: "800", color: "#ffffff", letterSpacing: "0.04em" }}>
                {stageLabel}
              </div>
              <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.55)" }}>
                Move cursor left/right across visual to assemble or explode parts
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Quick action buttons */}
            <button
              type="button"
              onClick={() => {
                setControlMode("cursor");
                setAssemblyProgress(0.08);
              }}
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#cbd5e1",
                fontSize: "10px",
                fontWeight: "750",
                padding: "4px 8px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
              title="Disassemble / Explode Parts"
            >
              EXPLODE
            </button>
            <button
              type="button"
              onClick={() => {
                setControlMode("cursor");
                setAssemblyProgress(1.0);
              }}
              style={{
                background: "rgba(16, 185, 129, 0.2)",
                border: "1px solid #10b981",
                color: "#10b981",
                fontSize: "10px",
                fontWeight: "800",
                padding: "4px 8px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
              title="Assemble / Lock Parts"
            >
              ASSEMBLE
            </button>

            <div className="cinematic-hud-counter" style={{ color: stageColor }}>
              {percentNumber}% DOCKED
            </div>
          </div>
        </div>

        {/* Dynamic Assembly Track Slider */}
        <div style={{ position: "relative", width: "100%", height: "6px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "3px", overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${percentNumber}%`,
              background: "linear-gradient(90deg, #38bdf8 0%, #10b981 100%)",
              boxShadow: "0 0 12px rgba(16, 185, 129, 0.6)",
              transition: controlMode === "auto" ? "none" : "width 0.1s ease-out",
            }}
          />
        </div>
      </div>
    </section>
  );
}
