import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Boxes,
  CarFront,
  CheckCircle2,
  ChevronDown,
  Cpu,
  Layers,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import "../../styles/vehicle-assembly-scroll.css";

const TOTAL_FRAMES = 50;
const BG_COLOR = "#0c1013";

export default function VehicleAssemblyScroll() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const currentFrameRef = useRef(0);
  const animationFrameIdRef = useRef(null);

  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  // Framer Motion useScroll over the 400vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Text overlay transforms (opacity & translateY for each narrative section)
  // Section 0: 0% -> 20% (Hero Intro - Centered)
  const opacity0 = useTransform(scrollYProgress, [0, 0.05, 0.16, 0.22], [1, 1, 1, 0]);
  const y0 = useTransform(scrollYProgress, [0, 0.05, 0.16, 0.22], [0, 0, -20, -50]);
  const pointerEvents0 = useTransform(scrollYProgress, (v) => (v < 0.22 ? "auto" : "none"));

  // Section 1: 25% -> 48% (Aerodynamic Disassembly - Left Aligned)
  const opacity1 = useTransform(scrollYProgress, [0.23, 0.29, 0.43, 0.49], [0, 1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0.23, 0.29, 0.43, 0.49], [40, 0, 0, -40]);
  const pointerEvents1 = useTransform(scrollYProgress, (v) =>
    v >= 0.24 && v <= 0.48 ? "auto" : "none"
  );

  // Section 2: 52% -> 76% (Exploded Architecture - Right Aligned)
  const opacity2 = useTransform(scrollYProgress, [0.51, 0.57, 0.71, 0.77], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.51, 0.57, 0.71, 0.77], [40, 0, 0, -40]);
  const pointerEvents2 = useTransform(scrollYProgress, (v) =>
    v >= 0.52 && v <= 0.76 ? "auto" : "none"
  );

  // Section 3: 80% -> 100% (Reassembled Performance & CTA - Centered)
  const opacity3 = useTransform(scrollYProgress, [0.79, 0.85, 0.98, 1], [0, 1, 1, 1]);
  const y3 = useTransform(scrollYProgress, [0.79, 0.85, 0.98, 1], [40, 0, 0, 0]);
  const pointerEvents3 = useTransform(scrollYProgress, (v) => (v >= 0.8 ? "auto" : "none"));

  // Frame Drawing Function
  const renderFrame = useCallback((frameIdx) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current[frameIdx];
    if (!img || !img.complete) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width;
    const height = canvas.height;

    // Fill background to seamlessly blend canvas with site backdrop
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, width, height);

    // Subtle ambient vignette gradient
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      height * 0.1,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.65
    );
    gradient.addColorStop(0, "rgba(22, 34, 30, 0.35)");
    gradient.addColorStop(0.65, "rgba(12, 16, 19, 0.85)");
    gradient.addColorStop(1, BG_COLOR);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Calculate aspect ratio containment (16:9 base)
    const naturalW = img.naturalWidth || 1280;
    const naturalH = img.naturalHeight || 720;
    const scale = Math.min(width / naturalW, height / naturalH) * 0.96;
    const drawW = naturalW * scale;
    const drawH = naturalH * scale;
    const drawX = (width - drawW) / 2;
    const drawY = (height - drawH) / 2;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // Soft feathered edge mask to guarantee zero visible frame boundaries
    ctx.lineWidth = 12 * dpr;
    ctx.strokeStyle = BG_COLOR;
    ctx.strokeRect(drawX, drawY, drawW, drawH);
  }, []);

  // Update canvas resolution on resize
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    renderFrame(currentFrameRef.current);
  }, [renderFrame]);

  // Image Preloading Effect
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
        if (loadedCount === TOTAL_FRAMES) {
          imagesRef.current = imagesArray;
          setImagesLoaded(true);
        }
      };

      img.onerror = () => {
        // Fallback progress increment in case of single image glitch
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
  }, []);

  // Window resize listener
  useEffect(() => {
    window.addEventListener("resize", resizeCanvas);
    if (imagesLoaded) {
      resizeCanvas();
    }
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [imagesLoaded, resizeCanvas]);

  // Sync scroll progress with canvas frame
  useEffect(() => {
    if (!imagesLoaded) return;

    const unsubscribe = scrollYProgress.on("change", (latest) => {
      // Map 0 -> 1 progress to frame index 0 -> 49
      const targetFrame = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.floor(latest * (TOTAL_FRAMES - 0.01)))
      );

      if (targetFrame !== currentFrameRef.current) {
        currentFrameRef.current = targetFrame;
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
        }
        animationFrameIdRef.current = requestAnimationFrame(() => {
          renderFrame(targetFrame);
        });
      }
    });

    // Render initial frame
    renderFrame(0);

    return () => {
      unsubscribe();
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [imagesLoaded, renderFrame, scrollYProgress]);

  return (
    <section className="vehicle-scroll-container" ref={containerRef}>
      {/* Preloading Screen */}
      {!imagesLoaded && (
        <div className="assembly-preloader">
          <div className="preloader-spinner-wrapper">
            <div className="preloader-ring"></div>
            <div className="preloader-icon">
              <CarFront size={28} />
            </div>
          </div>
          <div className="preloader-text-group">
            <span className="preloader-title">SpareHub Engineering Lab</span>
            <span className="preloader-subtitle">
              Preloading Precision Assembly Sequence ({loadProgress}%)
            </span>
          </div>
          <div className="preloader-bar-bg">
            <div
              className="preloader-bar-fill"
              style={{ width: `${loadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Sticky Viewport Stage */}
      <div className="vehicle-sticky-viewport">
        {/* HTML5 Canvas Component */}
        <canvas ref={canvasRef} className="assembly-canvas" />

        {/* Cinematic Vignette Overlay */}
        <div className="assembly-vignette-overlay" />

        {/* Live Sequence Frame Counter Badge */}
        {imagesLoaded && (
          <div className="assembly-hud-counter">
            <span className="hud-dot"></span>
            <span className="hud-label">FRAME</span>
            <span className="hud-val">
              {String(currentFrameRef.current + 1).padStart(2, "0")} / {TOTAL_FRAMES}
            </span>
          </div>
        )}

        {/* Narrative Overlay Stages */}
        <div className="assembly-story-layer">
          {/* SECTION 0: Hero Headline (0% - 20%) */}
          <motion.div
            className="story-block story-center"
            style={{ opacity: opacity0, y: y0, pointerEvents: pointerEvents0 }}
          >
            <div className="story-badge">
              <Sparkles size={14} />
              <span>SPAREHUB PRECISION ENGINEERING</span>
            </div>
            <h2 className="story-title-large">
              DECONSTRUCTING <strong>PERFECTION</strong>
            </h2>
            <p className="story-lead">
              A high-performance vehicle is an interconnected symphony of over
              30,000 precision parts. Scroll down to experience the visual breakdown.
            </p>
            <div className="scroll-indicator-pill">
              <span>Scroll to disassemble</span>
              <ChevronDown size={16} className="scroll-arrow-animate" />
            </div>
          </motion.div>

          {/* SECTION 1: Aerodynamic Disassembly (25% - 48% - Left Aligned) */}
          <motion.div
            className="story-block story-left"
            style={{ opacity: opacity1, y: y1, pointerEvents: pointerEvents1 }}
          >
            <div className="story-badge-highlight">
              <Layers size={14} />
              <span>STAGE 01 — AERODYNAMIC SHELL</span>
            </div>
            <h3 className="story-heading">
              Active Aerodynamics &amp; Carbon Monocoque
            </h3>
            <p className="story-description">
              As the carbon-fiber composite body panels detach, the vehicle exposes its
              lightweight structural frame, high-downforce front splitter, and
              chassis geometry engineered for zero-flex cornering stability.
            </p>
            <div className="story-specs-grid">
              <div className="spec-pill">
                <CheckCircle2 size={13} />
                <span>Carbon-Composite Panels</span>
              </div>
              <div className="spec-pill">
                <CheckCircle2 size={13} />
                <span>Modular Structural Subframe</span>
              </div>
              <div className="spec-pill">
                <CheckCircle2 size={13} />
                <span>Active Air-Flow Ducts</span>
              </div>
            </div>
          </motion.div>

          {/* SECTION 2: Exploded Powertrain & Components (52% - 76% - Right Aligned) */}
          <motion.div
            className="story-block story-right"
            style={{ opacity: opacity2, y: y2, pointerEvents: pointerEvents2 }}
          >
            <div className="story-badge-highlight lime">
              <Cpu size={14} />
              <span>STAGE 02 — EXPLODED POWERTRAIN</span>
            </div>
            <h3 className="story-heading">
              High-Tolerance Internal Architecture
            </h3>
            <p className="story-description">
              Full mechanical deconstruction: naturally aspirated V12 powertrain,
              dual-clutch transmission, multi-link adaptive coilover suspension,
              high-efficiency aluminum thermal cooling cores, and vented carbon-ceramic brakes.
            </p>
            <div className="story-specs-grid">
              <div className="spec-pill">
                <Zap size={13} />
                <span>Brembo Carbon-Ceramic Discs</span>
              </div>
              <div className="spec-pill">
                <Zap size={13} />
                <span>High-Pressure Radiators</span>
              </div>
              <div className="spec-pill">
                <Zap size={13} />
                <span>Forged Lightweight Alloy Wheels</span>
              </div>
            </div>
          </motion.div>

          {/* SECTION 3: Reassembled Performance & Final CTA (80% - 100% - Centered) */}
          <motion.div
            className="story-block story-center"
            style={{ opacity: opacity3, y: y3, pointerEvents: pointerEvents3 }}
          >
            <div className="story-badge-accent">
              <Boxes size={14} />
              <span>STAGE 03 — REASSEMBLED PRECISION</span>
            </div>
            <h2 className="story-title-large">
              OEM QUALITY. <strong>ZERO COMPROMISE.</strong>
            </h2>
            <p className="story-lead">
              Every part inspected, verified, and backed by manufacturer warranty.
              Source genuine replacement components with guaranteed compatibility on SpareHub.
            </p>
            <div className="assembly-cta-group">
              <Link to="/products" className="assembly-btn-primary">
                <Search size={18} />
                <span>Explore Catalog (50,000+ Parts)</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/register" className="assembly-btn-secondary">
                <span>Join SpareHub Network</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
