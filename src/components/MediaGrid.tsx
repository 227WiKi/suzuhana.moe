"use client";

import ArchiveEmptyState from "@/components/ArchiveEmptyState";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Heart, Info, Loader2, Play, X } from "lucide-react";
import type { ArchivePage, ArchiveUser, Media, MediaArchiveItem, Tweet } from "@/lib/api";
import { appendArchiveFilters, type ArchiveFilters } from "@/lib/archive-filters";
import { loadGLightbox, preloadGLightbox, type LightboxInstance, type LightboxOptions } from "@/lib/glightbox";
import TweetCard from "./TweetCard";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import "glightbox/dist/css/glightbox.min.css";

const BATCH_SIZE = 15;
const LIGHTBOX_SCROLL_KEYS = new Set([
  "ArrowDown",
  "ArrowUp",
  "End",
  "Home",
  "PageDown",
  "PageUp",
  " ",
]);
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
  const previewUrl = media.thumbnail_url || media.url;
  const hasVideoPoster = media.type === "video" && previewUrl !== media.url;
  if (isError) {
    return (
      <div className="w-full aspect-square bg-muted border border-border flex flex-col items-center justify-center text-muted-foreground p-2 rounded-xl mb-3">
        <AlertCircle size={16} aria-hidden="true" className="mb-2" />
        <p className="text-sm">媒体加载失败</p>
        <button type="button" onClick={() => setIsError(false)} className="control-size mt-2 rounded-lg px-3 text-sm underline">重试</button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerEnter={onPreload}
      className="block w-full text-left relative group bg-muted rounded-xl overflow-hidden cursor-pointer border border-transparent dark:border-border mb-3 shadow-sm hover:shadow-md transition-shadow"
    >
      {media.type === "video" && !hasVideoPoster ? (
        <div className="w-full relative">
          <video src={media.url} className="w-full h-auto object-cover pointer-events-none" preload="metadata" muted onError={() => setIsError(true)} />
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition">
            <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center shadow-sm">
              <Play fill="white" className="text-white ml-1 w-4 h-4" />
            </div>
          </div>
        </div>
      ) : (
        <img
          src={previewUrl}
          loading="lazy"
          decoding="async"
          onError={() => setIsError(true)}
          className="w-full h-auto object-cover hover:opacity-90 transition duration-500"
          alt="media"
        />
      )}
      <div className="absolute inset-0 bg-media-background/60 opacity-0 group-hover:opacity-100 transition duration-300 flex items-end justify-start p-3">
        <div className="flex items-center gap-2 text-white font-bold text-sm drop-shadow-md">
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
  filters: ArchiveFilters;
}

function getMediaPageUrl(slug: string, offset: number, limit: number, filters: ArchiveFilters) {
  const params = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });
  appendArchiveFilters(params, filters);
  return `/api/archive/${encodeURIComponent(slug)}/media?${params.toString()}`;
}

function subscribeToViewport(callback: () => void) {
  window.addEventListener("resize", callback, { passive: true });
  return () => window.removeEventListener("resize", callback);
}

