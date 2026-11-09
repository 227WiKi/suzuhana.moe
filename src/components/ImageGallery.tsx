"use client";

import { useState } from "react";
import type { Media } from "@/lib/api";
import { AlertCircle, Play } from "lucide-react";
import { useLightbox } from "./LightboxProvider";

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
  const isVideo = media.type === 'video';
  const previewUrl = media.thumbnail_url || media.url;
  const hasVideoPoster = isVideo && previewUrl !== media.url;

  if (isError) {
    return (
      <div className={`w-full h-full bg-muted flex flex-col items-center justify-center text-muted-foreground p-2 text-center select-none border border-border ${className}`}>
        <AlertCircle size={16} aria-hidden="true" className="mb-2" />
        <span className="text-sm">媒体加载失败</span>
        <button type="button" onClick={() => setIsError(false)} className="control-size mt-2 rounded-lg px-3 text-sm underline">重试</button>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`w-full h-full relative group cursor-pointer ${className}`}
    >
      {isVideo && !hasVideoPoster ? (
        <video
          src={media.url}
          className="w-full h-full object-cover"
          muted
          playsInline
          preload="metadata"
          onError={() => setIsError(true)}
        />
      ) : (
        <img
          src={previewUrl}
          alt="Media"
          loading="lazy"
          decoding="async"
          onError={() => setIsError(true)}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      )}

      <div className={`absolute inset-0 transition-colors pointer-events-none ${
        isVideo ? 'bg-black/10 group-hover:bg-black/20' : 'bg-black/0 group-hover:bg-black/10'
      }`} />

      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 dark:bg-black/60 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition duration-300">
            <Play size={20} className="fill-black dark:fill-white text-foreground ml-1" />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ImageGallery({ media }: { media: Media[] }) {
  const lightbox = useLightbox();

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
    <div
      className={`grid gap-1 rounded-xl overflow-hidden mt-3 border border-border ${gridClassName}`}
      onPointerEnter={lightbox.preload}
    >
      {media.map((m, index) => {
        const isThreeLayout = media.length === 3;
        const spanClass = isThreeLayout && index === 0 ? "row-span-2" : "";

        return (
          <div key={m.url + index} className={`relative bg-muted overflow-hidden ${spanClass}`}>
            <GalleryItem
              media={m}
              onClick={() => void lightbox.open(media, index)}
            />
          </div>
        );
      })}
    </div>
  );
}
