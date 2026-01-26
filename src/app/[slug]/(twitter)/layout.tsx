import { getUserData, getTweets } from '@/lib/api'; 
import { notFound } from 'next/navigation';
import TwitterHeader from '@/components/TwitterHeader';
import PageTransition from '@/components/PageTransition';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function TwitterLayout({ children, params }: LayoutProps) {
  const { slug } = await params;

  const user = await getUserData(slug, 'twitter');
  const { total } = await getTweets(slug); 

  if (!user) return notFound();

  return (
    <>
      <TwitterHeader 
        user={user} 
        uniqueTweetsCount={total} 
        slug={slug} 
      />

      <div className="relative z-0">
        <PageTransition>
          {children}
        </PageTransition>
      </div>
    </>
  );
}