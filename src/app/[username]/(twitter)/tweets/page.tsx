import { getUserData } from '@/lib/api';
import { notFound } from 'next/navigation';
import TweetList from '@/components/TweetList';

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function TweetsPage({ params }: PageProps) {
  const { username } = await params;
  const data = await getUserData(username);

  if (!data) return notFound();

  const { tweets, mediaMap, user } = data;
  const uniqueTweets = Array.from(new Map(tweets.map(item => [item.id, item])).values());

  return (
    <TweetList 
      initialTweets={uniqueTweets} 
      mediaMap={mediaMap} 
      user={user} 
    />
  );
}