import { getUserData } from '@/lib/api';
import { notFound } from 'next/navigation';
import TwitterHeader from '@/components/TwitterHeader';
import PageTransition from '@/components/PageTransition';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}

export default async function TwitterLayout({ children, params }: LayoutProps) {
  const { username } = await params;
  const data = await getUserData(username);

  if (!data) return notFound();

  const { user, tweets } = data;
  const uniqueTweetsCount = new Set(tweets.map(t => t.id)).size;

  return (
    <>
      <TwitterHeader user={user} uniqueTweetsCount={uniqueTweetsCount} username={username} />

      <div>
        <PageTransition>
          {children}
        </PageTransition>
      </div>
    </>
  );
}