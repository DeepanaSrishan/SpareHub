import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, RotateCcw, Compass, Activity, Eye } from "lucide-react";

/**
 * PhotorealisticLockedAssembly:
 * Renders the supplied 1672x941 automotive studio photograph with a completely locked camera.
 * 
 * Kinematic Animations (Seamless 5-second loop):
 * 1. Featured Motorcycle Front Wheel & Tyre:
 *    Rotates slowly around its fixed axle (812, 633), completing 1 full 360° revolution over 5s.
 *    Caliper, fork stanchion, fender, fairing, and ground contact patch remain locked & stationary.
 *    Interactive: Drag to spin with physical angular momentum and friction deceleration.
 * 
 * 2. Visible Piston Mechanism:
 *    Crankshaft rotates, driving the connecting rod and piston crown smoothly along its vertical
 *    cylinder axis with mechanically consistent slider-crank motion.
 *    Completes a 5-second loop returning to the starting mechanical position.
 *    Engine housing and all unrelated components remain 100% stationary.
 */
export default function PhotorealisticLockedAssembly({
  selectedPartId,
  setSelectedPartId,
  setHoveredPart,
  setTooltipPos,
  pistonSpeed = 1.0,
  pistonRunning = true,
  setPistonRunning,
  resetTrigger,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Images state
  const imagesRef = useRef({
    master: null,
    wheelDisc: null,
    caliperOverlay: null,
    pistonCrop: null,
    loaded: false,
  });

  // Kinematic parameters
  const LOOP_DURATION = 5.0; // exactly 5 seconds
  const animTimeRef = useRef(0);
  const lastTimestampRef = useRef(null);

  // Wheel interaction physics
  const isDraggingWheelRef = useRef(false);
  const lastDragAngleRef = useRef(0);
  const wheelAngularVelRef = useRef(0); // for drag inertia
  const wheelManualAngleRef = useRef(0);

  // Live HUD state
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [internalRunning, setInternalRunning] = useState(true);
  const [activeMode, setActiveMode] = useState("all"); // 'all' | 'wheel' | 'piston'

  // Preload high-res photographic assets
  useEffect(() => {
    let isCancelled = false;

    const master = new Image();
    master.src = "/images/sparehub-assembly.png";

    const wheelDisc = new Image();
    wheelDisc.src = "/images/photoreal_wheel_inner_90.png";

    const caliperOverlay = new Image();
    caliperOverlay.src = "/images/wheel_stationary_overlay_definitive.png";

    const pistonCrop = new Image();
    pistonCrop.src = "/images/piston_crop_full.png";

    let loadedCount = 0;
    const onLoad = () => {
      loadedCount++;
      if (loadedCount === 4 && !isCancelled) {
        imagesRef.current = {
          master,
          wheelDisc,
          caliperOverlay,
          pistonCrop,
          loaded: true,
        };
      }
    };

    master.onload = onLoad;
    wheelDisc.onload = onLoad;
    caliperOverlay.onload = onLoad;
    pistonCrop.onload = onLoad;

    return () => {
      isCancelled = true;
    };
  }, []);

  // Sync external pistonRunning prop
  useEffect(() => {
    if (typeof pistonRunning === "boolean") {
      setInternalRunning(pistonRunning);
    }
  }, [pistonRunning]);

  // Handle Reset View
  useEffect(() => {
    if (resetTrigger > 0) {
      animTimeRef.current = 0;
      wheelManualAngleRef.current = 0;
      wheelAngularVelRef.current = 0;
      if (setPistonRunning) setPistonRunning(true);
      setInternalRunning(true);
    }
  }, [resetTrigger, setPistonRunning]);

  // Convert mouse event coordinates to 1672x941 canvas coordinates
  const getCanvasCoords = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = 1672 / rect.width;
    const scaleY = 941 / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  // Main 60fps RequestAnimationFrame Loop
  useEffect(() => {
    let animId;

    const render = (timestamp) => {
      if (!lastTimestampRef.current) lastTimestampRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimestampRef.current) / 1000, 0.1);
      lastTimestampRef.current = timestamp;

      // Advance 5-second kinematic clock
      if (internalRunning) {
        animTimeRef.current = (animTimeRef.current + dt * pistonSpeed) % LOOP_DURATION;
      }

      // Wheel inertia drag damping
      if (!isDraggingWheelRef.current && Math.abs(wheelAngularVelRef.current) > 0.001) {
        wheelManualAngleRef.current += wheelAngularVelRef.current * dt;
        wheelAngularVelRef.current *= Math.pow(0.92, dt * 60); // friction deceleration
      }

      const canvas = canvasRef.current;
      const { master, wheelDisc, caliperOverlay, pistonCrop, loaded } = imagesRef.current;

      if (canvas && loaded && master && wheelDisc && caliperOverlay && pistonCrop) {
        const ctx = canvas.getContext("2d", { alpha: false });
        if (ctx) {
          // Native resolution 1672x941
          const t = animTimeRef.current;
          const u = t / LOOP_DURATION; // 0 to 1

          // 1. DRAW MASTER STUDIO PHOTOGRAPH (Locked camera base)
          ctx.drawImage(master, 0, 0, 1672, 941);

          // 2. KINEMATIC PISTON MECHANISM
          // Mechanically consistent slider-crank motion:
          // Crankshaft center: X=183, Y=735
          // Wrist pin center: X=183, Y=588
          // Connecting rod length L = 147px
          // Crank radius r = 4.0px
          if (activeMode === "all" || activeMode === "piston") {
            const thetaPiston = u * 2 * Math.PI;
            const r = 4.0;
            const L = 147.0;

            const xc = 183.0 + r * Math.sin(thetaPiston);
            const yc = 735.0 - r * Math.cos(thetaPiston);
            const xw = 183.0;
            const dx = xc - xw;
            const yw = yc - Math.sqrt(L * L - dx * dx);
            const beta = -Math.asin(dx / L); // rod angle in radians
            const deltaY = yw - (735.0 - r - L); // vertical piston crown travel

            ctx.save();
            ctx.translate(183, 588);
            ctx.rotate(beta);
            ctx.translate(0, deltaY);
            // Draw authentic piston & rod assembly (92x255)
            ctx.drawImage(pistonCrop, -48, -58, 92, 255);
            ctx.restore();
          }

          // 3. MOTORCYCLE FRONT WHEEL & TYRE ROTATION
          // Fixed Axle center: X=812, Y=633
          // 1 full revolution (360°) over 5 seconds (2*PI radians)
          if (activeMode === "all" || activeMode === "wheel") {
            const baseWheelAngle = u * 2 * Math.PI;
            const totalWheelAngle = baseWheelAngle + wheelManualAngleRef.current;

            // Draw rotating inner wheel disc (rotor, spokes, rim, red stripe)
            ctx.save();
            ctx.translate(812, 633);
            ctx.rotate(totalWheelAngle);
            ctx.drawImage(wheelDisc, -90, -90, 180, 180);
            ctx.restore();

            // Draw stationary caliper, fork, and axle nut overlay
            // Keeps caliper, fork, fender, fairing, and ground contact 100% stationary!
            ctx.drawImage(caliperOverlay, 722, 543, 180, 180);
          }

          // 4. SUBTLE SELECTION HIGHLIGHTS (When part is selected or hovered)
          if (selectedPartId === "tyre" || selectedPartId === "rotor") {
            ctx.save();
            ctx.strokeStyle = "rgba(16, 185, 129, 0.85)";
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 6]);
            ctx.beginPath();
            ctx.arc(812, 633, 114, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.restore();
          } else if (selectedPartId === "piston") {
            ctx.save();
            ctx.strokeStyle = "rgba(16, 185, 129, 0.85)";
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 6]);
            ctx.strokeRect(132, 524, 98, 266);
            ctx.restore();
          }

          // Update HUD readout seconds throttled
          if (Math.floor(t * 10) % 2 === 0) {
            setCurrentSeconds(t);
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [internalRunning, pistonSpeed, selectedPartId, activeMode]);

  // Pointer Interaction Handlers
  const handlePointerDown = (e) => {
    const { x, y } = getCanvasCoords(e);
    // Check if clicked near wheel axle
    const distToAxle = Math.hypot(x - 812, y - 633);
    if (distToAxle <= 115) {
      isDraggingWheelRef.current = true;
      lastDragAngleRef.current = Math.atan2(y - 633, x - 812);
      wheelAngularVelRef.current = 0;
      setSelectedPartId("tyre");
    } else if (x >= 130 && x <= 230 && y >= 520 && y <= 790) {
      setSelectedPartId("piston");
    }
  };

  const handlePointerMove = (e) => {
    const { x, y } = getCanvasCoords(e);
    const distToAxle = Math.hypot(x - 812, y - 633);

    // If dragging wheel
    if (isDraggingWheelRef.current) {
      const currentAngle = Math.atan2(y - 633, x - 812);
      let deltaAngle = currentAngle - lastDragAngleRef.current;
      // Handle wrap around
      if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
      if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

      wheelManualAngleRef.current += deltaAngle;
      wheelAngularVelRef.current = deltaAngle * 35; // angular speed
      lastDragAngleRef.current = currentAngle;
      return;
    }

    // Hover detection
    if (distToAxle <= 115) {
      if (setHoveredPart) {
        setHoveredPart({
          name: "Motorcycle Front Wheel & Brake Rotor",
          hint: "Drag to spin • Click for specs",
        });
      }
      if (setTooltipPos) {
        setTooltipPos({ x: e.clientX, y: e.clientY });
      }
    } else if (x >= 130 && x <= 230 && y >= 520 && y <= 790) {
      if (setHoveredPart) {
        setHoveredPart({
          name: "Forged Piston & Slider-Crank Mechanism",
          hint: "Synchronized 5s kinematic loop",
        });
      }
      if (setTooltipPos) {
        setTooltipPos({ x: e.clientX, y: e.clientY });
      }
    } else {
      if (setHoveredPart) setHoveredPart(null);
    }
  };

  const handlePointerUp = () => {
    isDraggingWheelRef.current = false;
  };

  const toggleRunning = () => {
    const next = !internalRunning;
    setInternalRunning(next);
    if (setPistonRunning) setPistonRunning(next);
  };

  return (
    <div
      ref={containerRef}
      className="photoreal-assembly-container"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#05070a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* 1672x941 Photorealistic Master Canvas */}
      <canvas
        ref={canvasRef}
        width={1672}
        height={941}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          cursor: isDraggingWheelRef.current ? "grabbing" : "default",
        }}
      />

      {/* Cinematic Studio Vignette Overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(5, 7, 10, 0) 50%, rgba(5, 7, 10, 0.45) 85%, rgba(5, 7, 10, 0.85) 100%)",
        }}
      />

      {/* Bottom Telemetry HUD Bar */}
      <div
        className="photoreal-hud-bar"
        style={{
          position: "absolute",
          bottom: "24px",
          left: "32px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          background: "rgba(10, 15, 22, 0.78)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "14px",
          padding: "8px 16px",
          color: "#e2e8f0",
          fontSize: "0.78rem",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.45)",
          zIndex: 20,
        }}
      >
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={toggleRunning}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: internalRunning
              ? "rgba(16, 185, 129, 0.18)"
              : "rgba(239, 68, 68, 0.18)",
            border: `1px solid ${
              internalRunning ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)"
            }`,
            color: internalRunning ? "#34d399" : "#f87171",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          aria-label={internalRunning ? "Pause Kinematics" : "Play Kinematics"}
        >
          {internalRunning ? <Pause size={15} /> : <Play size={15} style={{ marginLeft: "2px" }} />}
        </button>

        {/* Live Loop Counter */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Activity size={13} color="#10b981" />
            <span style={{ fontWeight: 600, letterSpacing: "0.04em", color: "#f8fafc" }}>
              5.0s SEAMLESS LOOP
            </span>
            <span
              style={{
                fontFamily: "monospace",
                color: "#10b981",
                fontWeight: 700,
                fontSize: "0.82rem",
                marginLeft: "4px",
              }}
            >
              {currentSeconds.toFixed(1)}s / 5.0s
            </span>
          </div>
          <div style={{ fontSize: "0.68rem", color: "#94a3b8" }}>
            Locked Camera • Synchronized Mechanical Motion
          </div>
        </div>

        <div
          style={{
            width: "1px",
            height: "24px",
            background: "rgba(255, 255, 255, 0.12)",
            margin: "0 4px",
          }}
        />

        {/* Mechanism Mode Selector Pills */}
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            onClick={() => setActiveMode("all")}
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "0.72rem",
              fontWeight: 500,
              background: activeMode === "all" ? "rgba(16, 185, 129, 0.25)" : "transparent",
              color: activeMode === "all" ? "#34d399" : "#94a3b8",
              border: activeMode === "all" ? "1px solid rgba(16, 185, 129, 0.45)" : "1px solid transparent",
              cursor: "pointer",
            }}
          >
            All Active
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("wheel")}
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "0.72rem",
              fontWeight: 500,
              background: activeMode === "wheel" ? "rgba(16, 185, 129, 0.25)" : "transparent",
              color: activeMode === "wheel" ? "#34d399" : "#94a3b8",
              border: activeMode === "wheel" ? "1px solid rgba(16, 185, 129, 0.45)" : "1px solid transparent",
              cursor: "pointer",
            }}
          >
            Tire & Wheel
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("piston")}
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "0.72rem",
              fontWeight: 500,
              background: activeMode === "piston" ? "rgba(16, 185, 129, 0.25)" : "transparent",
              color: activeMode === "piston" ? "#34d399" : "#94a3b8",
              border: activeMode === "piston" ? "1px solid rgba(16, 185, 129, 0.45)" : "1px solid transparent",
              cursor: "pointer",
            }}
          >
            Piston Kinematics
          </button>
        </div>
      </div>
    </div>
  );
}
