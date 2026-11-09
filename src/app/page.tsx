import Link from 'next/link';
import {
  getInstagramPosts,
  getTweets,
  getUserData,
  getUsers,
  type ArchiveUserSummary,
  type Tweet,
} from '@/lib/api';
import { ArrowDown, AtSign, GitCommitHorizontal, Github, Instagram } from 'lucide-react';
import HomeEntry from '@/components/HomeEntry';
import HomePostFeed, { type FeedInstagramPost, type FeedTweet, type FeedUsers } from '@/components/HomePostFeed';
import ScrollToButton from '@/components/ScrollToButton';
import XIcon from '@/components/icons/XIcon';
import { buttonVariants } from '@/components/ui/button';

const gradientText = 'bg-gradient-to-r from-brand-start to-brand-end bg-clip-text text-transparent';
const POOL_PER_SOURCE = 12;
const REPO_URL = 'https://github.com/227WiKi/suzuhana.moe';
// Short hash injected by next.config.ts at build time; "dev" when git is unavailable.
const BUILD_COMMIT = process.env.NEXT_PUBLIC_COMMIT_SHA || 'dev';

function collapseLines(text: string) {
  return text
    .split('\n')
    // Instagram captions often use invisible characters or a lone dot as spacer lines.
    .map((line) => line.replace(/[\u200b-\u200d\u2060-\u2064\ufeff]/g, '').trim())
    .filter((line) => line && line !== '.' && line !== '・')
    .join('\n');
}

