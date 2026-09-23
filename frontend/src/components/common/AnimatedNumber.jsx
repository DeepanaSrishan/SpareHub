import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

/**
 * AnimatedNumber smoothly counts up from 0 to a target number
 * when scrolled into view.
 * 
 * @param {Object} props
 * @param {number|string} props.value - Target numeric value (e.g. 1500, "99.8")
 * @param {string} [props.prefix=""] - String prefix (e.g. "$", "Rs. ")
 * @param {string} [props.suffix=""] - String suffix (e.g. "+", "%")
 * @param {number} [props.duration=1.6] - Animation duration in seconds
 * @param {number} [props.decimals=0] - Decimal places to round to
 * @param {string} [props.className=""] - Optional class name
 */
export default function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  duration = 1.6,
  decimals = 0,
  className = "",
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [displayValue, setDisplayValue] = useState(0);

  // Extract pure numeric portion from value
  const numericTarget = typeof value === "number" 
    ? value 
    : parseFloat(String(value).replace(/[^0-9.-]/g, "")) || 0;

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(0, numericTarget, {
      duration,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo
      onUpdate: (latest) => {
        setDisplayValue(latest);
      },
    });

    return () => controls.stop();
  }, [isInView, numericTarget, duration]);

  const formatted = decimals > 0 
    ? displayValue.toFixed(decimals) 
    : Math.round(displayValue).toLocaleString();

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
