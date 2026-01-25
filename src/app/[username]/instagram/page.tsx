"use client";

import { Construction } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InstagramPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="bg-gradient-to-tr from-yellow-400 to-orange-500 p-6 rounded-3xl shadow-xl mb-6"
      >
        <Construction size={64} className="text-white" />
      </motion.div>
      <h1 className="text-3xl font-black mb-2 text-gray-800 dark:text-gray-100">
        Instagram
      </h1>
      <p className="text-gray-500 dark:text-gray-400 text-lg font-medium max-w-md">
        This section is currently under development. <br/>
        Please check back later for updates!
      </p>
    </div>
  );
}