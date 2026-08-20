"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { ArrowUp, Moon, Sun } from "lucide-react";
import { ARCHIVE_SCROLL_TO_TOP_EVENT } from "@/lib/ui-events";

const subscribeToHydration = () => () => undefined;

export default function FloatingActions() {
  const [showTopBtn, setShowTopBtn] = useState(false);
  const mounted = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const { resolvedTheme, setTheme } = useTheme();
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
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      <button
        onClick={() => setTheme(isDarkMode ? "light" : "dark")}
        className="p-3 rounded-full shadow-lg transition-all duration-300 bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700"
        title="Toggle Theme"
        aria-label="Toggle theme"
      >
        {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      <button
        onClick={scrollToTop}
        className={`p-3 rounded-full shadow-lg transition-all duration-300 bg-[#008CD2] text-white hover:bg-[#00A9CC] ${showTopBtn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}
        title="Back to Top"
        aria-label="Back to top"
      >
        <ArrowUp size={24} />
      </button>
    </div>
  );
}
