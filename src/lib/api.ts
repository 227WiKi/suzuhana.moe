import "server-only";

import { cache } from "react";
import { archiveRegistry, type ArchiveJsonLoader } from "../generated/archive-registry";
import { getAllMembers, getMemberBySlug } from "./members";

export interface Media {
  type: "photo" | "video";
  url: string;
  thumbnail_url: string;
}

export interface TweetStats {
  replies: number;
  retweets: number;
  likes: number;
}

export interface Tweet {
  id: string;
  date: string;
  text: string;
  media: Media[];
  stats: TweetStats;
  is_rt: boolean;
  rt_info?: {
    name: string;
    screen_name: string;
    avatar: string;
    text: string;
    type?: string;
  } | null;
}

export interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
  type?: "milestone" | "release" | "graduation" | "sns" | "default";
}

export interface ProfileData {
  name: string;
  color: string;
  status: string;
  character: string;
  birthday: string;
  birthplace: string;
  blood_type: string;
  height: string;
  message: string;
  assets: {
    formula: string;
    signature: string;
    type?: "vertical" | "horizontal";
  };
}

export interface InstagramMediaItem {
  type: "image" | "video";
  url: string;
  poster?: string;
}

export interface InstagramPost {
  id: string;
  date: string;
  text: string;
  images: string[];
  media?: InstagramMediaItem[];
}

export interface ArchiveUser {
  slug: string;
  name: string;
  nickname: string;
  avatar: string;
  banner: string | null;
  bio: string;
  screen_name: string;
  stats: {
    tweets: number;
    following: number;
    followers: number;
  };
}

export interface ArchiveUserSummary {
  slug: string;
  name: string;
  screen_name: string;
  avatar: string;
  bio: string;
  accounts: ReturnType<typeof getAllMembers>[number]["accounts"];
}

export interface MediaArchiveItem {
  media: Media;
  tweet: Tweet;
}

export interface ArchivePage<T> {
  items: T[];
  total: number;
  nextOffset: number | null;
  startOffset?: number;
  previousOffset?: number | null;
  targetId?: string;
}

export interface TweetCalendarData {
  start: string;
  end: string;
  availableDates: string[];
}

interface PlatformUser {
  name?: string;
  avatar?: string;
  profile_image_url_https?: string;
  profile_pic_url?: string;
  banner?: string;
  profile_banner_url?: string;
  bio?: string;
  description?: string;
  screen_name?: string;
  stats?: {
    tweets?: number;
    posts?: number;
    statuses_count?: number;
    following?: number;
    followers?: number;
  };
}

interface ArchiveMeta {
  count: number;
}

interface RawMediaEntity {
  type?: string;
  media_url_https?: string;
  video_info?: { variants?: Array<{ url?: string }> };
}

interface RawTweet extends Omit<Tweet, "media"> {
  media?: string[] | Media[];
  extended_entities?: { media?: RawMediaEntity[] };
}

interface RawMediaMapItem {
  type?: string;
  url?: string;
  thumbnail_url?: string;
}

function moduleValue<T>(module: { default?: T } | T): T {
  return (module as { default?: T }).default ?? (module as T);
}

async function loadJson<T>(loader: ArchiveJsonLoader): Promise<T> {
  return moduleValue<T>(await loader() as { default?: T } | T);
}

async function loadPlatformUser(slug: string, platform: "twitter" | "instagram") {
  const loader = archiveRegistry[slug]?.[platform]?.user;
  if (!loader) throw new Error(`${platform} user data is unavailable for ${slug}`);
  return loadJson<PlatformUser>(loader);
}

async function loadArchiveMeta(slug: string, platform: "twitter" | "instagram") {
  const loader = archiveRegistry[slug]?.[platform]?.meta;
  return loader ? loadJson<ArchiveMeta>(loader) : null;
}

async function loadRawTweets(slug: string): Promise<RawTweet[]> {
  const loader = archiveRegistry[slug]?.twitter?.tweets;
  if (!loader) return [];
  const value = await loadJson<RawTweet[] | { tweets?: RawTweet[] }>(loader);
  if (Array.isArray(value)) return value as RawTweet[];
  return value.tweets ?? [];
}

async function loadMediaMap(slug: string): Promise<Record<string, RawMediaMapItem>> {
  const loader = archiveRegistry[slug]?.twitter?.media_map;
  return loader ? loadJson<Record<string, RawMediaMapItem>>(loader) : {};
}

export const getUserData = cache(async (
  slug: string,
  platform: "twitter" | "instagram" = "twitter",
): Promise<ArchiveUser | null> => {
  const member = getMemberBySlug(slug);
  if (!member) return null;

  let platformUser: PlatformUser = {};
  let meta: ArchiveMeta | null = null;
  try {
    [platformUser, meta] = await Promise.all([
      loadPlatformUser(slug, platform),
      loadArchiveMeta(slug, platform),
    ]);
  } catch {
    console.warn(`[API] User data not found for ${slug} on ${platform}`);
  }

  const fallbackCount = platformUser.stats?.tweets
    ?? platformUser.stats?.posts
    ?? platformUser.stats?.statuses_count
    ?? 0;
  const postCount = meta?.count ?? fallbackCount;

  return {
    slug: member.slug,
    name: member.name,
    nickname: platformUser.name || member.name,
    avatar: platformUser.avatar || platformUser.profile_image_url_https || platformUser.profile_pic_url || member.avatar,
    banner: platformUser.banner || platformUser.profile_banner_url || null,
    bio: platformUser.bio || platformUser.description || member.bio || "",
    screen_name: platformUser.screen_name
      || member.accounts[platform]
      || member.accounts.twitter
      || member.accounts.instagram
      || member.slug,
    stats: {
      tweets: postCount,
      following: platformUser.stats?.following || 0,
      followers: platformUser.stats?.followers || 0,
    },
  };
});

