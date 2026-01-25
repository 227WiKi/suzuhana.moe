"use client";

import { motion } from "framer-motion";

export default function ProfileEntry({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 20 }} 
      animate={{ opacity: 1, scale: 1, y: 0 }}  
      transition={{ 
        duration: 0.5, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      className="flex flex-row w-full min-h-screen"
    >
      {children}
    </motion.div>
  );
}