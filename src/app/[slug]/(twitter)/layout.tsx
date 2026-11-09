import { getUserData } from '@/lib/api';
import { notFound } from 'next/navigation';
import TwitterHeader from '@/components/TwitterHeader';
import PageTransition from "@/components/PageTransition";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function TwitterLayout({ children, params }: LayoutProps) {
  const { slug } = await params;

  const user = await getUserData(slug, 'twitter');

  if (!user) {
    return notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Fill the content column so the gap to the sidebar matches the other member pages. */}
      <div className="w-full min-h-screen">

        <TwitterHeader
          user={user}
          slug={slug}
        />
      <PageTransition >
        {children}
      </PageTransition >
      </div>
    </div>
  );
}
