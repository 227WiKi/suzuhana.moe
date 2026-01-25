"use client";

import { Media } from '@/lib/api';
import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Play, AlertCircle, Heart, Loader2, Info, X } from 'lucide-react';
import "glightbox/dist/css/glightbox.min.css";
import TweetCard from './TweetCard';
import { motion, AnimatePresence } from "framer-motion"; 

function MediaItem({ media, likes, onClick }: { media: Media, likes: number, onClick: () => void }) {
  const [isError, setIsError] = useState(false);
  if (isError) return <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 p-2 rounded-xl mb-3"><AlertCircle size={20} className="mb-2 opacity-50" /></div>;
  return (
    <div onClick={onClick} className="relative group bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden cursor-pointer border border-transparent dark:border-gray-800 mb-3 shadow-sm hover:shadow-md transition-shadow">
      {media.type === 'video' ? (<div className="w-full relative"><video src={media.url} className="w-full h-auto object-cover pointer-events-none" preload="metadata" muted onError={() => setIsError(true)} /><div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition"><div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm shadow-lg"><Play fill="white" className="text-white ml-1 w-4 h-4" /></div></div></div>) : (<div className="w-full relative"><img src={media.url} loading="lazy" onError={() => setIsError(true)} className="w-full h-auto object-cover hover:opacity-90 transition duration-500" alt="media" /></div>)}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end justify-start p-3"><div className="flex items-center gap-1.5 text-white font-bold text-sm drop-shadow-md"><Heart fill="white" size={16} /><span>{likes}</span></div></div>
    </div>
  );
}


const BATCH_SIZE = 15;

