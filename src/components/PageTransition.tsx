"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FrozenRouter } from "./FrozenRouter";

const isTwitterPage = (path: string) => {
  return path.startsWith("/tweets") || path.endsWith("/media"); 
};


const getPageIndex = (pathname: string) => {
  if (pathname.endsWith("/media")) return 1;
  return 0;
};

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [[page, direction], setPage] = useState([0, 0]);

  const targetIndex = getPageIndex(pathname);
  const targetDirection = targetIndex === 1 ? 1 : -1; 

  if (isTwitterPage(pathname)) {
    if (page !== targetIndex || direction !== targetDirection) {
      setPage([targetIndex, targetDirection]);
    }
  } else {

    if (page !== 0 || direction !== 0) {
      setPage([0, 0]);
    }
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%", 
      opacity: 0, 
      zIndex: 1
    }),
    center: {
      x: 0,
      opacity: 1, 
      zIndex: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? "-100%" : "100%", 
      opacity: 0, 
      zIndex: 0
    }),
  };

  return (
    <div className="grid grid-cols-1 grid-rows-1 w-full overflow-hidden relative">

      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={pathname}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="row-start-1 col-start-1 w-full h-full"
        >
          <FrozenRouter>
            {children}
          </FrozenRouter>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}