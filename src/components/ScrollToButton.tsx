"use client";

import type { ReactNode } from "react";

// Smooth-scrolls to an in-page section. Done in JS so the rest of the site
// keeps the default instant scroll behaviour.
export default function ScrollToButton({ targetId, className, children }: {
  targetId: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={`#${targetId}`}
      className={className}
      onClick={(event) => {
        const target = document.getElementById(targetId);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
    >
      {children}
    </a>
  );
}