export default function MediaGrid({ tweets = [], mediaMap, user }: { tweets?: any[], mediaMap: any, user: any }) {
  const lightboxRef = useRef<any>(null);
  const [displayCount, setDisplayCount] = useState(BATCH_SIZE);
  const [numColumns, setNumColumns] = useState(3);
  const [mounted, setMounted] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [activeSlideTweet, setActiveSlideTweet] = useState<any>(null);
  const [isCardOpen, setIsCardOpen] = useState(false);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => setNumColumns(window.innerWidth < 768 ? 2 : 3);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sortedItems = useMemo(() => {
    if (!tweets || !Array.isArray(tweets) || !mediaMap) return [];
    return tweets
      .filter(t => t && t.media && t.media.length > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(t => {
        const media = mediaMap[t.media[0]];
        return media ? { media, tweet: t } : null;
      })
      .filter((item): item is { media: Media, tweet: any } => item !== null);
  }, [tweets, mediaMap]);

  const visibleItems = sortedItems.slice(0, displayCount);
  const columns = useMemo(() => {
    const cols = Array.from({ length: numColumns }, () => [] as typeof visibleItems);
    visibleItems.forEach((item, index) => { cols[index % numColumns].push(item); });
    return cols;
  }, [visibleItems, numColumns]);

  useEffect(() => {
    if (!mounted) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && displayCount < sortedItems.length) {
        setDisplayCount(prev => prev + BATCH_SIZE);
      }
    }, { rootMargin: "400px" });
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [displayCount, sortedItems.length, mounted]);

  useEffect(() => {
    if (!mounted) return;
    let instance: any = null;
    const initLightbox = async () => {
      const module = await import("glightbox");
      const GLightbox = module.default;
      const allLightboxElements = sortedItems.map(item => {
        if (item.media.type === 'video') { return { href: item.media.url, type: 'video', source: [{ src: item.media.url, type: 'video/mp4' }], width: '80vw' }; }
        return { href: item.media.url, type: 'image' };
      });
      instance = GLightbox({ elements: allLightboxElements, touchNavigation: true, loop: false, zoomable: true, draggable: true, autoplayVideos: true, plyr: { config: { ratio: null, muted: false, hideControls: true } } });
      
      instance.on('slide_changed', (data: any) => {
        const index = data.current.index;
        const currentItem = sortedItems[index];
        if (currentItem) setActiveSlideTweet(currentItem.tweet);
      });

      instance.on('open', () => {
        const idx = instance.index; 
        if (typeof idx === 'number' && sortedItems[idx]) {
           setActiveSlideTweet(sortedItems[idx].tweet);
        }
        setIsCardOpen(false);
        setIsLightboxOpen(true); 
      });

      instance.on('close', () => {

        setIsLightboxOpen(false); 
        setIsCardOpen(false);
      });

      lightboxRef.current = instance;
    };
    if (sortedItems.length > 0) initLightbox();
    return () => { if (instance) instance.destroy(); };
  }, [sortedItems, mounted]);

  const handleOpenLightbox = (clickedItem: any) => {
    const originalIndex = sortedItems.findIndex(t => t.tweet.id === clickedItem.tweet.id);
    if (lightboxRef.current && originalIndex !== -1) {
      lightboxRef.current.openAt(originalIndex);
    }
  };

  if (!mounted) return null;
  if (sortedItems.length === 0) return <div className="p-10 text-center text-gray-500">No media found.</div>;

  return (
    <>
      <div className="flex gap-3 px-1 mt-2 items-start">
        {columns.map((colItems, colIndex) => (
          <div key={colIndex} className="flex-1 flex flex-col gap-0">
            {colItems.map((item) => (
              <MediaItem 
                key={item.tweet.id} 
                media={item.media} 
                likes={item.tweet.stats.likes}
                onClick={() => handleOpenLightbox(item)}
              />
            ))}
          </div>
        ))}
      </div>
      {displayCount < sortedItems.length && (<div ref={sentinelRef} className="py-10 flex justify-center w-full"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div>)}

      {activeSlideTweet && createPortal(
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999999 }}>
          
          <AnimatePresence>
            {isLightboxOpen && !isCardOpen && (
              <motion.button
                key="view-btn"
                onClick={() => setIsCardOpen(true)}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: { 
                    delay: 0.35, 
                    type: "spring",
                    stiffness: 200,
                    damping: 20
                  } 
                }}
                

                exit={{ 
                  opacity: 0, 
                  scale: 0.9, 
                  y: -10,
                  transition: { duration: 0.2 } 
                }}
                
                whileHover={{ 
                  scale: 1.05, 
                  backgroundColor: "rgba(0, 0, 0, 0.7)", 
                  transition: { duration: 0.2 } 
                }}
                whileTap={{ scale: 0.95 }}
                className="absolute top-4 left-4 sm:top-6 sm:left-6 pointer-events-auto bg-black/50 text-white backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/20 z-[100] cursor-pointer shadow-lg"
              >
                <Info size={18} />
                <span className="text-sm font-bold hidden sm:inline">View Tweet</span>
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isCardOpen && (
              <motion.div
                key="modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center p-4 pointer-events-auto bg-black/60 backdrop-blur-sm z-[100]"
              >
                 <div className="absolute inset-0 cursor-pointer" onClick={() => setIsCardOpen(false)} />
                 
                 <motion.div
                    key="modal-content"
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 10 }} 
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full max-w-lg z-10"
                 >
                    <motion.button 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ scale: 1.1, color: "#ffffff" }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsCardOpen(false)}
                      className="absolute -top-12 right-0 p-2 text-white/80 transition cursor-pointer"
                    >
                      <X size={32} />
                    </motion.button>
                    
                    <div className="shadow-2xl rounded-2xl overflow-hidden">
                      <AnimatePresence mode='popLayout'>
                        <motion.div
                            key={activeSlideTweet.id}
                            initial={{ opacity: 0, x: 20 }} 
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                            <TweetCard 
                                tweet={activeSlideTweet} 
                                mediaMap={mediaMap} 
                                user={user} 
                                hideMedia={true} 
                            />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                 </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </>
  );
}