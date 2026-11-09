"use client";

import type { ArchiveUser, Tweet } from "@/lib/api";
import ImageGallery from "./ImageGallery";
import RichText from "./RichText";
import { CalendarDays, MessageCircle, Repeat, Heart } from "lucide-react";

interface TweetCardProps {
  tweet: Tweet;
  user: ArchiveUser;
  hideMedia?: boolean;
}

const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function formatDate(dateString: string | undefined) {
  if (!dateString) return '';

  let cleanString = dateString;

  if (dateString.includes(' -')) {
     cleanString = dateString.split(' -')[0];
  } else if (dateString.includes(' +')) {
     cleanString = dateString.split(' +')[0];
  }

  const safeDateString = cleanString.replace(/-/g, '/');

  const date = new Date(safeDateString);

  if (isNaN(date.getTime())) {
    return '';
  }

  return dateFormatter.format(date);
}

export default function TweetCard({ tweet, user, hideMedia = false }: TweetCardProps) {
  const mediaItems = tweet.media || [];

  const isRetweet = tweet.is_rt && tweet.rt_info?.type !== 'quote';
  const isQuote = tweet.is_rt && tweet.rt_info?.type === 'quote';

  const displayUser = isRetweet && tweet.rt_info ? tweet.rt_info : user;
  const displayName = "nickname" in displayUser && displayUser.nickname
    ? displayUser.nickname
    : displayUser.name;

  return (
    <article
      id={`tweet-${tweet.id}`}

      className="
        w-full mb-4
        bg-card
        rounded-2xl
        p-4
        shadow-sm hover:shadow-md transition-shadow duration-300
        border border-border
        scroll-mt-24
      "
    >

      {isRetweet && (
        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2 ml-12 font-bold">
          <Repeat size={16} aria-hidden="true" className="text-muted-foreground" />
          <span className="hover:underline text-muted-foreground">{user.name} reposted</span>
        </div>
      )}

      <div className="flex gap-4">
        <div className="shrink-0">
          <img
            src={displayUser.avatar}
            alt={displayName}
            className="w-11 h-11 rounded-full object-cover border border-border hover:opacity-90 transition"
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-base">
            <span className="font-bold text-foreground truncate hover:underline text-base">
              {displayName}
            </span>
            <span className="text-muted-foreground text-sm truncate">@{displayUser.screen_name}</span>
            <time dateTime={tweet.date?.slice(0, 10)} className="inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
              <CalendarDays size={16} aria-hidden="true" />
              {formatDate(tweet.date)}
            </time>
          </div>

          <div className="text-base leading-relaxed whitespace-pre-wrap text-foreground mb-3">
            <RichText
              text={tweet.text}
              preventPropagation={true}
            />
          </div>

          {!hideMedia && mediaItems.length > 0 && <ImageGallery media={mediaItems} />}

          {isQuote && tweet.rt_info && (
            <div className="mt-3 border border-border rounded-xl p-3 bg-muted dark:bg-black/30 hover:bg-muted dark:hover:bg-black/50 transition overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={tweet.rt_info.avatar}
                  className="w-5 h-5 rounded-full object-cover"
                  alt={tweet.rt_info.name}
                  onError={(e) => e.currentTarget.style.display='none'}
                />
                <span className="font-bold text-sm truncate text-foreground">{tweet.rt_info.name}</span>
                <span className="text-muted-foreground text-sm truncate">@{tweet.rt_info.screen_name}</span>
              </div>
              <div className="text-sm text-foreground dark:text-muted-foreground whitespace-pre-wrap leading-5">
                 <RichText
                   text={tweet.rt_info.text || "Click to view original tweet"}
                   preventPropagation={true}
                 />
              </div>
            </div>
          )}

          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {[
              { label: "回复", value: tweet.stats.replies, icon: MessageCircle },
              { label: "转发", value: tweet.stats.retweets, icon: Repeat },
              { label: "喜欢", value: tweet.stats.likes, icon: Heart },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="inline-flex items-center gap-2">
                <dt className="inline-flex items-center gap-1"><Icon size={16} aria-hidden="true" /><span className="sr-only">{label}</span></dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </article>
  );
}
