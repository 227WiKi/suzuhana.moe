"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { ArchivePage, ArchiveUser, Tweet } from "@/lib/api";
import TweetCard from "./TweetCard";

const BATCH_SIZE = 20;

interface TweetListProps {
  initialTweets: Tweet[];
  total: number;
  nextOffset: number | null;
  targetTweetId?: string;
  slug: string;
  user: ArchiveUser;
}

export default function TweetList({
  initialTweets,
  total,
  nextOffset: initialNextOffset,
  targetTweetId,
  slug,
  user,
}: TweetListProps) {
  const [tweets, setTweets] = useState(initialTweets);
  const [nextOffset, setNextOffset] = useState(initialNextOffset);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (nextOffset === null || isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/archive/${encodeURIComponent(slug)}/tweets?offset=${nextOffset}&limit=${BATCH_SIZE}`);
      if (!response.ok) throw new Error(`Tweet page returned ${response.status}`);
      const page = await response.json() as ArchivePage<Tweet>;
      setTweets((current) => {
        const unique = new Map(current.map((tweet) => [tweet.id, tweet]));
        page.items.forEach((tweet) => unique.set(tweet.id, tweet));
        return Array.from(unique.values());
      });
      setNextOffset(page.nextOffset);
    } catch (error) {
      console.error("Unable to load the next tweet page", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, nextOffset, slug]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || nextOffset === null) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) void loadMore(); },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, nextOffset]);

  useEffect(() => {
    if (!targetTweetId) return;
    const frame = requestAnimationFrame(() => {
      const element = document.getElementById(`tweet-${targetTweetId}`);
      if (!element) return;
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("highlight-pulse");
      window.setTimeout(() => element.classList.remove("highlight-pulse"), 2000);
    });
    return () => cancelAnimationFrame(frame);
  }, [targetTweetId]);

  return (
    <div className="pb-10 flex flex-col gap-4">
      {tweets.map((tweet) => (
        <div
          key={tweet.id}
          className="rounded-xl transition-all duration-300"
          style={{ contentVisibility: "auto", containIntrinsicSize: "1px 300px" }}
        >
          <TweetCard tweet={tweet} user={user} />
        </div>
      ))}

      {nextOffset !== null && (
        <div ref={sentinelRef} className="py-8 flex justify-center text-blue-500">
          <Loader2 className={`w-8 h-8 ${isLoading ? "animate-spin" : "opacity-40"}`} />
        </div>
      )}

      {tweets.length > 0 && tweets.length >= total && (
        <div className="py-8 text-center text-gray-400 text-sm font-medium">
          You&apos;ve reached the end of the archive.
        </div>
      )}
    </div>
  );
}
