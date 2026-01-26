"use client";

import { Tweet, Media } from "@/lib/api";
import ImageGallery from "./ImageGallery";
import RichText from "./RichText";
import { MessageCircle, Repeat, Heart } from "lucide-react";
import React from "react";

interface TweetCardProps {
  tweet: Tweet;
  user: any;
  hideMedia?: boolean; 
}

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

  return new Intl.DateTimeFormat('ja-JP', { 
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export default function TweetCard({ tweet, user, hideMedia = false }: TweetCardProps) {
  const mediaItems = tweet.media || [];

  const isRetweet = tweet.is_rt && tweet.rt_info?.type !== 'quote';
  const isQuote = tweet.is_rt && tweet.rt_info?.type === 'quote';

  const displayUser = isRetweet && tweet.rt_info ? tweet.rt_info : user;

  return (
    <article 
      id={`tweet-${tweet.id}`}

      className="
        w-full mb-4 
        bg-white dark:bg-[#16181c] 
        rounded-2xl 
        p-4 
        shadow-sm hover:shadow-md transition-shadow duration-300 
        border border-gray-100 dark:border-gray-800
        cursor-pointer 
        scroll-mt-24  
      "
    >
      
      {isRetweet && (
        <div className="flex items-center gap-2 text-gray-500 text-xs mb-2 ml-12 font-bold">
          <Repeat size={14} className="text-green-500" />
          <span className="hover:underline text-gray-500 dark:text-gray-400">{user.name} Retweeted</span>
        </div>
      )}

      <div className="flex gap-4">
        <div className="shrink-0">
          <img 
            src={displayUser.avatar} 
            alt={displayUser.nickname || displayUser.name}
            className="w-11 h-11 rounded-full object-cover border border-gray-100 dark:border-gray-700 hover:opacity-90 transition"
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[15px] mb-1">
            <span className="font-bold text-black dark:text-white truncate hover:underline text-[16px]">
              {displayUser.nickname || displayUser.name}
            </span>
            <span className="text-gray-500 dark:text-gray-500 text-sm truncate">@{displayUser.screen_name}</span>
            <span className="text-gray-400 px-1">·</span>         
            <time className="text-gray-500 text-sm hover:underline">
              {formatDate(tweet.date)}
            </time>
          </div>

          <div className="text-[15px] leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-gray-200 mb-3">
            <RichText 
              text={tweet.text} 
              preventPropagation={true} 
            />
          </div>

          {!hideMedia && mediaItems.length > 0 && <ImageGallery media={mediaItems} />}

          {isQuote && tweet.rt_info && (
            <div className="mt-3 border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-black/30 hover:bg-gray-100 dark:hover:bg-black/50 transition overflow-hidden">
              <div className="flex items-center gap-2 mb-1.5">
                <img 
                  src={tweet.rt_info.avatar} 
                  className="w-5 h-5 rounded-full object-cover" 
                  alt={tweet.rt_info.name} 
                  onError={(e) => e.currentTarget.style.display='none'}
                />
                <span className="font-bold text-sm truncate text-black dark:text-white">{tweet.rt_info.name}</span>
                <span className="text-gray-500 text-sm truncate">@{tweet.rt_info.screen_name}</span>
              </div>
              <div className="text-[14px] text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-5">
                 <RichText 
                   text={tweet.rt_info.text || "Click to view original tweet"} 
                   preventPropagation={true} 
                 />
              </div>
            </div>
          )}

          <div className="flex justify-between mt-4 max-w-md text-gray-400">
            <button className="group flex items-center gap-2 hover:text-[#008CD2] transition text-sm">
              <div className="p-2 rounded-full group-hover:bg-[#008CD2]/10 dark:group-hover:bg-[#008CD2]/10"><MessageCircle size={18} /></div>
              <span className="font-medium">{tweet.stats.replies > 0 ? tweet.stats.replies : ''}</span>
            </button>
            <button className={`group flex items-center gap-2 transition text-sm ${isRetweet ? 'text-green-500' : 'hover:text-green-500'}`}>
              <div className="p-2 rounded-full group-hover:bg-green-50 dark:group-hover:bg-green-500/10"><Repeat size={18} /></div>
              <span className="font-medium">{tweet.stats.retweets > 0 ? tweet.stats.retweets : ''}</span>
            </button>
            <button className="group flex items-center gap-2 hover:text-pink-500 transition text-sm">
              <div className="p-2 rounded-full group-hover:bg-pink-50 dark:group-hover:bg-pink-500/10"><Heart size={18} /></div>
              <span className="font-medium">{tweet.stats.likes > 0 ? tweet.stats.likes : ''}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}