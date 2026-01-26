import { getUserData, getTweets } from '@/lib/api'; 
import { notFound } from 'next/navigation';
import MediaGrid from '@/components/MediaGrid';

interface PageProps {
  params: Promise<{ slug: string }>; 
}

export default async function MediaPage({ params }: PageProps) {
  const { slug } = await params;

  const user = await getUserData(slug, 'twitter');
  if (!user) return notFound();


  const { tweets } = await getTweets(slug, 1, 10000);

  const uniqueTweets = Array.from(new Map(tweets.map(item => [item.id, item])).values());

  return (
    <MediaGrid 
      tweets={uniqueTweets} 
      user={user} 
    />
  );
}