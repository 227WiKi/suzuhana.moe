"use client";

import { useState, useSyncExternalStore, type CSSProperties } from "react";
import Link from "next/link";
import type { ArchiveUser, InstagramPost, Tweet } from "@/lib/api";
import TweetCard from "./TweetCard";
import InstagramPostCard from "./InstagramPostCard";

export interface FeedTweet {
  key: string;
  slug: string;
  href: string;
  tweet: Tweet;
}

export interface FeedInstagramPost {
  key: string;
  slug: string;
  href: string;
  post: InstagramPost;
}

export type FeedUsers = Record<string, { twitter?: ArchiveUser; instagram?: ArchiveUser }>;

type FeedItem =
  | ({ kind: "x"; user: ArchiveUser } & FeedTweet)
  | ({ kind: "instagram"; user: ArchiveUser } & FeedInstagramPost);

interface PlacedItem {
  item: FeedItem;
  rotate: number;
}

const subscribeToHydration = () => () => undefined;
// Fixed-height frame: one card pinned top-left, the other bottom-right. On short
// screens the cards overlap more instead of pushing the hero past the fold.
const FRAME = "h-[min(36rem,calc(100svh-12rem))] min-h-[26rem]";

function randomOf<T>(items: readonly T[]) {
  return items.length ? items[Math.floor(Math.random() * items.length)] : undefined;
}

function between(min: number, max: number) {
  return min + Math.random() * (max - min);
}

type Point = [number, number];

// Corners of a card as drawn: its layout box rotated about the centre by --r,
// the same transform CSS `rotate` applies.
function cardCorners(card: HTMLElement): Point[] {
  const { offsetLeft: x, offsetTop: y, offsetWidth: w, offsetHeight: h } = card;
  const angle = (parseFloat(card.style.getPropertyValue("--r")) || 0) * Math.PI / 180;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return ([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]] as Point[])
    .map(([dx, dy]) => [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos]);
}

// Separating axis test for two convex quads: they overlap unless some edge
// normal separates their projections.
function cardsOverlap(a: HTMLElement, b: HTMLElement) {
  const pa = cardCorners(a);
  const pb = cardCorners(b);
  for (const poly of [pa, pb]) {
    for (let i = 0; i < poly.length; i++) {
      const [x1, y1] = poly[i];
      const [x2, y2] = poly[(i + 1) % poly.length];
      const axis: Point = [y1 - y2, x2 - x1];
      const project = (points: Point[]) => points.map(([px, py]) => px * axis[0] + py * axis[1]);
      const ra = project(pa);
      const rb = project(pb);
      if (Math.max(...ra) <= Math.min(...rb) || Math.max(...rb) <= Math.min(...ra)) return false;
    }
  }
  return true;
}

// One Instagram post and one tweet from a different member when possible,
// otherwise two tweets from different members.
function pickItems(tweets: FeedTweet[], posts: FeedInstagramPost[], users: FeedUsers): PlacedItem[] {
  const items: FeedItem[] = [];
  const post = randomOf(posts.filter((entry) => users[entry.slug]?.instagram));
  if (post) items.push({ kind: "instagram", user: users[post.slug].instagram!, ...post });

  const usable = tweets.filter((entry) => users[entry.slug]?.twitter);
  while (items.length < 2) {
    const taken = new Set(items.map((item) => item.slug));
    const tweet = randomOf(usable.filter((entry) => !taken.has(entry.slug)))
      ?? randomOf(usable.filter((entry) => !items.some((item) => item.key === entry.key)));
    if (!tweet) break;
    items.push({ kind: "x", user: users[tweet.slug].twitter!, ...tweet });
  }

  if (Math.random() < 0.5) items.reverse();
  return items.map((item, index) => ({
    item,
    rotate: index === 0 ? between(-4, -1.5) : between(1.5, 4),
  }));
}

export default function HomePostFeed({ tweets, posts, users }: {
  tweets: FeedTweet[];
  posts: FeedInstagramPost[];
  users: FeedUsers;
}) {
  // A new pick on every page load; shown only after hydration so the server
  // HTML and the first client render match.
  const mounted = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const [placed] = useState(() => pickItems(tweets, posts, users));
  // The short tweet card starts on top so the taller photo card never hides it.
  const [topKey, setTopKey] = useState(() => (placed.find(({ item }) => item.kind === "x") ?? placed.at(-1))?.item.key);
  const [shuffling, setShuffling] = useState<string | null>(null);

  if (!mounted) return <div className={FRAME} />;
  if (placed.length === 0) return null;

  // Bring the card underneath to the top. The order then stays until the
  // other card is shuffled back. Cards that don't touch (short posts, tall
  // screens) have nothing to shuffle; hovering them only raises the shadow.
  const bringToTop = (card: HTMLElement, key: string) => {
    if (key === topKey || shuffling) return;
    const other = [...(card.parentElement?.children ?? [])].find((sibling) => sibling !== card);
    if (!(other instanceof HTMLElement) || !cardsOverlap(card, other)) return;
    setTopKey(key);
    setShuffling(key);
  };

  return (
    <ul aria-label="Posts from the archive" className={`relative ${FRAME}`}>
      {placed.map(({ item, rotate }, index) => {
        const first = index === 0;
        // During a shuffle both cards pull away from each other: the top-left
        // card goes up and left, the bottom-right card goes down and right.
        // The left card sits only ~50px from the heading, so it moves mostly up.
        const style = {
          "--r": `${rotate}deg`,
          "--z": item.key === topKey ? 2 : 1,
          "--pull-x": first ? "-2rem" : "32%",
          "--pull-y": first ? "-17%" : "14%",
        } as CSSProperties;
        const shuffleRole = shuffling === null ? undefined : shuffling === item.key ? "rise" : "sink";
        const platform = item.kind === "x" ? "X" : "Instagram";
        return (
          <li
            key={item.key}
            style={style}
            data-shuffle={shuffleRole}
            onPointerEnter={(event) => { if (event.pointerType === "mouse") bringToTop(event.currentTarget, item.key); }}
            onFocus={(event) => bringToTop(event.currentTarget, item.key)}
            onAnimationEnd={(event) => { if (event.animationName === "feed-shuffle-rise") setShuffling(null); }}
            className={`feed-card group absolute w-3/4 ${first ? "left-0 top-0" : "bottom-0 right-0"}`}
          >
            <div className={`relative animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both ${first ? "" : "[animation-delay:150ms]"}`}>
              <div inert className="[zoom:0.75] [&>article]:mb-0 group-hover:[&>article]:shadow-lg group-focus-within:[&>article]:shadow-lg [&_.grid.rounded-xl]:aspect-[2/1] [@media(max-height:800px)]:[zoom:0.65]">
                {item.kind === "x"
                  ? <TweetCard tweet={item.tweet} user={item.user} />
                  : <InstagramPostCard post={item.post} user={item.user} />}
              </div>
              <Link
                href={item.href}
                aria-label={`Open ${item.user.name}'s ${platform} post from ${item.kind === "x" ? item.tweet.date.slice(0, 10) : item.post.date}`}
                className="absolute inset-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
