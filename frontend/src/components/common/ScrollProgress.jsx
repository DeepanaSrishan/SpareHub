import { motion, useScroll, useSpring } from "framer-motion";

/**
 * ScrollProgress provides a smooth, hardware-accelerated progress bar
 * fixed at the top of the viewport using Framer Motion springs.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <div className="scroll-progress-track" aria-hidden="true">
      <motion.div
        className="scroll-progress-fill"
        style={{
          scaleX,
          transformOrigin: "0%",
          width: "100%",
        }}
      />
    </div>
  );
}
