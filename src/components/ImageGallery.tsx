"use client";

import { useEffect, useRef, useState } from "react";
import { Media } from "@/lib/api";
import { AlertCircle } from "lucide-react";
import "glightbox/dist/css/glightbox.min.css";

function GalleryItem({ 
  media, 
  onClick,
  className 
}: { 
  media: Media, 
  onClick?: () => void,
  className?: string 
}) {
  const [isError, setIsError] = useState(false);

  if (isError) {
    return (
      <div className={`w-full h-full bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-2 text-center select-none border border-gray-200 dark:border-gray-700 ${className}`}>
        <AlertCircle size={24} className="mb-2 opacity-50" />
        <span className="text-[10px] sm:text-xs font-medium">媒体可能已被删除<br/>或无法加载</span>
      </div>
    );
  }

  if (media.type === 'video') {
    return (
      <video 
        src={media.url} 
        controls 
        className="w-full h-full object-cover" 
        onClick={(e) => e.stopPropagation()} 
        onError={() => setIsError(true)}
      />
    );
  }

  return (
    <div 
      onClick={onClick}
      className="w-full h-full relative group cursor-pointer"
    >
      <img
        src={media.url}
        alt="Media"
        loading="lazy"
        onError={() => setIsError(true)}
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
    </div>
  );
}

export default function ImageGallery({ media }: { media: Media[] }) {
  const lightboxRef = useRef<any>(null);

  const lightboxElements = media
    .filter(m => m.type !== 'video')
    .map(m => ({
      href: m.url,
      type: 'image'
    }));

  useEffect(() => {
    let instance: any = null;
    const initLightbox = async () => {
      const module = await import("glightbox");
      const GLightbox = module.default;
      instance = GLightbox({
        elements: lightboxElements,
        touchNavigation: true,
        loop: false,
        zoomable: true,
        draggable: true,
        openEffect: 'zoom', 
        closeEffect: 'zoom',
      });
      lightboxRef.current = instance;
    };
    if (lightboxElements.length > 0) initLightbox();
    return () => { if (instance) instance.destroy(); };
  }, [media]);

  const handleOpenLightbox = (url: string) => {
    if (!lightboxRef.current) return;
    const index = lightboxElements.findIndex(item => item.href === url);
    if (index >= 0) lightboxRef.current.openAt(index);
  };

  if (!media || media.length === 0) return null;

  const gridClassName = (() => {
    switch (media.length) {
      case 1: return "grid-cols-1";
      case 2: return "grid-cols-2 aspect-[2/1]";
      case 3: return "grid-cols-2 aspect-[2/1]";
      default: return "grid-cols-2 aspect-square";
    }
  })();

  return (

    <div className={`grid gap-0.5 rounded-xl overflow-hidden mt-3 border border-gray-200 dark:border-gray-800 ${gridClassName}`}>
      {media.map((m, index) => {
        const isThreeLayout = media.length === 3;
        const spanClass = isThreeLayout && index === 0 ? "row-span-2" : "";

        return (
          <div key={m.url + index} className={`relative bg-gray-100 dark:bg-gray-900 overflow-hidden ${spanClass}`}>
            <GalleryItem 
              media={m} 
              onClick={m.type !== 'video' ? () => handleOpenLightbox(m.url) : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}