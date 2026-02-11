"use client";

import { useEffect, useRef } from "react";
import { Copy, Heart, MessageCircle } from "lucide-react";
import "glightbox/dist/css/glightbox.min.css"; 

interface InstagramGridProps {
  posts: any[];
}

export default function InstagramGrid({ posts }: InstagramGridProps) {
  const lightboxRef = useRef<any>(null);

  useEffect(() => {
    const initLightbox = async () => {
      const GLightboxModule = await import("glightbox");
      const GLightbox = GLightboxModule.default;

      lightboxRef.current = GLightbox({
        selector: ".glightbox",
        touchNavigation: true,
        loop: true,
        autoplayVideos: true,
      });
    };

    initLightbox();

    return () => {
      if (lightboxRef.current) {
        lightboxRef.current.destroy();
      }
    };
  }, [posts]);

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-4 p-1 md:p-4">
      {posts.map((post) => (
        <a 
          key={post.id} 
          href={post.images[0]} 
          className="glightbox aspect-square relative group cursor-pointer overflow-hidden"
          data-gallery={`gallery-${post.id}`} 
        >
          <img
            src={post.images[0]}
            alt={post.text}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
          />
        </a>
      ))}
    </div>
  );
}