import { useEffect, useRef, useState } from "react";

/**
 * Hook to observe a single element and trigger animation when scrolled into view.
 */
export function useScrollReveal(options = {}) {
    const { threshold = 0.15, rootMargin = "0px 0px -40px 0px", once = true } = options;
    const ref = useRef(null);
    const [isRevealed, setIsRevealed] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        // Fallback for environments where IntersectionObserver is unavailable
        if (!("IntersectionObserver" in window)) {
            setIsRevealed(true);
            return;
        }

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsRevealed(true);
                if (once) {
                    observer.unobserve(node);
                }
            } else if (!once) {
                setIsRevealed(false);
            }
        }, { threshold, rootMargin });

        observer.observe(node);

        return () => {
            if (node) observer.unobserve(node);
        };
    }, [threshold, rootMargin, once]);

    return [ref, isRevealed];
}

/**
 * Global observer function that scans the DOM for `.scroll-reveal` elements
 * and triggers them as they enter the viewport.
 */
export function useAutoScrollReveal(deps = []) {
    useEffect(() => {
        if (!("IntersectionObserver" in window)) {
            document.querySelectorAll(".scroll-reveal").forEach((el) => {
                el.classList.add("is-revealed");
            });
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-revealed");
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -50px 0px",
            }
        );

        const elements = document.querySelectorAll(".scroll-reveal:not(.is-revealed)");
        elements.forEach((el) => observer.observe(el));

        return () => {
            elements.forEach((el) => observer.unobserve(el));
        };
    }, deps);
}

export default useScrollReveal;