export default function MediaGrid({ initialItems, total, nextOffset: initialNextOffset, slug, user, filters }: MediaGridProps) {
  const [items, setItems] = useState(initialItems);
  const [nextOffset, setNextOffset] = useState(initialNextOffset);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSlideTweet, setActiveSlideTweet] = useState<Tweet | null>(null);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isLightboxClosing, setIsLightboxClosing] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<LightboxInstance | null>(null);
  const numColumns = useSyncExternalStore(subscribeToViewport, () => window.innerWidth < 768 ? 2 : 3, () => 3);

  const columns = useMemo(() => {
    const result = Array.from({ length: numColumns }, () => [] as MediaArchiveItem[]);
    items.forEach((item, index) => result[index % numColumns].push(item));
    return result;
  }, [items, numColumns]);

  const preloadLightbox = useCallback(() => {
    void preloadGLightbox();
  }, []);

  const loadMore = useCallback(async () => {
    if (nextOffset === null || isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch(getMediaPageUrl(slug, nextOffset, BATCH_SIZE, filters));
      if (!response.ok) throw new Error(`Media page returned ${response.status}`);
      const page = await response.json() as ArchivePage<MediaArchiveItem>;
      setItems((current) => [...current, ...page.items]);
      setNextOffset(page.nextOffset);
    } catch (error) {
      console.error("Unable to load the next media page", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, isLoading, nextOffset, slug]);

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

  useEffect(() => {
    if (!isLightboxOpen) return;

    const preventBackgroundScroll = (event: Event) => event.preventDefault();
    const preventBackgroundScrollKey = (event: KeyboardEvent) => {
      const target = event.target;
      const isInteractiveTarget = target instanceof HTMLElement
        && Boolean(target.closest("button, a, input, select, textarea, [role='button']"));
      if (LIGHTBOX_SCROLL_KEYS.has(event.key) && !(event.key === " " && isInteractiveTarget)) {
        event.preventDefault();
      }
    };

    window.addEventListener("wheel", preventBackgroundScroll, { passive: false });
    window.addEventListener("touchmove", preventBackgroundScroll, { passive: false });
    window.addEventListener("keydown", preventBackgroundScrollKey);
    return () => {
      window.removeEventListener("wheel", preventBackgroundScroll);
      window.removeEventListener("touchmove", preventBackgroundScroll);
      window.removeEventListener("keydown", preventBackgroundScrollKey);
    };
  }, [isLightboxOpen]);

  const openLightbox = useCallback(async (clickedItem: MediaArchiveItem) => {
    const [GLightbox, response] = await Promise.all([
      loadGLightbox(),
      items.length >= total
        ? Promise.resolve(null)
        : fetch(getMediaPageUrl(slug, 0, total, filters)),
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
      preload: false,
      loop: false,
      zoomable: true,
      draggable: true,
      autoplayVideos: true,
      plyr: { config: {} },
    } as unknown as LightboxOptions;
    const instance = GLightbox(lightboxOptions);
    // GLightbox emits "close" after its exit animation. Start the floating
    // control's exit alongside it, while keeping the portal mounted.
    const closeLightbox = instance.close.bind(instance);
    instance.close = () => {
      setIsLightboxClosing(true);
      return closeLightbox();
    };
    (instance as unknown as LightboxWithSlideEvents).on("slide_changed", (data) => {
      const currentItem = archiveItems[data.current.index];
      if (currentItem) setActiveSlideTweet(currentItem.tweet);
    });
    instance.on("open", () => {
      setActiveSlideTweet(clickedItem.tweet);
      setIsCardOpen(false);
      setIsLightboxClosing(false);
      setIsLightboxOpen(true);
    });
    instance.on("close", () => {
      setIsLightboxOpen(false);
      setIsLightboxClosing(false);
      setIsCardOpen(false);
    });
    lightboxRef.current = instance;
    instance.openAt(Math.max(clickedIndex, 0));
  }, [filters, items, slug, total]);

  if (items.length === 0) {
    return (
      <ArchiveEmptyState message="没有符合该日期范围的媒体。" href={`/${slug}/media`} label="查看全部媒体" />
    );
  }

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

      {activeSlideTweet && (isLightboxOpen || isLightboxClosing) && createPortal(
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9_999_999 }}>
          <AnimatePresence>
            {isLightboxOpen && !isLightboxClosing && !isCardOpen && (
              <motion.button
                key="view-btn"
                aria-label="View post"
                onClick={(event) => { event.stopPropagation(); setIsCardOpen(true); }}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: 0.35, type: "spring", stiffness: 200, damping: 20 } }}
                exit={{ opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.2 } }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute top-4 left-4 sm:top-6 sm:left-6 pointer-events-auto bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full flex items-center gap-2 border border-white/20 cursor-pointer shadow-sm"
              >
                <Info size={16} aria-hidden="true" />
                <span className="text-sm font-bold hidden sm:inline">View post</span>
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
            disableZoomAnimation
            overlayClassName="z-[10000000] bg-black/60 duration-200"
            className="media-tweet-dialog-content z-[10000001] w-full max-w-lg p-0 bg-transparent dark:bg-transparent ring-0"
          >
            <DialogTitle className="sr-only">Archived tweet details</DialogTitle>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsCardOpen(false)}
              className="icon-control absolute -top-12 right-0 p-2 text-white/80 transition cursor-pointer"
              aria-label="Close tweet details"
            >
              <X size={16} aria-hidden="true" />
            </motion.button>
            <div className="shadow-sm rounded-2xl overflow-hidden">
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
      <style jsx global>{`
        @keyframes media-tweet-out {
          from { opacity: 1; scale: 1; }
          to { opacity: 0; scale: 0.96; }
        }

        .media-tweet-dialog-content[data-state="closed"] {
          animation: media-tweet-out 200ms ease-out forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .media-tweet-dialog-content[data-state="closed"] {
            animation-duration: 0.01ms;
          }
        }
      `}</style>
    </>
  );
}