export const getTweets = cache(async (slug: string): Promise<Tweet[]> => {
  try {
    const [rawTweets, mediaMap] = await Promise.all([loadRawTweets(slug), loadMediaMap(slug)]);
    const unique = new Map<string, Tweet>();

    for (const rawTweet of rawTweets) {
      let media: Media[] = [];
      if (Array.isArray(rawTweet.media) && typeof rawTweet.media[0] === "string") {
        media = (rawTweet.media as string[]).flatMap((id) => {
          const item = mediaMap[id];
          if (!item?.url) return [];
          return [{
            type: item.type === "video" ? "video" as const : "photo" as const,
            url: item.url,
            thumbnail_url: item.thumbnail_url || item.url,
          }];
        });
      } else if (rawTweet.extended_entities?.media) {
        media = rawTweet.extended_entities.media.flatMap((item) => {
          const url = item.video_info?.variants?.[0]?.url || item.media_url_https;
          if (!url) return [];
          return [{
            type: item.type === "video" ? "video" as const : "photo" as const,
            url,
            thumbnail_url: item.media_url_https || url,
          }];
        });
      } else if (Array.isArray(rawTweet.media)) {
        media = rawTweet.media as Media[];
      }

      unique.set(rawTweet.id, {
        ...rawTweet,
        media,
        stats: rawTweet.stats || { replies: 0, retweets: 0, likes: 0 },
        is_rt: Boolean(rawTweet.is_rt),
      });
    }

    return Array.from(unique.values()).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  } catch {
    console.warn(`No tweets found for ${slug}`);
    return [];
  }
});

const getTweetPageCached = cache(async (
  slug: string,
  offset: number,
  requestedLimit: number,
  targetDate: string,
): Promise<ArchivePage<Tweet>> => {
  const tweets = await getTweets(slug);
  const limit = Math.min(Math.max(requestedLimit, 1), 5000);
  let start = Math.min(offset, tweets.length);
  let end = Math.min(start + limit, tweets.length);
  let targetId: string | undefined;

  if (offset === 0 && targetDate) {
    const normalizedDate = targetDate.substring(0, 10);
    const targetIndex = tweets.findIndex((tweet) => tweet.date.substring(0, 10) <= normalizedDate);
    if (targetIndex >= 0) {
      targetId = tweets[targetIndex].id;
      start = targetIndex;
      end = Math.min(start + limit, tweets.length);
    }
  }

  return {
    items: tweets.slice(start, end),
    total: tweets.length,
    startOffset: start,
    previousOffset: start > 0 ? Math.max(0, start - limit) : null,
    nextOffset: end < tweets.length ? end : null,
    targetId,
  };
});

export function getTweetPage(slug: string, offset = 0, limit = 20, targetDate = "") {
  return getTweetPageCached(slug, Math.max(offset, 0), limit, targetDate);
}

const getMediaArchive = cache(async (slug: string): Promise<MediaArchiveItem[]> => {
  const tweets = await getTweets(slug);
  return tweets.flatMap((tweet) => tweet.media.map((media) => ({ media, tweet })));
});

const getMediaPageCached = cache(async (
  slug: string,
  offset: number,
  requestedLimit: number,
): Promise<ArchivePage<MediaArchiveItem>> => {
  const media = await getMediaArchive(slug);
  const limit = Math.min(Math.max(requestedLimit, 1), 5000);
  const end = Math.min(offset + limit, media.length);
  return {
    items: media.slice(offset, end),
    total: media.length,
    nextOffset: end < media.length ? end : null,
  };
});

export function getMediaPage(slug: string, offset = 0, limit = 15) {
  return getMediaPageCached(slug, Math.max(offset, 0), limit);
}

export const getProfile = cache(async (slug: string): Promise<ProfileData | null> => {
  try {
    const loader = archiveRegistry[slug]?.profile;
    return loader ? loadJson<ProfileData>(loader) : null;
  } catch {
    return null;
  }
});

export const getUsers = cache((): ArchiveUserSummary[] => (
  getAllMembers().map((member) => ({
    slug: member.slug,
    name: member.name,
    screen_name: member.accounts.twitter
      || member.accounts.instagram
      || member.slug,
    avatar: member.avatar,
    bio: member.bio || "",
    accounts: member.accounts,
  }))
));

export const getTimeline = cache(async (slug: string): Promise<TimelineEvent[]> => {
  try {
    const loader = archiveRegistry[slug]?.timeline;
    return loader ? loadJson<TimelineEvent[]>(loader) : [];
  } catch {
    return [];
  }
});

export const getTweetCalendarData = cache(async (slug: string): Promise<TweetCalendarData | null> => {
  const tweets = await getTweets(slug);
  const availableDates = Array.from(new Set(
    tweets
      .map((tweet) => tweet.date.substring(0, 10))
      .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)),
  )).sort();

  if (availableDates.length === 0) return null;

  return {
    start: availableDates[0],
    end: availableDates[availableDates.length - 1],
    availableDates,
  };
});

export const getInstagramPosts = cache(async (slug: string): Promise<InstagramPost[]> => {
  try {
    const loader = archiveRegistry[slug]?.instagram?.posts;
    if (!loader) return [];
    const value = await loadJson<InstagramPost[] | { posts?: InstagramPost[] }>(loader);
    const posts = Array.isArray(value) ? value : value.posts ?? [];
    return [...posts].sort((a, b) => b.id.localeCompare(a.id));
  } catch {
    console.warn(`Instagram posts not found for ${slug}`);
    return [];
  }
});