function sample<T>(items: T[], count: number) {
  const pool = [...items];
  const result: T[] = [];
  while (pool.length && result.length < count) {
    result.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return result;
}

// Short original tweets with at most three photos; the feed crops the photo
// grid to 2:1 so both cards fit in the first screen.
function isCompactTweet(tweet: Tweet, text: string) {
  const isReply = (tweet as { is_reply?: boolean }).is_reply;
  return !tweet.is_rt
    && !isReply
    && text.length >= 12
    && text.length <= 90
    && text.split('\n').length <= 4
    && tweet.media.length <= 3;
}

// A pool of candidates is built at render time; the client picks from it on every load.
async function getFeedPool(members: ArchiveUserSummary[]) {
  const sources = await Promise.all(members.map(async (member) => {
    const [tweets, posts, twitterUser, instagramUser] = await Promise.all([
      member.accounts.twitter ? getTweets(member.slug) : [],
      member.accounts.instagram ? getInstagramPosts(member.slug) : [],
      member.accounts.twitter ? getUserData(member.slug, 'twitter') : null,
      member.accounts.instagram ? getUserData(member.slug, 'instagram') : null,
    ]);

    const feedTweets = tweets.flatMap((tweet): FeedTweet[] => {
      const text = collapseLines(tweet.text.replace(/https?:\/\/t\.co\/\S+/g, ''));
      if (!isCompactTweet(tweet, text)) return [];
      return [{
        key: `x-${tweet.id}`,
        slug: member.slug,
        href: `/${member.slug}/tweets?date=${tweet.date.slice(0, 10)}`,
        tweet: { ...tweet, text },
      }];
    });

    const feedPosts = posts.flatMap((post): FeedInstagramPost[] => {
      const text = collapseLines(post.text || '');
      const image = post.media?.find((item) => item.type === 'image')?.url
        || post.images.find((url) => !/\.mp4($|\?)/i.test(url));
      if (!image || text.replace(/[#＃]\S+/g, '').trim().length < 8) return [];
      const date = post.date.slice(0, 10);
      return [{
        key: `ig-${member.slug}-${post.id}`,
        slug: member.slug,
        href: `/${member.slug}/instagram?from=${date}&to=${date}`,
        post: { id: post.id, date, text, images: [image] },
      }];
    });

    return {
      slug: member.slug,
      tweets: sample(feedTweets, POOL_PER_SOURCE),
      posts: sample(feedPosts, POOL_PER_SOURCE),
      users: { twitter: twitterUser ?? undefined, instagram: instagramUser ?? undefined },
    };
  }));

  return {
    tweets: sources.flatMap((source) => source.tweets),
    posts: sources.flatMap((source) => source.posts),
    users: Object.fromEntries(sources.map((source) => [source.slug, source.users])) as FeedUsers,
  };
}

function SiteMark({ className = '' }: { className?: string }) {
  return (
    <span className={`flex flex-col font-black leading-tight tracking-tight ${className}`}>
      <span>Project</span>
      <span className={gradientText}>Suzuhana Moe</span>
    </span>
  );
}

export default async function GlobalLandingPage() {
  const members = getUsers();
  const feed = await getFeedPool(members);

  return (
    <HomeEntry>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
          <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
            <Link href="/" aria-label="Project Suzuhana Moe" className="inline-flex min-h-11 items-center">
              <SiteMark className="text-base" />
            </Link>
            <div className="flex items-center">
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 px-3 text-sm text-muted-foreground transition-colors hover:text-foreground">
                <Github className="size-4" aria-hidden="true" />
                GitHub
              </a>
              {BUILD_COMMIT === 'dev' ? (
                <span className="inline-flex min-h-11 items-center gap-1 pr-3 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-xs text-muted-foreground">
                  <GitCommitHorizontal className="size-4" aria-hidden="true" />
                  dev
                </span>
              ) : (
                <a
                  href={`${REPO_URL}/commit/${BUILD_COMMIT}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Commit this site was built from"
                  aria-label={`Built from commit ${BUILD_COMMIT}`}
                  className="inline-flex min-h-11 items-center gap-1 pr-3 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <GitCommitHorizontal className="size-4" aria-hidden="true" />
                  {BUILD_COMMIT}
                </a>
              )}
            </div>
          </nav>
        </header>

        <section className="flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden border-b border-border">
          <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:gap-8">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-6">
                <h1 className="hero-rise text-5xl font-black leading-none tracking-tight sm:text-7xl lg:text-6xl xl:text-7xl">
                  <span className="block">Project</span>
                  <span className={`block pb-2 sm:whitespace-nowrap ${gradientText}`}>Suzuhana Moe</span>
                </h1>
                <p className="hero-rise max-w-xl text-lg leading-8 text-muted-foreground [animation-delay:120ms]">
                  An archive of X and Instagram posts from 22/7 members. Posts, photos and videos are saved here, so you can still read them after the original accounts are gone.
                </p>
              </div>
              <div className="hero-rise flex flex-wrap items-center gap-4 [animation-delay:240ms]">
                <ScrollToButton targetId="archives" className={buttonVariants({ variant: 'outline', size: 'lg', className: 'border-border! shadow-xs' })}>
                  Browse archives
                  <ArrowDown aria-hidden="true" />
                </ScrollToButton>
              </div>
            </div>

            <div className="hero-rise w-full max-w-md justify-self-center [animation-delay:200ms] lg:justify-self-end">
              <HomePostFeed tweets={feed.tweets} posts={feed.posts} users={feed.users} />
            </div>
          </div>
        </section>

        <main id="archives" className="mx-auto flex w-full max-w-6xl flex-1 scroll-mt-16 flex-col gap-12 px-4 py-16 sm:px-6">
          <section aria-labelledby="archive-heading" className="flex flex-col gap-6">
            <h2 id="archive-heading" className="text-2xl font-bold tracking-tight">Archived members</h2>
            {members.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border px-6 py-12 text-center text-sm">
                <p className="text-muted-foreground">No member archives have been added yet.</p>
                <a href="https://227wiki.eu.org" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center rounded-lg px-4 font-bold text-accent hover:underline">
                  Browse 22/7 WiKi
                </a>
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {members.map((member) => (
                  <li key={member.slug}>
                    <Link
                      href={`/${member.slug}`}
                      className="flex h-full flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm transition-shadow duration-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <div className="flex items-center gap-4">
                        {member.avatar ? (
                          <img src={member.avatar} alt="" className="size-16 shrink-0 rounded-full border border-border object-cover" />
                        ) : null}
                        <div className="flex min-w-0 flex-col">
                          <h3 title={member.name} className="line-clamp-2 text-lg font-bold leading-6">{member.name}</h3>
                          <p title={`@${member.screen_name}`} className="flex items-center gap-1 text-sm text-muted-foreground">
                            <AtSign className="size-4 shrink-0" aria-hidden="true" />
                            <span className="truncate">{member.screen_name}</span>
                          </p>
                        </div>
                      </div>
                      {member.bio ? (
                        <p title={member.bio} className="line-clamp-3 min-h-18 text-sm leading-6 text-muted-foreground">{member.bio}</p>
                      ) : null}
                      <div className="mt-auto flex flex-wrap gap-4 border-t border-border pt-4 text-sm text-muted-foreground">
                        {member.accounts?.twitter ? (
                          <span className="inline-flex items-center gap-2"><XIcon className="size-4 text-social-twitter" />X</span>
                        ) : null}
                        {member.accounts?.instagram ? (
                          <span className="inline-flex items-center gap-2"><Instagram className="size-4 text-social-instagram" aria-hidden="true" />Instagram</span>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>

        <footer className="border-t border-border text-sm text-muted-foreground">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 py-6 pl-4 pr-20 sm:pl-6 xl:pr-6">
            <Link href="/" aria-label="Project Suzuhana Moe" className="inline-flex min-h-11 items-center text-foreground">
              <SiteMark className="text-sm" />
            </Link>
            <div className="flex flex-wrap items-center gap-x-4">
              <a href="https://github.com/227WiKi/suzuhana.moe" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center transition-colors hover:text-foreground">GitHub</a>
              <a href="https://227wiki.eu.org" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center transition-colors hover:text-foreground">22/7 WiKi</a>
              <span>© {new Date().getFullYear()} 22/7 WiKi</span>
            </div>
          </div>
        </footer>
      </div>
    </HomeEntry>
  );
}
