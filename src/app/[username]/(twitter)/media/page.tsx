import { getUserData } from '@/lib/api';
import { notFound } from 'next/navigation';
import MediaGrid from '@/components/MediaGrid';

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function MediaPage({ params }: PageProps) {
  const { username } = await params;
  const data = await getUserData(username);

  if (!data) return notFound();

  const { tweets, mediaMap, user } = data;
  const uniqueTweets = Array.from(new Map(tweets.map(item => [item.id, item])).values());

  return (
    <MediaGrid 
      tweets={uniqueTweets} 
      mediaMap={mediaMap} 
      user={user} 
    />
  );
}