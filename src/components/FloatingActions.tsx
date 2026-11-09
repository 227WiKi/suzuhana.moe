"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import { ArrowUp, Moon, Sun } from "lucide-react";
import { ARCHIVE_SCROLL_TO_TOP_EVENT } from "@/lib/ui-events";

const subscribeToHydration = () => () => undefined;

export default function FloatingActions() {
  const [showTopBtn, setShowTopBtn] = useState(false);
  const mounted = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const { resolvedTheme, setTheme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const isDarkMode = resolvedTheme === "dark";

  useEffect(() => {
    const handleScroll = () => setShowTopBtn(window.scrollY > 300);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    const event = new Event(ARCHIVE_SCROLL_TO_TOP_EVENT, { cancelable: true });
    const shouldUseWindowFallback = window.dispatchEvent(event);
    if (shouldUseWindowFallback) {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      <button
        onClick={() => setTheme(isDarkMode ? "light" : "dark")}
        className="icon-control touch-target rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-muted"
        title="Toggle Theme"
        aria-label="Toggle theme"
      >
        {isDarkMode ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
      </button>

      <button
        onClick={scrollToTop}
        className={`icon-control touch-target rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-all duration-300 hover:bg-muted ${showTopBtn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}
        title="Back to Top"
        aria-label="Back to top"
      >
        <ArrowUp size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
