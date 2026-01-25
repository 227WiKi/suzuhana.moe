"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const getGroupKey = (pathname: string) => {
  const parts = pathname.split('/').filter(Boolean);
  const section = parts[1];
  if (!section) return "profile";
  if (section === "tweets" || section === "media") return "twitter-group"; 
  return section; 
};

export default function SectionTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const groupKey = getGroupKey(pathname);

  return (
    <div className="w-full min-h-screen">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={groupKey}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1, 
            transition: { duration: 0.3, ease: "easeOut" }
          }}
          exit={{ 
            opacity: 0, 
            transition: { duration: 0 } 
          }}
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}