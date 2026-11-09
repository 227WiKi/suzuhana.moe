"use client";

import RichText from '@/components/RichText';
import ProfileTabs from '@/components/ProfileTabs';
import type { ArchiveUser } from '@/lib/api';

interface TwitterHeaderProps {
  user: ArchiveUser;
  slug: string;
}

export default function TwitterHeader({ user, slug }: TwitterHeaderProps) {
  const displayName = user.nickname || user.name;
  const tweetCount = user.stats?.tweets || 0;
  return (
    <>
      <div
        data-archive-sticky-header
        className={`
          hidden sm:block
          sticky top-4 z-30 w-full mt-4 mb-4
          bg-card/90 backdrop-blur-md
          px-4 py-3 rounded-xl shadow-sm border border-white/20
          pointer-events-none sm:pointer-events-auto
        `}
      >
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-xl font-bold leading-tight">{displayName}</span>
          <span className="text-xs text-muted-foreground">{tweetCount} posts</span>
        </div>
      </div>

      <div className="mt-3 sm:mt-0 bg-card rounded-2xl overflow-hidden shadow-sm mb-4 border border-border">
          <div className="relative">
            <div className={user.banner ? "h-32 sm:h-48 overflow-hidden select-none" : "h-8"}>
                {user.banner && (
                  <img
                    src={user.banner}
                    alt="banner"
                    className="w-full h-full object-cover"
                  />
                )}
            </div>
            <div className="absolute -bottom-12 left-4">
                <img
                  src={user.avatar}
                  alt={displayName}
                  className="w-24 h-24 rounded-full border-4 border-white dark:border-card object-cover bg-card"
                />
            </div>
          </div>

          <div className="mt-14 px-5 pb-5">
            <h1 className="text-xl font-bold text-foreground">{displayName}</h1>
            <div className="text-muted-foreground text-sm">@{user.screen_name}</div>

            <div className="mt-3 whitespace-pre-wrap leading-relaxed text-foreground text-base">
              <RichText text={user.bio} />
            </div>
          </div>

          <ProfileTabs slug={slug} />
      </div>
    </>
  );
}
