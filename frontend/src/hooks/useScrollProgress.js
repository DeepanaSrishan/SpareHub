import { useState, useEffect } from "react";

/**
 * useScrollProgress Hook
 * Tracks scroll progress percentage (0 - 100), scroll direction,
 * current scrollY position, and threshold state with 60fps RAF synchronization.
 */
export default function useScrollProgress(threshold = 30) {
    const [scrollState, setScrollState] = useState({
        scrollProgress: 0,
        scrollY: 0,
        isScrolled: false,
        direction: "down",
    });

    useEffect(() => {
        let lastScrollY = window.scrollY || 0;
        let ticking = false;

        const updateScroll = () => {
            const currentScrollY = window.scrollY || 0;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = scrollHeight > 0 ? Math.min(100, Math.max(0, (currentScrollY / scrollHeight) * 100)) : 0;
            const direction = currentScrollY >= lastScrollY ? "down" : "up";

            setScrollState({
                scrollProgress: progress,
                scrollY: currentScrollY,
                isScrolled: currentScrollY > threshold,
                direction,
            });

            lastScrollY = currentScrollY;
            ticking = false;
        };

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateScroll);
                ticking = true;
            }
        };

        // Initial measurement
        updateScroll();

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
    }, [threshold]);

    return scrollState;
}
