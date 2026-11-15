import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Repeat,
  Flame,
  ArrowLeftRight,
} from "lucide-react";
import "../../styles/bike-assembly-scroll.css";

const MODELS = {
  bike0: {
    id: "bike0",
    name: "Cruiser V-Twin",
    shortName: "Bike 1: Cruiser",
    folder: "/bik",
    totalFrames: 60,
    accentColor: "#10b981", // Emerald
    accentBg: "rgba(16, 185, 129, 0.2)",
    accentBorder: "rgba(16, 185, 129, 0.45)",
    stages: [
      { maxFrame: 15, label: "EXPLODED V-TWIN CHASSIS & CORE", icon: Layers },
      { maxFrame: 30, label: "SUSPENSION & DUAL WHEELS ATTACH", icon: Cpu },
      { maxFrame: 45, label: "DUAL EXHAUST & TEARDROP TANK", icon: Sparkles },
      { maxFrame: 60, label: "ASSEMBLED CUSTOM V-TWIN CRUISER", icon: Zap },
    ],
  },
  bike1: {
    id: "bike1",
    name: "Streetfighter Roadster",
    shortName: "Bike 2: Streetfighter",
    folder: "/bik1",
    totalFrames: 50,
    accentColor: "#38bdf8", // Sky Cyan
    accentBg: "rgba(56, 189, 248, 0.2)",
    accentBorder: "rgba(56, 189, 248, 0.45)",
    stages: [
      { maxFrame: 12, label: "TRELLIS FRAME & ENGINE MOUNT", icon: Layers },
      { maxFrame: 25, label: "INVERTED FORKS & MONOSHOCK", icon: Cpu },
      { maxFrame: 38, label: "AGGRESSIVE COWL & TANK ASSEMBLY", icon: Flame },
      { maxFrame: 50, label: "ASSEMBLED PRECISION STREETFIGHTER", icon: Zap },
    ],
  },
};

const BG_COLOR = "#0c1013";

/**
 * BikeLoginAssemblyBackground:
 * Alternates seamlessly between the two motorcycle assembly sequences:
 * - Bike 1 (/bik): 60-frame Custom V-Twin Cruiser (Frames 01 -> 60)
 * - Bike 2 (/bik1): 50-frame Precision Streetfighter (Frames 01 -> 50)
 *
 * Sequence Flow (when Auto-Alternate is ON):
 * 1. Bike 1 assembles: exploded parts -> complete Cruiser (0 -> 59)
 * 2. Showcase hold: finished Cruiser displayed for 1.2s
 * 3. Bike 1 disassembles: Cruiser explodes into floating parts (59 -> 0)
 * 4. Alternates to Bike 2 at frame 0 (exploded parts)
 * 5. Bike 2 assembles: exploded parts -> complete Streetfighter (0 -> 49)
 * 6. Showcase hold: finished Streetfighter displayed for 1.2s
 * 7. Bike 2 disassembles: Streetfighter explodes into floating parts (49 -> 0)
 * 8. Alternates back to Bike 1, repeating smoothly!
 *
 * Interactive Features:
 * - Horizontal Cursor / Touch Scrubbing: Drag mouse to assemble/explode active bike.
 * - Manual Switcher: Click [Bike 1: Cruiser] or [Bike 2: Streetfighter] anytime.
 * - Auto-Alternate Toggle: Pause or resume the automatic cycling.
 * - Live Engineering Telemetry HUD with Stage Labels and Frame Counter.
 */
