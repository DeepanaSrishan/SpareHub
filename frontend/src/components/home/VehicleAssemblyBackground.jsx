import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useScroll } from "framer-motion";
import { CarFront, Cpu, Layers, Sparkles, Zap } from "lucide-react";
import "../../styles/vehicle-assembly-scroll.css";

const TOTAL_FRAMES = 50;
const BG_COLOR = "#0c1013";

export default function VehicleAssemblyBackground({ targetRef }) {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const currentFrameRef = useRef(0);
  const animationFrameIdRef = useRef(null);

  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [currentFrameDisplay, setCurrentFrameDisplay] = useState(1);
  const [stageInfo, setStageInfo] = useState({
    num: "01",
    label: "ASSEMBLED AERODYNAMICS",
    icon: Sparkles,
  });

  // Track page scroll progress (0.0 to 1.0)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  // Determine stage info based on frame index
  const updateStageInfo = useCallback((frameIdx) => {
    if (frameIdx < 13) {
      setStageInfo({
        num: "01",
        label: "AERODYNAMIC MONOCOQUE",
        icon: Layers,
      });
    } else if (frameIdx < 27) {
      setStageInfo({
        num: "02",
        label: "CHASSIS & BODY SEPARATION",
        icon: CarFront,
      });
    } else if (frameIdx < 40) {
      setStageInfo({
        num: "03",
        label: "EXPLODED POWERTRAIN & BRAKES",
        icon: Cpu,
      });
    } else {
      setStageInfo({
        num: "04",
        label: "PRECISION REASSEMBLY",
        icon: Zap,
      });
    }
  }, []);

  // Frame Drawing Function - Covers the ENTIRE viewport screen perfectly
  const renderFrame = useCallback((frameIdx) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current[frameIdx];
    if (!img || !img.complete) return;

    const width = canvas.width;
    const height = canvas.height;

    // Fill background with exact studio color
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, width, height);

    // Natural dimensions of the image sequence (1280x720)
    const naturalW = img.naturalWidth || 1280;
    const naturalH = img.naturalHeight || 720;

    // COVER scale: fills 100% of viewport width and height, perfectly centered
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

    renderFrame(currentFrameRef.current);
  }, [renderFrame]);

  // Preload all 50 frames
  useEffect(() => {
    let loadedCount = 0;
    const imagesArray = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNumber = String(i).padStart(3, "0");
      img.src = `/animate/ezgif-frame-${frameNumber}.jpg`;

      img.onload = () => {
        loadedCount++;
        setLoadProgress(Math.floor((loadedCount / TOTAL_FRAMES) * 100));
        if (loadedCount === 1) {
          // Render initial frame as soon as frame 1 arrives
          imagesRef.current = imagesArray;
          resizeCanvas();
        }
        if (loadedCount === TOTAL_FRAMES) {
          imagesRef.current = imagesArray;
          setImagesLoaded(true);
          renderFrame(currentFrameRef.current);
        }
      };

      img.onerror = () => {
        loadedCount++;
        setLoadProgress(Math.floor((loadedCount / TOTAL_FRAMES) * 100));
        if (loadedCount === TOTAL_FRAMES) {
          imagesRef.current = imagesArray;
          setImagesLoaded(true);
        }
      };

      imagesArray.push(img);
    }

    return () => {
      imagesArray.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [renderFrame, resizeCanvas]);

  // Window resize listener
  useEffect(() => {
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  // Bind scroll progress to canvas frame updates
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const targetFrame = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.floor(latest * (TOTAL_FRAMES - 0.01)))
      );

      if (targetFrame !== currentFrameRef.current) {
        currentFrameRef.current = targetFrame;
        setCurrentFrameDisplay(targetFrame + 1);
        updateStageInfo(targetFrame);

        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
        }
        animationFrameIdRef.current = requestAnimationFrame(() => {
          renderFrame(targetFrame);
        });
      }
    });

    return () => {
      unsubscribe();
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [renderFrame, scrollYProgress, updateStageInfo]);

  const StageIcon = stageInfo.icon;

  return (
    <>
      {/* 1. Fixed Full Screen Canvas Background across the entire page */}
      <div className="vehicle-assembly-fullscreen-bg" aria-hidden="true">
        <canvas ref={canvasRef} className="vehicle-assembly-fullscreen-canvas" />
        <div className="vehicle-assembly-scrim" />
      </div>

      {/* 2. Sleek Floating Engineering HUD in Bottom-Right */}
      <motion.div
        className="vehicle-assembly-hud"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <div className="vehicle-assembly-hud-dot-container">
          <span className="vehicle-assembly-hud-dot-ping" />
          <span className="vehicle-assembly-hud-dot" />
        </div>

        <span className="vehicle-assembly-hud-text">
          FRAME {String(currentFrameDisplay).padStart(2, "0")}/{TOTAL_FRAMES}
        </span>

        <span className="vehicle-assembly-hud-divider">|</span>

        <div className="vehicle-assembly-hud-stage">
          <StageIcon size={13} style={{ color: "#b8f34a" }} />
          <span>{stageInfo.label}</span>
        </div>
      </motion.div>

      {/* 3. Top Preloader Progress Bar while loading frames */}
      {!imagesLoaded && (
        <div className="vehicle-assembly-top-loader">
          <div
            className="vehicle-assembly-top-loader-bar"
            style={{ width: `${loadProgress}%` }}
          />
        </div>
      )}
    </>
  );
}
