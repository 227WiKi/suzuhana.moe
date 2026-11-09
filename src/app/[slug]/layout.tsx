import { getUsers } from "@/lib/api";
import { notFound } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import SectionTransition from '@/components/SectionTransition';
import ProfileEntry from '@/components/ProfileEntry';
import MobileNav from '@/components/MobileNav';

interface LayoutProps {
  children: React.ReactNode;
  right: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function MemberLayout({ children, right, params }: LayoutProps) {
  const { slug } = await params;

  const allUsers = getUsers();
  const user = allUsers.find((archiveUser) => archiveUser.slug === slug);

  if (!user) return notFound();

  return (
    <div
      className="min-h-screen bg-background dark:bg-black text-foreground transition-colors duration-300"
      style={{ scrollbarGutter: 'stable' }}
    >

      <MobileNav slug={slug} user={user} allUsers={allUsers} />

      <ProfileEntry>
        <div className="container max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[260px_minmax(0,640px)] 2xl:grid-cols-[260px_minmax(0,640px)_350px] justify-center items-start gap-8 pt-0 px-4">

          <aside className="hidden lg:block flex-shrink-0 sticky top-4 mt-4 self-start z-40">
             <Sidebar
               username={slug}
               user={user}
               allUsers={allUsers}
             />
          </aside>

          <main className="min-w-0 flex-1 max-w-[640px] pb-24">
              <SectionTransition>
                {children}
              </SectionTransition>
          </main>

          {right}
        </div>
      </ProfileEntry>
    </div>
  );
}
