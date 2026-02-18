"use client";

import { useEffect, useState } from "react";
import { ArrowUp, Moon, Sun } from "lucide-react";

export default function FloatingActions() {
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); 
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const savedTheme = localStorage.getItem("theme");
    let initialDarkState;

    if (savedTheme) {
      initialDarkState = savedTheme === "dark";
    } else {
      initialDarkState = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    setIsDarkMode(initialDarkState);
    
    if (initialDarkState) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {

    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      
      <button
        onClick={toggleTheme}
        className="p-3 rounded-full shadow-lg transition-all duration-300 
          bg-gray-200 text-gray-800 hover:bg-gray-300
          dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700
          border border-gray-300 dark:border-gray-700"
        title="Toggle Theme"
      >
        {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      <button
        onClick={scrollToTop}
        className={`p-3 rounded-full shadow-lg transition-all duration-300 
          bg-[#008CD2] text-white hover:bg-[#00A9CC]
          ${showTopBtn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}
        `}
        title="Back to Top"
      >
        <ArrowUp size={24} />
      </button>
      
    </div>
  );
}