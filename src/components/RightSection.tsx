"use client";

import { useRef, useState, useEffect } from "react";

export default function RightSection() {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [positionStyle, setPositionStyle] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      if (placeholderRef.current) {
        const rect = placeholderRef.current.getBoundingClientRect();
        setPositionStyle({
          left: rect.left,
          width: rect.width,
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, []);

  return (
    <>
      <div 
        ref={placeholderRef}
        className="hidden lg:block w-[350px] flex-shrink-0 opacity-0 pointer-events-none"
        aria-hidden="true"
      />

      <div 
        className={`
          hidden lg:block fixed top-3
          h-[calc(100vh-24px)] overflow-y-auto custom-scrollbar
          transition-opacity duration-150
          ${positionStyle ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          left: positionStyle?.left,
          width: positionStyle?.width,
        }}
      >
        <div className="bg-gray-50 dark:bg-[#16181c] border border-gray-200 dark:border-none rounded-xl p-4 mb-4 transition-colors">
          <h2 className="text-xl font-bold mb-4 text-black dark:text-white">About</h2>
          <div className="text-gray-600 dark:text-gray-500 text-sm leading-relaxed">
            22/7 成员社交媒体的数字留档
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4 px-4 leading-relaxed">
          <span>
            <a
              href="https://suzuhana.moe"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors font-medium"
            >
              Project Suzuhana Moe
            </a>
            , part of{' '}
            <span className="inline-flex items-center gap-1 align-bottom">
              <img
                src="https://nananiji.zzzhxxx.top/assets/home/logo.svg"
                alt="22/7 Wiki"
                className="w-4 h-4"
              />
              <span>Project.</span>
            </span>
            <br />
            © 2026 22/7 WiKi All rights reserved.
          </span>
        </div>
      </div>
    </>
  );
}