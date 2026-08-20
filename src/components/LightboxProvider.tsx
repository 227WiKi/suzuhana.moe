"use client";

import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import type GLightboxFactory from "glightbox";
import type { Media } from "@/lib/api";
import "glightbox/dist/css/glightbox.min.css";

type LightboxInstance = ReturnType<typeof GLightboxFactory>;
type LightboxModule = { default: typeof GLightboxFactory };

interface LightboxContextValue {
  open: (media: Media[], index: number) => Promise<void>;
  preload: () => void;
}

const LightboxContext = createContext<LightboxContextValue | null>(null);

export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const instanceRef = useRef<LightboxInstance | null>(null);
  const modulePromiseRef = useRef<Promise<LightboxModule> | null>(null);

  const preload = useCallback(() => {
    modulePromiseRef.current ??= import("glightbox") as Promise<LightboxModule>;
  }, []);

  const open = useCallback(async (media: Media[], index: number) => {
    if (media.length === 0) return;
    modulePromiseRef.current ??= import("glightbox") as Promise<LightboxModule>;
    const { default: GLightbox } = await modulePromiseRef.current;

    instanceRef.current?.destroy();
    const options = {
      elements: media.map((item) => ({
        href: item.url,
        type: item.type === "video" ? "video" : "image",
        width: item.type === "video" ? "90vw" : undefined,
        source: item.type === "video" ? "local" : undefined,
      })),
      touchNavigation: true,
      preload: false,
      loop: false,
      zoomable: true,
      draggable: true,
      openEffect: "zoom",
      closeEffect: "zoom",
      autoplayVideos: true,
      plyr: { config: { fullscreen: { enabled: true, iosNative: true } } },
      width: "auto",
      height: "auto",
    } as unknown as Parameters<typeof GLightbox>[0];
    const instance = GLightbox(options);
    instanceRef.current = instance;
    instance.openAt(index);
  }, []);

  useEffect(() => () => instanceRef.current?.destroy(), []);

  return (
    <LightboxContext.Provider value={{ open, preload }}>
      {children}
    </LightboxContext.Provider>
  );
}

export function useLightbox() {
  const context = useContext(LightboxContext);
  if (!context) throw new Error("useLightbox must be used inside LightboxProvider");
  return context;
}
