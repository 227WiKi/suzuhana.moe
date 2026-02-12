"use client";

import { useState, useEffect } from "react";
import { Layers, X, ChevronLeft, ChevronRight, Loader2, Play, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InstagramPost {
  id: string;
  date: string;
  text: string;
  images: string[];
  type?: 'photo' | 'video';
}

interface UserData {
  screen_name: string;
  avatar: string;
  name: string;
}

interface InstagramGridProps {
  posts: InstagramPost[];
  userData: UserData;
}

function GridItem({ post, onClick }: { post: InstagramPost; onClick: () => void }) {
  const [isError, setIsError] = useState(false);
  const isVideo = post.type === 'video' || post.images[0].endsWith('.mp4');

  if (isError) {
    return (
      <div className="aspect-square w-full bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center text-gray-400 p-2 text-center border border-gray-200 dark:border-gray-800 rounded-xl font-sans">
        <AlertCircle size={20} className="mb-1 opacity-50" />
        <span className="text-[10px]">Media Error</span>
      </div>
    );
  }

  return (
    <motion.div 
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="group relative aspect-square w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-zinc-900 cursor-pointer"
    >
      <img
        src={post.images[0]}
        alt=""
        loading="lazy"
        onError={() => setIsError(true)}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      <div className="absolute top-2 right-2 flex gap-1.5 z-10">
        {post.images.length > 1 && (
          <div className="bg-white/90 dark:bg-black/60 backdrop-blur-sm p-1.5 rounded-lg shadow-sm">
            <Layers size={14} className="text-zinc-900 dark:text-white" />
          </div>
        )}
        {isVideo && (
          <div className="bg-white/90 dark:bg-black/60 backdrop-blur-sm p-1.5 rounded-lg shadow-sm">
            <Play size={14} className="text-zinc-900 dark:text-white fill-current" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function InstagramGrid({ posts, userData }: InstagramGridProps) {
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [[page, direction], setPage] = useState([0, 0]);
  const [isImgLoading, setIsImgLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = selectedPost ? "hidden" : "auto";
  }, [selectedPost]);

  const openPost = (post: InstagramPost) => {
    setSelectedPost(post);
    setCurrentImgIndex(0);
    setPage([0, 0]);
    setIsImgLoading(false); 
  };

  const paginate = (newDirection: number) => {
    const newIndex = currentImgIndex + newDirection;
    if (selectedPost && newIndex >= 0 && newIndex < selectedPost.images.length) {
      setIsImgLoading(true);
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

  return (
    <>
      <div className="grid grid-cols-3 gap-2 md:gap-4 p-4 font-sans">
        {posts.map((post) => (
          <GridItem key={post.id} post={post} onClick={() => openPost(post)} />
        ))}
      </div>

      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 dark:bg-black/80 backdrop-blur-sm p-4 md:p-10"
            onClick={() => setSelectedPost(null)}
          >
            <div className="hidden" aria-hidden="true">
              {selectedPost.images.map((img, i) => <img key={i} src={img} />)}
            </div>

            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="flex flex-col md:flex-row w-fit max-w-[95vw] md:max-w-[90vw] max-h-[90vh] bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800"
            >
              <div className="relative bg-gray-50 dark:bg-zinc-900 flex items-center justify-center overflow-hidden min-h-[300px] md:min-h-0">
                
                <AnimatePresence>
                  {isImgLoading && (
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
                  <motion.img
                    key={currentImgIndex}
                    src={selectedPost.images[currentImgIndex]}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 32 },
                      opacity: { duration: 0.25 }
                    }}
                    onLoad={() => setIsImgLoading(false)}
                    className="max-h-[70vh] md:max-h-[90vh] w-auto object-contain block relative"
                  />
                </AnimatePresence>

                {selectedPost.images.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between px-4 z-30 pointer-events-none">
                    <button
                      onClick={(e) => { e.stopPropagation(); paginate(-1); }}
                      className={`p-2 rounded-full bg-white/90 dark:bg-black/50 text-black dark:text-white backdrop-blur-sm shadow-md pointer-events-auto transition hover:scale-110 ${currentImgIndex === 0 ? 'opacity-0 cursor-default' : 'opacity-100'}`}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); paginate(1); }}
                      className={`p-2 rounded-full bg-white/90 dark:bg-black/50 text-black dark:text-white backdrop-blur-sm shadow-md pointer-events-auto transition hover:scale-110 ${currentImgIndex === selectedPost.images.length - 1 ? 'opacity-0 cursor-default' : 'opacity-100'}`}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>

              <div className="w-full md:w-[350px] flex flex-col bg-white dark:bg-zinc-950 shrink-0 border-l border-gray-100 dark:border-gray-800">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-gray-200 dark:border-gray-700 shrink-0">
                      <img src={userData.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                      {userData.screen_name}
                    </span>
                  </div>
                  <button onClick={() => setSelectedPost(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition text-gray-400">
                    <X size={18} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar min-h-[150px] md:min-h-0 bg-white dark:bg-zinc-950">
                  <div className="flex gap-3 items-start font-sans">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 shrink-0 mt-0.5 border border-gray-100 dark:border-zinc-800">
                      <img src={userData.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        <span className="font-bold mr-2 text-gray-900 dark:text-white">
                          {userData.screen_name}
                        </span>
                        {selectedPost.text}
                      </p>
                      <time className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                        {selectedPost.date}
                      </time>
                    </div>
                  </div>
                </div>

                {selectedPost.images.length > 1 && (
                  <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-center gap-1.5 bg-gray-50/30 dark:bg-black/20">
                    {selectedPost.images.map((_, i) => (
                      <div 
                        key={i} 
                        className={`transition-all duration-300 rounded-full ${i === currentImgIndex ? 'w-4 h-1 bg-zinc-800 dark:bg-zinc-200' : 'w-1 h-1 bg-gray-300 dark:bg-gray-700'}`} 
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; }
      `}</style>
    </>
  );
}