import { getUserData, getTweets } from '@/lib/api';
import { notFound } from 'next/navigation';
import TweetList from '@/components/TweetList';

interface PageProps {
  params: Promise<{ slug: string }>; 
}

export default async function TweetsPage({ params }: PageProps) {
  const { slug } = await params;

  const user = await getUserData(slug, 'twitter');
  if (!user) return notFound();

  const { tweets } = await getTweets(slug);

  return (
    <TweetList 
      initialTweets={tweets} 
      user={user} 
    />
  );
}