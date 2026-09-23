import { motion } from "framer-motion";

/**
 * AnimatedSection triggers a smooth entrance animation when scrolled into view.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className=""]
 * @param {string} [props.id]
 * @param {number} [props.delay=0] - Delay in seconds
 * @param {'up' | 'down' | 'left' | 'right' | 'zoom' | 'fade'} [props.direction='up']
 * @param {number} [props.duration=0.55]
 * @param {boolean} [props.once=true] - Animate only once when in view
 * @param {number} [props.amount=0.15] - Viewport intersection threshold
 */
export default function AnimatedSection({
  children,
  className = "",
  id,
  delay = 0,
  direction = "up",
  duration = 0.55,
  once = true,
  amount = 0.15,
  ...rest
}) {
  const getInitial = () => {
    switch (direction) {
      case "up":
        return { opacity: 0, y: 32 };
      case "down":
        return { opacity: 0, y: -32 };
      case "left":
        return { opacity: 0, x: 36 };
      case "right":
        return { opacity: 0, x: -36 };
      case "zoom":
        return { opacity: 0, scale: 0.94, y: 16 };
      case "fade":
      default:
        return { opacity: 0 };
    }
  };

  const getAnimate = () => {
    switch (direction) {
      case "up":
      case "down":
        return { opacity: 1, y: 0 };
      case "left":
      case "right":
        return { opacity: 1, x: 0 };
      case "zoom":
        return { opacity: 1, scale: 1, y: 0 };
      case "fade":
      default:
        return { opacity: 1 };
    }
  };

  return (
    <motion.section
      id={id}
      className={className}
      initial={getInitial()}
      whileInView={getAnimate()}
      viewport={{ once, amount }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1], // Custom smooth ease-out curve
      }}
      {...rest}
    >
      {children}
    </motion.section>
  );
}
