"use client";

import { useEffect, useRef, useState, type CSSProperties, type SyntheticEvent } from "react";
import dynamic from "next/dynamic";
import { Layers, X, ChevronLeft, ChevronRight, Loader2, Play, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RichText from "@/components/RichText";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { InstagramMediaItem, InstagramPost } from "@/lib/api";

const InstagramVideoPlayer = dynamic(() => import("@/components/InstagramVideoPlayer"), {
  ssr: false,
});

interface UserData {
  screen_name: string;
  avatar: string;
  name: string;
}

interface InstagramGridProps {
  posts: InstagramPost[];
  userData: UserData;
}

interface MediaFrameSize {
  width: number;
  height: number;
}

const DESKTOP_DIALOG_BREAKPOINT = 1024;
const DETAILS_PANEL_WIDTH = 350;
const MAX_DIALOG_WIDTH = 1200;
const STACKED_MIN_DIALOG_WIDTH = 420;
const DESKTOP_MIN_MEDIA_HEIGHT = 420;
const MOBILE_MIN_MEDIA_HEIGHT = 300;

function getPostMedia(post: InstagramPost): InstagramMediaItem[] {
  if (post.media?.length) return post.media;
  return post.images.map((url) => ({
    type: /\.(?:mp4|mov|m4v)(?:$|[?#])/i.test(url) ? "video" : "image",
    url,
  }));
}

function GridItem({ post, onClick }: { post: InstagramPost; onClick: () => void }) {
  const [isError, setIsError] = useState(false);
  const media = getPostMedia(post);
  const firstMedia = media[0];
  const previewUrl = firstMedia?.type === "video" ? firstMedia.poster : firstMedia?.url;
  const hasVideo = media.some((item) => item.type === "video");

  if (isError) {
    return (
      <div className="aspect-square w-full bg-muted flex flex-col items-center justify-center text-muted-foreground p-2 text-center border border-border rounded-xl font-sans">
        <AlertCircle size={16} aria-hidden="true" className="mb-2" />
        <span className="text-sm">媒体加载失败</span>
        <button type="button" onClick={() => setIsError(false)} className="control-size mt-2 rounded-lg px-3 text-sm underline">重试</button>
      </div>
    );
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      aria-label={`Open Instagram post from ${post.date}`}
      className="group relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-muted cursor-pointer"
    >
      <img
        src={previewUrl}
        alt=""
        loading="lazy"
        onError={() => setIsError(true)}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        {media.length > 1 && (
          <div className="bg-white/90 dark:bg-black/60 p-2 rounded-lg shadow-sm">
            <Layers size={14} className="text-foreground dark:text-white" />
          </div>
        )}
        {hasVideo && (
          <div className="bg-white/90 dark:bg-black/60 p-2 rounded-lg shadow-sm">
            <Play size={14} className="text-foreground dark:text-white fill-current" />
          </div>
        )}
      </div>
    </motion.button>
  );
}

export default function InstagramGrid({ posts, userData }: InstagramGridProps) {
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [[, direction], setPage] = useState([0, 0]);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [mediaFrameSize, setMediaFrameSize] = useState<MediaFrameSize | null>(null);
  const [dialogWidth, setDialogWidth] = useState<number | null>(null);
  const [isDialogSizeReady, setIsDialogSizeReady] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  const openPost = (post: InstagramPost) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setSelectedPost(post);
    setIsDialogOpen(true);
    setCurrentImgIndex(0);
    setPage([0, 0]);
    setIsMediaLoading(false);
    setMediaFrameSize(null);
    setDialogWidth(null);
    setIsDialogSizeReady(false);
  };

  const closePost = () => {
    setIsDialogOpen(false);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setSelectedPost(null);
      closeTimerRef.current = null;
    }, 220);
  };

  const handleMediaDimensions = (naturalWidth: number, naturalHeight: number) => {
    if (naturalWidth <= 0 || naturalHeight <= 0) return;
    const isInitialMeasurement = dialogWidth === null;
    const isDesktop = window.innerWidth >= DESKTOP_DIALOG_BREAKPOINT;
    const maxDialogWidth = isDesktop
      ? Math.min(window.innerWidth * 0.9, MAX_DIALOG_WIDTH)
      : window.innerWidth * 0.95;
    const maxMediaWidth = isDesktop
      ? maxDialogWidth - DETAILS_PANEL_WIDTH
      : maxDialogWidth;
    const maxMediaHeight = window.innerHeight * (isDesktop ? 0.9 : 0.55);
    const scale = Math.min(
      maxMediaWidth / naturalWidth,
      maxMediaHeight / naturalHeight,
      1,
    );
    const fittedWidth = Math.round(naturalWidth * scale);
    const fittedHeight = Math.round(naturalHeight * scale);
    const minimumMediaHeight = Math.min(
      isDesktop ? DESKTOP_MIN_MEDIA_HEIGHT : MOBILE_MIN_MEDIA_HEIGHT,
      maxMediaHeight,
    );
    const nextDialogWidth = isDesktop
      ? Math.round(Math.min(fittedWidth + DETAILS_PANEL_WIDTH, maxDialogWidth))
      : Math.round(Math.min(
        maxDialogWidth,
        Math.max(fittedWidth, Math.min(STACKED_MIN_DIALOG_WIDTH, maxDialogWidth)),
      ));
    const nextSize = {
      width: Math.max(0, (isDesktop ? fittedWidth : nextDialogWidth) - 2),
      height: Math.round(Math.max(fittedHeight, minimumMediaHeight)),
    };
    if (nextSize.width > 0 && nextSize.height > 0) {
      setMediaFrameSize((current) => (
        current?.width === nextSize.width && current.height === nextSize.height
          ? current
          : nextSize
      ));
      setDialogWidth(nextDialogWidth);
      if (isInitialMeasurement) {
        requestAnimationFrame(() => setIsDialogSizeReady(true));
      }
    }
    setIsMediaLoading(false);
  };

  const handleImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    handleMediaDimensions(
      image.naturalWidth || image.offsetWidth,
      image.naturalHeight || image.offsetHeight,
    );
  };

  const handleMediaError = () => {
    setIsMediaLoading(false);
    if (dialogWidth === null) {
      setIsDialogSizeReady(true);
    }
  };

  const paginate = (newDirection: number) => {
    const newIndex = currentImgIndex + newDirection;
    if (selectedPost && newIndex >= 0 && newIndex < getPostMedia(selectedPost).length) {
      setIsMediaLoading(true);
      setPage([newIndex, newDirection]);
      setCurrentImgIndex(newIndex);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      zIndex: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
      zIndex: 0,
    }),
  };

  const selectedMedia = selectedPost ? getPostMedia(selectedPost) : [];
  const currentMedia = selectedMedia[currentImgIndex];

  return (
    <>
      <div className="grid grid-cols-3 gap-2 md:gap-4 py-4 font-sans">
        {posts.map((post) => (
          <GridItem key={post.id} post={post} onClick={() => openPost(post)} />
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) closePost(); }}>
        {selectedPost && (
          <DialogContent
            showCloseButton={false}
            disableZoomAnimation
            overlayClassName="bg-white/60 dark:bg-black/80"
            className="instagram-dialog-content w-[var(--instagram-dialog-width,95vw)] max-w-[95vw] sm:max-w-[95vw] lg:w-[var(--instagram-dialog-width,90vw)] lg:max-w-[1200px] max-h-[90vh] p-0 gap-0 bg-transparent dark:bg-transparent ring-0 rounded-2xl transition-none"
            style={dialogWidth ? { "--instagram-dialog-width": `${dialogWidth}px` } as CSSProperties : undefined}
          >
            <DialogTitle className="sr-only">Instagram post from {selectedPost.date}</DialogTitle>

            <motion.div
              initial={false}
              animate={{ opacity: isDialogSizeReady ? 1 : 0 }}
              transition={{ opacity: { duration: 0.15 } }}
              className="flex max-h-[90vh] w-full max-w-full flex-col overflow-x-hidden overflow-y-auto rounded-2xl border border-border bg-white shadow-sm dark:border-border dark:bg-card lg:h-[var(--instagram-media-height,90vh)] lg:min-h-0 lg:flex-row lg:overflow-hidden"
              style={mediaFrameSize ? { "--instagram-media-height": `${mediaFrameSize.height}px` } as CSSProperties : undefined}
            >
              <div
                className="relative flex min-h-[300px] w-full shrink-0 items-center justify-center overflow-hidden bg-muted transition-none dark:bg-muted lg:min-h-0 lg:min-w-0 lg:flex-1 lg:max-w-[min(calc(90vw-350px),850px)]"
                style={mediaFrameSize ?? undefined}
              >

                <AnimatePresence>
                  {isMediaLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center z-20 bg-muted/50 dark:bg-muted/50"
                    >
                      <Loader2 size={32} className="animate-spin text-muted-foreground" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                  {currentMedia && (
                    <motion.div
                      key={`${currentImgIndex}-${currentMedia.url}`}
                      custom={direction}
                      variants={slideVariants}
                      initial={direction === 0 ? false : "enter"}
                      animate="center"
                      exit="exit"
                      transition={{
                        x: { type: "spring", stiffness: 300, damping: 32 },
                        opacity: { duration: 0.25 }
                      }}
                      className="relative flex h-full w-full items-center justify-center"
                    >
                      {currentMedia.type === "video" ? (
                        <InstagramVideoPlayer
                          src={currentMedia.url}
                          poster={currentMedia.poster}
                          onLoadedMetadata={handleMediaDimensions}
                          onError={handleMediaError}
                        />
                      ) : (
                        <img
                          src={currentMedia.url}
                          alt=""
                          onLoad={handleImageLoad}
                          onError={handleMediaError}
                          className="relative block h-auto w-auto max-h-[55vh] max-w-full object-contain lg:max-h-[90vh]"
                        />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {selectedMedia.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between px-4 z-30 pointer-events-none">
                    <button
                      onClick={(e) => { e.stopPropagation(); paginate(-1); }}
                      aria-label="Previous image"
                      className={`icon-control p-2 rounded-full bg-white/90 dark:bg-black/50 text-foreground shadow-md pointer-events-auto transition hover:scale-110 ${currentImgIndex === 0 ? 'opacity-0 cursor-default' : 'opacity-100'}`}
                    >
                      <ChevronLeft size={16} aria-hidden="true" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); paginate(1); }}
                      aria-label="Next image"
                      className={`icon-control p-2 rounded-full bg-white/90 dark:bg-black/50 text-foreground shadow-md pointer-events-auto transition hover:scale-110 ${currentImgIndex === selectedMedia.length - 1 ? 'opacity-0 cursor-default' : 'opacity-100'}`}
                    >
                      <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  </div>
                )}
                {selectedMedia.length > 1 ? (
                  <div
                    role="status"
                    aria-label={`第 ${currentImgIndex + 1} 张，共 ${selectedMedia.length} 张`}
                    className={`pointer-events-none absolute left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-media-background/60 px-3 py-2 ${currentMedia?.type === "video" ? "bottom-20" : "bottom-4"}`}
                  >
                    {selectedMedia.map((item, index) => (
                      <span
                        key={`${item.url}-${index}`}
                        aria-hidden="true"
                        className={`h-2 rounded-full transition-all duration-300 ${index === currentImgIndex ? "w-4 bg-media-foreground" : "w-2 bg-media-foreground/50"}`}
                      />
                    ))}
                  </div>
                ) : null}
              </div>

              <div
                className="flex w-full shrink-0 flex-col border-t border-border bg-white dark:border-border dark:bg-card lg:h-full lg:min-h-0 lg:w-[350px] lg:border-l lg:border-t-0"
              >
                <div className="flex shrink-0 items-center justify-between border-b border-border p-4 dark:border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-muted border border-border shrink-0">
                      <img src={userData.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-bold text-foreground tracking-tight">
                      {userData.screen_name}
                    </span>
                  </div>
                  <button onClick={closePost} aria-label="Close Instagram post" className="icon-control p-2 hover:bg-muted dark:hover:bg-muted rounded-md transition text-muted-foreground">
                    <X size={16} aria-hidden="true" />
                  </button>
                </div>

                <div
                  className="custom-scrollbar min-h-[150px] flex-1 overflow-y-auto overscroll-contain bg-white p-5 dark:bg-card lg:min-h-0"
                >
                  <div className="flex gap-3 items-start font-sans">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-muted shrink-0 mt-1 border border-border">
                      <img src={userData.avatar} alt="" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-4">
                      <p className="text-sm leading-relaxed text-foreground dark:text-muted-foreground whitespace-pre-wrap">
                        <span className="font-bold mr-2 text-foreground">
                          {userData.screen_name}
                        </span>
                        <RichText
                          text={selectedPost.text}
                          platform="instagram"
                          className="inline"
                        />
                      </p>
                      <time className="text-xs font-mono text-muted-foreground">
                        {selectedPost.date}
                      </time>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </DialogContent>
        )}
      </Dialog>

      <style jsx global>{`
        @keyframes instagram-dialog-exit {
          from {
            opacity: 1;
            scale: 1;
          }

          to {
            opacity: 0;
            scale: 0.96;
          }
        }

        .instagram-dialog-content[data-state="closed"] {
          animation: instagram-dialog-exit 200ms cubic-bezier(0.4, 0, 1, 1) forwards;
        }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); }

        @media (prefers-reduced-motion: reduce) {
          .instagram-dialog-content[data-state="closed"] {
            animation-duration: 1ms;
          }
        }
      `}</style>
    </>
  );
}
