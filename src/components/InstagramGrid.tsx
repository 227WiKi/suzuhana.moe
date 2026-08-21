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
      <div className="aspect-square w-full bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center text-gray-400 p-2 text-center border border-gray-200 dark:border-gray-800 rounded-xl font-sans">
        <AlertCircle size={20} className="mb-1 opacity-50" />
        <span className="text-[10px]">Media Error</span>
      </div>
    );
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      aria-label={`Open Instagram post from ${post.date}`}
      className="group relative aspect-square w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-zinc-900 cursor-pointer"
    >
      <img
        src={previewUrl}
        alt=""
        loading="lazy"
        onError={() => setIsError(true)}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      <div className="absolute top-2 right-2 flex gap-1.5 z-10">
        {media.length > 1 && (
          <div className="bg-white/90 dark:bg-black/60 backdrop-blur-sm p-1.5 rounded-lg shadow-sm">
            <Layers size={14} className="text-zinc-900 dark:text-white" />
          </div>
        )}
        {hasVideo && (
          <div className="bg-white/90 dark:bg-black/60 backdrop-blur-sm p-1.5 rounded-lg shadow-sm">
            <Play size={14} className="text-zinc-900 dark:text-white fill-current" />
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
      width: isDesktop ? fittedWidth : nextDialogWidth,
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
      <div className="grid grid-cols-3 gap-2 md:gap-4 p-4 font-sans">
        {posts.map((post) => (
          <GridItem key={post.id} post={post} onClick={() => openPost(post)} />
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) closePost(); }}>
        {selectedPost && (
          <DialogContent
            showCloseButton={false}
            disableZoomAnimation
            overlayClassName="bg-white/60 dark:bg-black/80 backdrop-blur-sm"
            className="instagram-dialog-content w-[var(--instagram-dialog-width,95vw)] max-w-[95vw] sm:max-w-[95vw] lg:w-[var(--instagram-dialog-width,90vw)] lg:max-w-[1200px] max-h-[90vh] p-0 gap-0 bg-transparent dark:bg-transparent ring-0 rounded-2xl transition-none"
            style={dialogWidth ? { "--instagram-dialog-width": `${dialogWidth}px` } as CSSProperties : undefined}
          >
            <DialogTitle className="sr-only">Instagram post from {selectedPost.date}</DialogTitle>

            <motion.div
              initial={false}
              animate={{ opacity: isDialogSizeReady ? 1 : 0 }}
              transition={{ opacity: { duration: 0.15 } }}
              className="flex max-h-[90vh] w-full max-w-full flex-col overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-zinc-950 lg:h-[var(--instagram-media-height,90vh)] lg:min-h-0 lg:flex-row lg:overflow-hidden"
              style={mediaFrameSize ? { "--instagram-media-height": `${mediaFrameSize.height}px` } as CSSProperties : undefined}
            >
              <div
                className="relative flex min-h-[300px] w-full shrink-0 items-center justify-center overflow-hidden bg-gray-50 transition-none dark:bg-zinc-900 lg:min-h-0 lg:min-w-0 lg:flex-1 lg:max-w-[min(calc(90vw-350px),850px)]"
                style={mediaFrameSize ?? undefined}
              >
                
                <AnimatePresence>
                  {isMediaLoading && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center z-20 bg-gray-50/50 dark:bg-zinc-900/50 backdrop-blur-[2px]"
                    >
                      <Loader2 size={32} className="animate-spin text-gray-400" />
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
                      className={`p-2 rounded-full bg-white/90 dark:bg-black/50 text-black dark:text-white backdrop-blur-sm shadow-md pointer-events-auto transition hover:scale-110 ${currentImgIndex === 0 ? 'opacity-0 cursor-default' : 'opacity-100'}`}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); paginate(1); }}
                      aria-label="Next image"
                      className={`p-2 rounded-full bg-white/90 dark:bg-black/50 text-black dark:text-white backdrop-blur-sm shadow-md pointer-events-auto transition hover:scale-110 ${currentImgIndex === selectedMedia.length - 1 ? 'opacity-0 cursor-default' : 'opacity-100'}`}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>

              <div
                className="flex w-full shrink-0 flex-col border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-zinc-950 lg:h-full lg:min-h-0 lg:w-[350px] lg:border-l lg:border-t-0"
              >
                <div className="flex shrink-0 items-center justify-between border-b border-gray-100 p-4 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-gray-200 dark:border-gray-700 shrink-0">
                      <img src={userData.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                      {userData.screen_name}
                    </span>
                  </div>
                  <button onClick={closePost} aria-label="Close Instagram post" className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition text-gray-400">
                    <X size={18} />
                  </button>
                </div>

                <div
                  className="custom-scrollbar min-h-[150px] flex-1 overflow-y-auto overscroll-contain bg-white p-5 dark:bg-zinc-950 lg:min-h-0"
                >
                  <div className="flex gap-3 items-start font-sans">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 shrink-0 mt-0.5 border border-gray-100 dark:border-zinc-800">
                      <img src={userData.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        <span className="font-bold mr-2 text-gray-900 dark:text-white">
                          {userData.screen_name}
                        </span>
                        <RichText 
                          text={selectedPost.text} 
                          platform="instagram"
                          className="inline"
                        />
                      </p>
                      <time className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                        {selectedPost.date}
                      </time>
                    </div>
                  </div>
                </div>

                {selectedMedia.length > 1 && (
                  <div className="flex shrink-0 justify-center gap-1.5 border-t border-gray-100 bg-gray-50/30 p-4 dark:border-gray-800 dark:bg-black/20">
                    {selectedMedia.map((item, i) => (
                      <div 
                        key={item.url}
                        className={`transition-all duration-300 rounded-full ${i === currentImgIndex ? 'w-4 h-1 bg-zinc-800 dark:bg-zinc-200' : 'w-1 h-1 bg-gray-300 dark:bg-gray-700'}`} 
                      />
                    ))}
                  </div>
                )}
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
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; }

        @media (prefers-reduced-motion: reduce) {
          .instagram-dialog-content[data-state="closed"] {
            animation-duration: 1ms;
          }
        }
      `}</style>
    </>
  );
}
