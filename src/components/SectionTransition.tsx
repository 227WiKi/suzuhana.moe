"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

const getGroupKey = (pathname: string) => {
  const parts = pathname.split('/').filter(Boolean);
  const section = parts[1];
  if (!section) return "profile";
  if (section === "tweets" || section === "media") return "twitter-group";
  return section;
};

// Fades a section in when the member navigates to another section.
//
// This used to be a framer-motion element inside AnimatePresence mode="wait".
// Its exiting copy kept rendering the live route, so the new page was painted
// at full opacity inside the old wrapper, then unmounted and mounted again at
// opacity 0: a visible flash, and every page mounted twice. A plain key swaps
// the section in one commit, and the fade is a CSS animation (.section-fade-in).
export default function SectionTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const groupKey = getGroupKey(pathname);
  // Skip the fade on the first page load; only section changes animate.
  const [previousKey, setPreviousKey] = useState(groupKey);
  const [navigated, setNavigated] = useState(false);
  if (previousKey !== groupKey) {
    setPreviousKey(groupKey);
    setNavigated(true);
  }

  return (
    <div className="w-full min-h-screen">
      <div key={groupKey} className={navigated ? "section-fade-in w-full" : "w-full"}>
        {children}
      </div>
    </div>
  );
}
