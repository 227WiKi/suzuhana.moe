"use client";

import { useState, useEffect, useRef } from "react";
import { Tweet } from "@/lib/api";
import TweetCard from "./TweetCard";
import { Loader2 } from "lucide-react";

const BATCH_SIZE = 20;

interface TweetListProps {
  initialTweets: Tweet[];
  user: any;
}

export default function TweetList({ initialTweets, user }: TweetListProps) {
  const [displayTweets, setDisplayTweets] = useState<Tweet[]>([]);
  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDisplayTweets(initialTweets.slice(0, BATCH_SIZE));
  }, [initialTweets]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && displayTweets.length < initialTweets.length) {
        setPage((prev) => prev + 1);
      }
    }, { rootMargin: "200px" });
    
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [displayTweets.length, initialTweets.length]);

  useEffect(() => {
    if (page > 1) {
      const nextBatch = initialTweets.slice(0, page * BATCH_SIZE);
      setDisplayTweets(nextBatch);
    }
  }, [page, initialTweets]);

  return (
    <div className="pb-10">
      {displayTweets.map((tweet) => (
        <TweetCard 
          key={tweet.id} 
          tweet={tweet} 
          user={user} 
        />
      ))}

      {displayTweets.length < initialTweets.length && (
        <div ref={sentinelRef} className="py-8 flex justify-center text-blue-500">
          <Loader2 className="animate-spin w-8 h-8" />
        </div>
      )}
      
      {displayTweets.length > 0 && displayTweets.length === initialTweets.length && (
        <div className="py-8 text-center text-gray-400 text-sm font-medium">
          You've reached the end of the archive.
        </div>
      )}
    </div>
  );
}