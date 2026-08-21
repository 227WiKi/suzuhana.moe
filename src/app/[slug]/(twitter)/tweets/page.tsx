import { getTweetPage, getUserData } from '@/lib/api';
import { notFound } from 'next/navigation';
import TweetList from '@/components/TweetList';

interface PageProps {
  params: Promise<{ slug: string }>; 
  searchParams: Promise<{ date?: string }>;
}

export default async function TweetsPage({ params, searchParams }: PageProps) {
  const [{ slug }, { date = "" }] = await Promise.all([params, searchParams]);

  const [user, page] = await Promise.all([
    getUserData(slug, 'twitter'),
    getTweetPage(slug, 0, 20, date),
  ]);
  if (!user) return notFound();
  
  return (
    <TweetList 
      key={date || "latest"}
      initialTweets={page.items}
      initialOffset={page.startOffset ?? 0}
      initialPreviousOffset={page.previousOffset ?? null}
      nextOffset={page.nextOffset}
      targetTweetId={page.targetId}
      slug={slug}
      user={user} 
    />
  );
}
