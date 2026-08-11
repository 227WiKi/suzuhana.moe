"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Heart, Info, Loader2, Play, X } from "lucide-react";
import type GLightboxFactory from "glightbox";
import type { ArchivePage, ArchiveUser, Media, MediaArchiveItem, Tweet } from "@/lib/api";
import TweetCard from "./TweetCard";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import "glightbox/dist/css/glightbox.min.css";

const BATCH_SIZE = 15;
type LightboxInstance = ReturnType<typeof GLightboxFactory>;
type LightboxModule = { default: typeof GLightboxFactory };
interface LightboxWithSlideEvents {
  on(eventName: "slide_changed", callback: (data: { current: { index: number } }) => void): void;
}

function MediaItem({ media, likes, onClick, onPreload }: {
  media: Media;
  likes: number;
  onClick: () => void;
  onPreload: () => void;
}) {
  const [isError, setIsError] = useState(false);
  if (isError) {
    return (
      <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 p-2 rounded-xl mb-3">
        <AlertCircle size={20} className="mb-2 opacity-50" />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerEnter={onPreload}
      className="block w-full text-left relative group bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden cursor-pointer border border-transparent dark:border-gray-800 mb-3 shadow-sm hover:shadow-md transition-shadow"
    >
      {media.type === "video" ? (
        <div className="w-full relative">
          <video src={media.url} className="w-full h-auto object-cover pointer-events-none" preload="metadata" muted onError={() => setIsError(true)} />
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition">
            <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm shadow-lg">
              <Play fill="white" className="text-white ml-1 w-4 h-4" />
            </div>
          </div>
        </div>
      ) : (
        <img
          src={media.thumbnail_url || media.url}
          loading="lazy"
          onError={() => setIsError(true)}
          className="w-full h-auto object-cover hover:opacity-90 transition duration-500"
          alt="media"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end justify-start p-3">
        <div className="flex items-center gap-1.5 text-white font-bold text-sm drop-shadow-md">
          <Heart fill="white" size={16} />
          <span>{likes}</span>
        </div>
      </div>
    </button>
  );
}

interface MediaGridProps {
  initialItems: MediaArchiveItem[];
  total: number;
  nextOffset: number | null;
  slug: string;
  user: ArchiveUser;
}

function subscribeToViewport(callback: () => void) {
  window.addEventListener("resize", callback, { passive: true });
  return () => window.removeEventListener("resize", callback);
}

export default function MediaGrid({ initialItems, total, nextOffset: initialNextOffset, slug, user }: MediaGridProps) {
  const [items, setItems] = useState(initialItems);
  const [nextOffset, setNextOffset] = useState(initialNextOffset);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSlideTweet, setActiveSlideTweet] = useState<Tweet | null>(null);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxContainer, setLightboxContainer] = useState<HTMLElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<LightboxInstance | null>(null);
  const modulePromiseRef = useRef<Promise<LightboxModule> | null>(null);
  const numColumns = useSyncExternalStore(subscribeToViewport, () => window.innerWidth < 768 ? 2 : 3, () => 3);

  const columns = useMemo(() => {
    const result = Array.from({ length: numColumns }, () => [] as MediaArchiveItem[]);
    items.forEach((item, index) => result[index % numColumns].push(item));
    return result;
  }, [items, numColumns]);

  const preloadLightbox = useCallback(() => {
    modulePromiseRef.current ??= import("glightbox") as Promise<LightboxModule>;
  }, []);

  const loadMore = useCallback(async () => {
    if (nextOffset === null || isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/archive/${encodeURIComponent(slug)}/media?offset=${nextOffset}&limit=${BATCH_SIZE}`);
      if (!response.ok) throw new Error(`Media page returned ${response.status}`);
      const page = await response.json() as ArchivePage<MediaArchiveItem>;
      setItems((current) => [...current, ...page.items]);
      setNextOffset(page.nextOffset);
    } catch (error) {
      console.error("Unable to load the next media page", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, nextOffset, slug]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || nextOffset === null) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) void loadMore(); },
      { rootMargin: "400px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, nextOffset]);

  useEffect(() => () => lightboxRef.current?.destroy(), []);

  const openLightbox = useCallback(async (clickedItem: MediaArchiveItem) => {
    preloadLightbox();
    const [module, response] = await Promise.all([
      modulePromiseRef.current!,
      items.length >= total
        ? Promise.resolve(null)
        : fetch(`/api/archive/${encodeURIComponent(slug)}/media?offset=0&limit=${total}`),
    ]);
    let archiveItems = items;
    if (response) {
      if (!response.ok) throw new Error(`Full media archive returned ${response.status}`);
      archiveItems = ((await response.json()) as ArchivePage<MediaArchiveItem>).items;
    }

    const clickedIndex = archiveItems.findIndex((item) =>
      item.tweet.id === clickedItem.tweet.id && item.media.url === clickedItem.media.url,
    );
    lightboxRef.current?.destroy();
    const lightboxOptions = {
      elements: archiveItems.map((item) => item.media.type === "video"
        ? { href: item.media.url, type: "video", source: [{ src: item.media.url, type: "video/mp4" }], width: "80vw" }
        : { href: item.media.url, type: "image" }),
      touchNavigation: true,
      loop: false,
      zoomable: true,
      draggable: true,
      autoplayVideos: true,
      plyr: { config: {} },
    } as unknown as Parameters<typeof module.default>[0];
    const instance = module.default(lightboxOptions);
    (instance as unknown as LightboxWithSlideEvents).on("slide_changed", (data) => {
      const currentItem = archiveItems[data.current.index];
      if (currentItem) setActiveSlideTweet(currentItem.tweet);
    });
    instance.on("open", () => {
      setActiveSlideTweet(clickedItem.tweet);
      setIsCardOpen(false);
      setIsLightboxOpen(true);
      setLightboxContainer(document.querySelector<HTMLElement>(".glightbox-container"));
    });
    instance.on("close", () => {
      setIsLightboxOpen(false);
      setIsCardOpen(false);
      setLightboxContainer(null);
    });
    lightboxRef.current = instance;
    instance.openAt(Math.max(clickedIndex, 0));
  }, [items, preloadLightbox, slug, total]);

  if (items.length === 0) return <div className="p-10 text-center text-gray-500">No media found.</div>;

  return (
    <>
      <div className="flex gap-3 px-1 mt-2 items-start">
        {columns.map((columnItems, columnIndex) => (
          <div key={columnIndex} className="flex-1 flex flex-col gap-0">
            {columnItems.map((item, index) => (
              <MediaItem
                key={`${item.tweet.id}-${item.media.url}-${index}`}
                media={item.media}
                likes={item.tweet.stats.likes}
                onPreload={preloadLightbox}
                onClick={() => void openLightbox(item)}
              />
            ))}
          </div>
        ))}
      </div>

      {nextOffset !== null && (
        <div ref={sentinelRef} className="py-10 flex justify-center w-full">
          <Loader2 className={`text-blue-500 w-8 h-8 ${isLoading ? "animate-spin" : "opacity-40"}`} />
        </div>
      )}

      {activeSlideTweet && lightboxContainer && createPortal(
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9_999_999 }}>
          <AnimatePresence>
            {isLightboxOpen && !isCardOpen && (
              <motion.button
                key="view-btn"
                onClick={(event) => { event.stopPropagation(); setIsCardOpen(true); }}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: 0.35, type: "spring", stiffness: 200, damping: 20 } }}
                exit={{ opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.2 } }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute top-4 left-4 sm:top-6 sm:left-6 pointer-events-auto bg-black/50 hover:bg-black/70 text-white backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/20 cursor-pointer shadow-lg"
              >
                <Info size={18} />
                <span className="text-sm font-bold hidden sm:inline">View Tweet</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>,
        document.body,
      )}

      <Dialog open={isCardOpen} onOpenChange={setIsCardOpen}>
        {activeSlideTweet && (
          <DialogContent
            showCloseButton={false}
            overlayClassName="z-[10000000] bg-black/60 backdrop-blur-sm"
            className="z-[10000001] w-full max-w-lg p-0 bg-transparent dark:bg-transparent ring-0"
          >
            <DialogTitle className="sr-only">Archived tweet details</DialogTitle>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.1, color: "#ffffff" }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsCardOpen(false)}
              className="absolute -top-12 right-0 p-2 text-white/80 transition cursor-pointer"
              aria-label="Close tweet details"
            >
              <X size={32} />
            </motion.button>
            <div className="shadow-2xl rounded-2xl overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={activeSlideTweet.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <TweetCard tweet={activeSlideTweet} user={user} hideMedia />
                </motion.div>
              </AnimatePresence>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
