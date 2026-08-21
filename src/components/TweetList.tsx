"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ArchivePage, ArchiveUser, Tweet } from "@/lib/api";
import { ARCHIVE_SCROLL_TO_TOP_EVENT } from "@/lib/ui-events";
import TweetCard from "./TweetCard";

const BATCH_SIZE = 20;

interface TweetListProps {
  initialTweets: Tweet[];
  initialOffset: number;
  initialPreviousOffset: number | null;
  nextOffset: number | null;
  targetTweetId?: string;
  slug: string;
  user: ArchiveUser;
}

export default function TweetList({
  initialTweets,
  initialOffset,
  initialPreviousOffset,
  nextOffset: initialNextOffset,
  targetTweetId,
  slug,
  user,
}: TweetListProps) {
  const [tweets, setTweets] = useState(initialTweets);
  const [currentOffset, setCurrentOffset] = useState(initialOffset);
  const [previousOffset, setPreviousOffset] = useState(initialPreviousOffset);
  const [nextOffset, setNextOffset] = useState(initialNextOffset);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPrevious, setIsLoadingPrevious] = useState(false);
  const [previousPagingUnlocked, setPreviousPagingUnlocked] = useState(false);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pendingPrependAnchorRef = useRef<{ id: string; top: number } | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const listAnimation = useAnimationControls();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useLayoutEffect(() => {
    if (!targetTweetId || prefersReducedMotion) {
      listAnimation.set({ opacity: 1, y: 0 });
      return;
    }
    listAnimation.set({ opacity: 0, y: 18 });
    void listAnimation.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
    });
  }, [listAnimation, prefersReducedMotion, targetTweetId]);

  useLayoutEffect(() => {
    const pendingAnchor = pendingPrependAnchorRef.current;
    if (!pendingAnchor) return;
    const anchor = document.getElementById(`tweet-${pendingAnchor.id}`);
    if (anchor) {
      const delta = anchor.getBoundingClientRect().top - pendingAnchor.top;
      if (Math.abs(delta) > 1) {
        window.scrollBy({ top: delta, behavior: "auto" });
      }
    }
    pendingPrependAnchorRef.current = null;
  }, [tweets]);

  const loadPrevious = useCallback(async () => {
    if (previousOffset === null || isLoadingPrevious) return;
    const requestOffset = previousOffset;
    const requestLimit = currentOffset - requestOffset;
    if (requestLimit <= 0) return;

    setIsLoadingPrevious(true);
    try {
      const response = await fetch(
        `/api/archive/${encodeURIComponent(slug)}/tweets?offset=${requestOffset}&limit=${requestLimit}`,
      );
      if (!response.ok) throw new Error(`Previous tweet page returned ${response.status}`);
      const page = await response.json() as ArchivePage<Tweet>;
      const currentFirstTweet = tweets[0];
      const anchor = currentFirstTweet
        ? document.getElementById(`tweet-${currentFirstTweet.id}`)
        : null;
      if (anchor && currentFirstTweet) {
        pendingPrependAnchorRef.current = {
          id: currentFirstTweet.id,
          top: anchor.getBoundingClientRect().top,
        };
      }
      setTweets((current) => {
        const existingIds = new Set(current.map((tweet) => tweet.id));
        return [
          ...page.items.filter((tweet) => !existingIds.has(tweet.id)),
          ...current,
        ];
      });
      setCurrentOffset(page.startOffset ?? requestOffset);
      setPreviousOffset(page.previousOffset ?? null);
    } catch (error) {
      pendingPrependAnchorRef.current = null;
      console.error("Unable to load the previous tweet page", error);
    } finally {
      setIsLoadingPrevious(false);
    }
  }, [currentOffset, isLoadingPrevious, previousOffset, slug, tweets]);

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
    if (!targetTweetId || previousOffset === null || previousPagingUnlocked) return;
    let previousScrollY = window.scrollY;
    let isReady = false;
    const readyTimer = window.setTimeout(() => {
      previousScrollY = window.scrollY;
      isReady = true;
    }, 1500);
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (isReady && currentScrollY < previousScrollY - 1) {
        setPreviousPagingUnlocked(true);
        void loadPrevious();
      }
      previousScrollY = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.clearTimeout(readyTimer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [loadPrevious, previousOffset, previousPagingUnlocked, targetTweetId]);

  useEffect(() => {
    const sentinel = topSentinelRef.current;
    if (!sentinel || !previousPagingUnlocked || previousOffset === null) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void loadPrevious();
      },
      { rootMargin: "800px 0px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadPrevious, previousOffset, previousPagingUnlocked]);

  useEffect(() => {
    const handleScrollToTop = (event: Event) => {
      event.preventDefault();
      if (searchParams.has("date")) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("date");
        const query = params.toString();
        router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener(ARCHIVE_SCROLL_TO_TOP_EVENT, handleScrollToTop);
    return () => window.removeEventListener(ARCHIVE_SCROLL_TO_TOP_EVENT, handleScrollToTop);
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (!targetTweetId) return;
    let cancelledByUser = false;
    const correctionTimers: number[] = [];
    const cancelEvents = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
    const cancelCorrections = () => {
      cancelledByUser = true;
    };
    cancelEvents.forEach((eventName) => {
      window.addEventListener(eventName, cancelCorrections, { passive: true });
    });

    const alignTarget = (behavior: ScrollBehavior) => {
      if (cancelledByUser) return;
      const element = document.getElementById(`tweet-${targetTweetId}`);
      if (!element) return;
      const stickyHeaderBottom = Array.from(
        document.querySelectorAll<HTMLElement>("[data-archive-sticky-header]"),
      ).reduce((bottom, header) => (
        getComputedStyle(header).display === "none"
          ? bottom
          : Math.max(bottom, header.getBoundingClientRect().bottom)
      ), 0);
      const offset = Math.max(stickyHeaderBottom + 12, 16);
      const delta = element.getBoundingClientRect().top - offset;
      if (Math.abs(delta) > 2) {
        window.scrollBy({ top: delta, behavior });
      }
    };

    const frame = requestAnimationFrame(() => {
      const element = document.getElementById(`tweet-${targetTweetId}`);
      if (!element) return;
      alignTarget("smooth");
      element.classList.add("highlight-pulse");
      correctionTimers.push(
        window.setTimeout(() => alignTarget("auto"), 700),
        window.setTimeout(() => alignTarget("auto"), 1400),
        window.setTimeout(() => element.classList.remove("highlight-pulse"), 2000),
      );
    });
    return () => {
      cancelAnimationFrame(frame);
      correctionTimers.forEach(window.clearTimeout);
      cancelEvents.forEach((eventName) => {
        window.removeEventListener(eventName, cancelCorrections);
      });
    };
  }, [targetTweetId]);

  return (
    <motion.div
      initial={false}
      animate={listAnimation}
      className="relative pb-10 flex flex-col gap-4"
    >
      <div ref={topSentinelRef} className="h-px" aria-hidden="true" />
      {isLoadingPrevious && (
        <div
          className="absolute inset-x-0 top-3 z-10 flex justify-center text-blue-500 pointer-events-none"
          aria-label="Loading newer tweets"
        >
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}

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

      {tweets.length > 0 && nextOffset === null && (
        <div className="py-8 text-center text-gray-400 text-sm font-medium">
          You&apos;ve reached the end of the archive.
        </div>
      )}
    </motion.div>
  );
}
