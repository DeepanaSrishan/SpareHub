import { ArrowUp } from "lucide-react";
import useScrollProgress from "../../hooks/useScrollProgress";

export default function ScrollToTopButton() {
    const { scrollProgress, isScrolled } = useScrollProgress(250);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // Radius and circumference of circular progress ring
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

    return (
        <button
            type="button"
            className={`scroll-to-top-btn ${isScrolled ? "visible" : ""}`}
            onClick={scrollToTop}
            aria-label="Scroll back to top"
            title={`Scrolled ${Math.round(scrollProgress)}% - Click to return to top`}
        >
            <svg
                className="scroll-to-top-svg"
                width="52"
                height="52"
                viewBox="0 0 52 52"
            >
                <defs>
                    <linearGradient id="scrollGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#2563eb" />
                        <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                </defs>
                <circle
                    className="scroll-to-top-bg-circle"
                    cx="26"
                    cy="26"
                    r={radius}
                />
                <circle
                    className="scroll-to-top-prog-circle"
                    cx="26"
                    cy="26"
                    r={radius}
                    strokeDasharray={circumference}
                    strokeDashoffset={isNaN(strokeDashoffset) ? circumference : strokeDashoffset}
                />
            </svg>
            <ArrowUp size={20} className="scroll-to-top-icon" />
        </button>
    );
}
