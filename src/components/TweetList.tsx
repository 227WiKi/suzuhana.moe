"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Tweet } from "@/lib/api";
import TweetCard from "./TweetCard";
import { Loader2 } from "lucide-react";

const BATCH_SIZE = 20;

interface TweetListProps {
  initialTweets: Tweet[];
  user: any;
}

export default function TweetList({ initialTweets = [], user }: TweetListProps) {
  const processedTweets = useMemo(() => {
    if (!initialTweets || initialTweets.length === 0) return [];

    const uniqueMap = new Map();
    initialTweets.forEach((tweet) => {
      if (!uniqueMap.has(tweet.id)) {
        uniqueMap.set(tweet.id, tweet);
      }
    });
    const uniqueList = Array.from(uniqueMap.values());

    return uniqueList.sort((a, b) => {
      const dateA = a.date || "";
      const dateB = b.date || "";
      if (dateA < dateB) return 1; 
      if (dateA > dateB) return -1;
      return 0;
    });
  }, [initialTweets]);

  const [page, setPage] = useState(1);
  const [displayTweets, setDisplayTweets] = useState<Tweet[]>([]);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const [scrollTargetId, setScrollTargetId] = useState<string | null>(null);

  useEffect(() => {
    setDisplayTweets(processedTweets.slice(0, page * BATCH_SIZE));
  }, [processedTweets, page]);

  useEffect(() => {
    const targetDate = searchParams.get("date");
    if (!targetDate || processedTweets.length === 0) return;

    const targetStr = targetDate.substring(0, 10);

    const targetIndex = processedTweets.findIndex(t => (t.date || "").substring(0, 10) <= targetStr);

    if (targetIndex !== -1) {
      const foundTweet = processedTweets[targetIndex];
      
      const requiredPage = Math.ceil((targetIndex + 1) / BATCH_SIZE) + 1;

      if (requiredPage > page) {
        setPage(requiredPage);
      }

      setScrollTargetId(foundTweet.id);
    }
  }, [searchParams, processedTweets]); 

  useEffect(() => {
    if (!scrollTargetId) return;

    const attemptScroll = () => {
      const element = document.getElementById(`tweet-${scrollTargetId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("highlight-pulse");
        setTimeout(() => element.classList.remove("highlight-pulse"), 2000);
        return true; 
      }
      return false;
    };

    // 立即试一次
    if (attemptScroll()) {
      setScrollTargetId(null);
      return;
    }

    let attempts = 0;
    const intervalId = setInterval(() => {
      attempts++;
      if (attemptScroll() || attempts > 30) {
        clearInterval(intervalId);
        setScrollTargetId(null);
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [scrollTargetId, displayTweets]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && displayTweets.length < processedTweets.length && !scrollTargetId) {
        setPage((prev) => prev + 1);
      }
    }, { rootMargin: "200px" });
    
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [displayTweets.length, processedTweets.length, scrollTargetId]);

  return (
    <div className="pb-10 flex flex-col gap-4">
      {displayTweets.map((tweet) => (
        <div 
          key={tweet.id} 
          id={`tweet-${tweet.id}`} 
          className="rounded-xl transition-all duration-300"
          style={{ 
            contentVisibility: 'auto', 
            containIntrinsicSize: '1px 300px' 
          }}
        >
          <TweetCard tweet={tweet} user={user} />
        </div>
      ))}

      {/* Loading Spinner */}
      {displayTweets.length < processedTweets.length && (
        <div ref={sentinelRef} className="py-8 flex justify-center text-blue-500">
          <Loader2 className="animate-spin w-8 h-8" />
        </div>
      )}
      
      {/* End of Archive */}
      {displayTweets.length > 0 && displayTweets.length === processedTweets.length && (
        <div className="py-8 text-center text-gray-400 text-sm font-medium">
          You've reached the end of the archive.
        </div>
      )}
    </div>
  );
}