export default function BikeLoginAssemblyBackground({
  onOpenSignIn,
  onExploreParts,
  isAuthCardOpen,
}) {
  const canvasRef = useRef(null);

  // Loaded frame stores for both models
  const imagesBike0Ref = useRef([]);
  const imagesBike1Ref = useRef([]);

  // Active Model state
  const [activeModelKey, setActiveModelKey] = useState("bike0");
  const activeModelKeyRef = useRef("bike0");

  // Playback & Auto-Cycle state
  const [autoCycle, setAutoCycle] = useState(true);
  const autoCycleRef = useRef(true);

  const [isPlaying, setIsPlaying] = useState(true);
  const isPlayingRef = useRef(true);

  // Direction: 1 = assembling forward, -1 = disassembling backward
  const directionRef = useRef(1);

  // Frames & Preloading
  const currentFrameRef = useRef(0);
  const [currentFrameDisplay, setCurrentFrameDisplay] = useState(1);
  const [loadProgress, setLoadProgress] = useState(0);
  const [allReady, setAllReady] = useState(false);

  // Stage Telemetry
  const [currentStage, setCurrentStage] = useState(MODELS.bike0.stages[0]);

  // Timers
  const isHoverInteractingRef = useRef(false);
  const idleTimeoutRef = useRef(null);
  const lastFrameTimeRef = useRef(0);
  const holdTimerRef = useRef(0);

  // Sync refs with state
  useEffect(() => {
    activeModelKeyRef.current = activeModelKey;
    const model = MODELS[activeModelKey];
    updateStage(currentFrameRef.current, model);
  }, [activeModelKey]);

  useEffect(() => {
    autoCycleRef.current = autoCycle;
  }, [autoCycle]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Update current stage based on frame index and model
  const updateStage = useCallback((frameIdx, model = MODELS[activeModelKeyRef.current]) => {
    const stage = model.stages.find((s) => frameIdx < s.maxFrame) || model.stages[model.stages.length - 1];
    setCurrentStage(stage);
  }, []);

  // Frame Drawing Function - Cover scale onto canvas
  const renderFrame = useCallback((frameIdx, modelKey = activeModelKeyRef.current) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imgArray = modelKey === "bike0" ? imagesBike0Ref.current : imagesBike1Ref.current;
    const img = imgArray[frameIdx];
    if (!img || !img.complete) return;

    const width = canvas.width;
    const height = canvas.height;

    // Fill background with exact studio color
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, width, height);

    // Natural dimensions (1280x720)
    const naturalW = img.naturalWidth || 1280;
    const naturalH = img.naturalHeight || 720;

    // COVER scale: fills 100% of screen without stretching
    const scale = Math.max(width / naturalW, height / naturalH);
    const drawW = naturalW * scale;
    const drawH = naturalH * scale;
    const drawX = (width - drawW) / 2;
    const drawY = (height - drawH) / 2;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }, []);

  // Resize canvas resolution to match actual window dimensions & DPR
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    renderFrame(currentFrameRef.current, activeModelKeyRef.current);
  }, [renderFrame]);

  // Preload BOTH models (/bik = 60 frames, /bik1 = 50 frames)
  useEffect(() => {
    const totalToLoad = MODELS.bike0.totalFrames + MODELS.bike1.totalFrames; // 110 frames
    let totalLoaded = 0;

    const checkAllLoaded = () => {
      totalLoaded++;
      setLoadProgress(Math.floor((totalLoaded / totalToLoad) * 100));

      if (totalLoaded === 1) {
        resizeCanvas();
      }
      if (totalLoaded === totalToLoad) {
        setAllReady(true);
        renderFrame(currentFrameRef.current, activeModelKeyRef.current);
      }
    };

    // 1. Preload Bike 0 (Cruiser, 60 frames)
    const b0Array = [];
    for (let i = 1; i <= MODELS.bike0.totalFrames; i++) {
      const img = new Image();
      const numStr = String(i).padStart(3, "0");
      img.src = `${MODELS.bike0.folder}/ezgif-frame-${numStr}.jpg`;
      img.onload = checkAllLoaded;
      img.onerror = checkAllLoaded;
      b0Array.push(img);
    }
    imagesBike0Ref.current = b0Array;

    // 2. Preload Bike 1 (Streetfighter, 50 frames)
    const b1Array = [];
    for (let i = 1; i <= MODELS.bike1.totalFrames; i++) {
      const img = new Image();
      const numStr = String(i).padStart(3, "0");
      img.src = `${MODELS.bike1.folder}/ezgif-frame-${numStr}.jpg`;
      img.onload = checkAllLoaded;
      img.onerror = checkAllLoaded;
      b1Array.push(img);
    }
    imagesBike1Ref.current = b1Array;

    return () => {
      b0Array.forEach((img) => (img.onload = img.onerror = null));
      b1Array.forEach((img) => (img.onload = img.onerror = null));
    };
  }, [renderFrame, resizeCanvas]);

  // Window resize listener
  useEffect(() => {
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  // Direct Model Switch Handler
  const switchModel = useCallback(
    (targetKey, targetFrame = 0, dir = 1) => {
      setActiveModelKey(targetKey);
      activeModelKeyRef.current = targetKey;
      directionRef.current = dir;
      currentFrameRef.current = targetFrame;
      setCurrentFrameDisplay(targetFrame + 1);
      updateStage(targetFrame, MODELS[targetKey]);
      renderFrame(targetFrame, targetKey);
    },
    [renderFrame, updateStage]
  );

  // Main Autoplay & Alternating Animation Loop
  useEffect(() => {
    let animId;
    const FRAME_INTERVAL = 38; // ~26 fps for cinematic fluid motion
    const ASSEMBLED_HOLD_MS = 1400; // Hold assembled bike for 1.4s before exploding
    const EXPLODED_HOLD_MS = 600; // Hold exploded bike for 0.6s before alternating & assembling next model

    const animateLoop = (timestamp) => {
      if (!lastFrameTimeRef.current) lastFrameTimeRef.current = timestamp;
      const elapsed = timestamp - lastFrameTimeRef.current;

      const currentModel = MODELS[activeModelKeyRef.current];
      const imgArray =
        activeModelKeyRef.current === "bike0"
          ? imagesBike0Ref.current
          : imagesBike1Ref.current;

      if (
        imgArray.length === currentModel.totalFrames &&
        isPlayingRef.current &&
        !isHoverInteractingRef.current
      ) {
        if (elapsed >= FRAME_INTERVAL) {
          lastFrameTimeRef.current = timestamp;

          const maxFrame = currentModel.totalFrames - 1;

          // Case A: Moving forward (assembling) and reached full assembly
          if (directionRef.current === 1 && currentFrameRef.current >= maxFrame) {
            if (!holdTimerRef.current) {
              holdTimerRef.current = timestamp;
            } else if (timestamp - holdTimerRef.current >= ASSEMBLED_HOLD_MS) {
              holdTimerRef.current = 0;
              // Reverse direction: start disassembling!
              directionRef.current = -1;
            }
          }
          // Case B: Moving backward (disassembling) and reached exploded parts (frame 0)
          else if (directionRef.current === -1 && currentFrameRef.current <= 0) {
            if (!holdTimerRef.current) {
              holdTimerRef.current = timestamp;
            } else if (timestamp - holdTimerRef.current >= EXPLODED_HOLD_MS) {
              holdTimerRef.current = 0;
              // Once disassembled at frame 0:
              if (autoCycleRef.current) {
                // Alternate to the OTHER bike model!
                const nextKey = activeModelKeyRef.current === "bike0" ? "bike1" : "bike0";
                switchModel(nextKey, 0, 1);
              } else {
                // If auto-cycle is OFF, start assembling the current bike again
                directionRef.current = 1;
              }
            }
          }
          // Case C: Regular continuous step in current direction
          else {
            const nextFrame = Math.max(
              0,
              Math.min(maxFrame, currentFrameRef.current + directionRef.current)
            );
            currentFrameRef.current = nextFrame;
            setCurrentFrameDisplay(nextFrame + 1);
            updateStage(nextFrame, currentModel);
            renderFrame(nextFrame, activeModelKeyRef.current);
          }
        }
      }

      animId = requestAnimationFrame(animateLoop);
    };

    animId = requestAnimationFrame(animateLoop);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [renderFrame, switchModel, updateStage]);

  // Cursor / Touch interactive assembly scrub handler
  const handlePointerMove = (e) => {
    const currentModel = MODELS[activeModelKeyRef.current];
    const imgArray =
      activeModelKeyRef.current === "bike0"
        ? imagesBike0Ref.current
        : imagesBike1Ref.current;

    if (imgArray.length < currentModel.totalFrames) return;

    isHoverInteractingRef.current = true;
    holdTimerRef.current = 0;

    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }

    // Map horizontal mouse position across screen (0.0 to 1.0)
    const ratio = Math.max(0, Math.min(1, e.clientX / window.innerWidth));
    const targetFrame = Math.min(
      currentModel.totalFrames - 1,
      Math.max(0, Math.floor(ratio * (currentModel.totalFrames - 0.01)))
    );

    if (targetFrame !== currentFrameRef.current) {
      currentFrameRef.current = targetFrame;
      setCurrentFrameDisplay(targetFrame + 1);
      updateStage(targetFrame, currentModel);
      renderFrame(targetFrame, activeModelKeyRef.current);
    }

    // Resume gentle auto-loop after 2.5s idle
    idleTimeoutRef.current = setTimeout(() => {
      isHoverInteractingRef.current = false;
    }, 2500);
  };

  const handlePointerLeave = () => {
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    isHoverInteractingRef.current = false;
  };

  const togglePlayPause = (e) => {
    e.stopPropagation();
    setIsPlaying((prev) => !prev);
    isHoverInteractingRef.current = false;
  };

  const resetAssembly = (e) => {
    e.stopPropagation();
    const currentModel = MODELS[activeModelKeyRef.current];
    currentFrameRef.current = 0;
    setCurrentFrameDisplay(1);
    directionRef.current = 1;
    updateStage(0, currentModel);
    renderFrame(0, activeModelKeyRef.current);
    setIsPlaying(true);
    isHoverInteractingRef.current = false;
    holdTimerRef.current = 0;
  };

  const toggleAutoCycle = (e) => {
    e.stopPropagation();
    setAutoCycle((prev) => !prev);
  };

  const activeModel = MODELS[activeModelKey];
  const StageIcon = currentStage.icon;

  return (
    <div
      className="bike-login-bg-container"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: BG_COLOR,
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* 1. Fullscreen Background Canvas */}
      <div className="bike-assembly-fullscreen-bg" aria-hidden="true">
        <canvas ref={canvasRef} className="bike-assembly-fullscreen-canvas" />
        <div className="bike-assembly-scrim" />
      </div>

      {/* 2. Top Preloader Progress Bar */}
      {!allReady && (
        <div className="bike-assembly-top-loader">
          <div
            className="bike-assembly-top-loader-bar"
            style={{
              width: `${loadProgress}%`,
              background: `linear-gradient(90deg, #10b981, #38bdf8)`,
            }}
          />
        </div>
      )}

      {/* 3. Floating Engineering Telemetry HUD (Bottom Left) */}
      <motion.div
        className="bike-assembly-hud"
        style={{
          position: "fixed",
          bottom: "24px",
          left: "32px",
          right: "auto",
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "8px 18px",
          borderRadius: "999px",
          background: "rgba(10, 15, 22, 0.90)",
          border: `1px solid ${activeModel.accentBorder}`,
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          boxShadow: "0 12px 36px rgba(0, 0, 0, 0.65)",
          color: "#ffffff",
          fontSize: "0.75rem",
          transition: "border 0.3s ease",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlayPause}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "26px",
            height: "26px",
            borderRadius: "6px",
            background: isPlaying ? activeModel.accentBg : "rgba(239, 68, 68, 0.2)",
            border: `1px solid ${
              isPlaying ? activeModel.accentBorder : "rgba(239, 68, 68, 0.5)"
            }`,
            color: isPlaying ? activeModel.accentColor : "#f87171",
            cursor: "pointer",
          }}
          aria-label={isPlaying ? "Pause Assembly" : "Play Assembly"}
        >
          {isPlaying ? <Pause size={12} /> : <Play size={12} style={{ marginLeft: "1px" }} />}
        </button>

        {/* Rewind to Frame 01 */}
        <button
          type="button"
          onClick={resetAssembly}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "26px",
            height: "26px",
            borderRadius: "6px",
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#94a3b8",
            cursor: "pointer",
          }}
          aria-label="Rewind to Exploded Frame 01"
          title="Rewind to Exploded Frame 01"
        >
          <RotateCcw size={12} />
        </button>

        <span style={{ color: "rgba(255, 255, 255, 0.18)" }}>|</span>

        {/* Model Alternator / Selector Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              switchModel("bike0", 0, 1);
            }}
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "0.70rem",
              fontWeight: activeModelKey === "bike0" ? 700 : 500,
              background:
                activeModelKey === "bike0"
                  ? "rgba(16, 185, 129, 0.25)"
                  : "rgba(255, 255, 255, 0.06)",
              color: activeModelKey === "bike0" ? "#34d399" : "#94a3b8",
              border:
                activeModelKey === "bike0"
                  ? "1px solid rgba(16, 185, 129, 0.5)"
                  : "1px solid transparent",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Bike 1: Cruiser
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              switchModel("bike1", 0, 1);
            }}
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "0.70rem",
              fontWeight: activeModelKey === "bike1" ? 700 : 500,
              background:
                activeModelKey === "bike1"
                  ? "rgba(56, 189, 248, 0.25)"
                  : "rgba(255, 255, 255, 0.06)",
              color: activeModelKey === "bike1" ? "#38bdf8" : "#94a3b8",
              border:
                activeModelKey === "bike1"
                  ? "1px solid rgba(56, 189, 248, 0.5)"
                  : "1px solid transparent",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Bike 2: Streetfighter
          </button>

          {/* Auto-Cycle Alternator Button */}
          <button
            type="button"
            onClick={toggleAutoCycle}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 9px",
              borderRadius: "6px",
              fontSize: "0.68rem",
              fontWeight: 600,
              background: autoCycle
                ? "rgba(251, 191, 36, 0.18)"
                : "rgba(255, 255, 255, 0.05)",
              color: autoCycle ? "#fbbf24" : "#64748b",
              border: autoCycle
                ? "1px solid rgba(251, 191, 36, 0.4)"
                : "1px solid rgba(255, 255, 255, 0.1)",
              cursor: "pointer",
            }}
            title={
              autoCycle
                ? "Auto-Alternating active: Bike 1 assembles/explodes -> switches to Bike 2 -> loops"
                : "Auto-alternating paused"
            }
          >
            <Repeat size={11} />
            <span>Auto-Alternate</span>
          </button>
        </div>

        <span style={{ color: "rgba(255, 255, 255, 0.18)" }}>|</span>

        {/* Pulsing Dot */}
        <div className="bike-assembly-hud-dot-container">
          <span
            className="bike-assembly-hud-dot-ping"
            style={{ backgroundColor: activeModel.accentColor }}
          />
          <span
            className="bike-assembly-hud-dot"
            style={{ backgroundColor: activeModel.accentColor }}
          />
        </div>

        {/* Frame Counter */}
        <span style={{ fontFamily: "monospace", letterSpacing: "0.06em", color: "#f8fafc" }}>
          FRAME {String(currentFrameDisplay).padStart(2, "0")}/{activeModel.totalFrames}
        </span>

        <span style={{ color: "rgba(255, 255, 255, 0.18)" }}>|</span>

        {/* Stage Label */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <StageIcon size={14} style={{ color: activeModel.accentColor }} />
          <span style={{ fontWeight: 600, letterSpacing: "0.03em", color: "#cbd5e1" }}>
            {currentStage.label}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
