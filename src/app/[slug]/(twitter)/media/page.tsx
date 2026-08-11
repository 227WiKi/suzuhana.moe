import { getMediaPage, getUserData } from '@/lib/api';
import { notFound } from 'next/navigation';
import MediaGrid from '@/components/MediaGrid';

interface PageProps {
  params: Promise<{ slug: string }>; 
}

export default async function MediaPage({ params }: PageProps) {
  const { slug } = await params;

  const [user, page] = await Promise.all([
    getUserData(slug, 'twitter'),
    getMediaPage(slug),
  ]);
  if (!user) return notFound();
  
  return (
    <MediaGrid 
      initialItems={page.items}
      total={page.total}
      nextOffset={page.nextOffset}
      slug={slug}
      user={user} 
    />
  );
}
