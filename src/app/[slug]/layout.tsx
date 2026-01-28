import { getUsers, getUserData, getTimeline, getLatestTweetDate } from "@/lib/api";import { notFound } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import RightSection from '@/components/RightSection';
import FloatingActions from '@/components/FloatingActions';
import SectionTransition from '@/components/SectionTransition'; 
import ProfileEntry from '@/components/ProfileEntry';
import MobileNav from '@/components/MobileNav';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function MemberLayout({ children, params }: LayoutProps) {
  const { slug } = await params;
  const timelineEvents = await getTimeline(slug);
  const lastTweetDate = await getLatestTweetDate(slug);
  const data = await getUserData(slug, 'twitter');
  const allUsers = await getUsers();

  if (!data) return notFound();
  const user = data; 

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      
      <MobileNav slug={slug} user={user} allUsers={allUsers} />

      <ProfileEntry>
        <div className="container max-w-[1400px] mx-auto flex justify-center items-start gap-4 lg:gap-8 pt-0">
          
          <div className="hidden lg:block"> 
             <Sidebar 
               username={slug} 
               user={user} 
               allUsers={allUsers} 
             />
          </div>

          <main className="flex-1 max-w-[640px] pb-10">
              <SectionTransition>
                {children}
              </SectionTransition>
          </main>

          <RightSection 
            events={timelineEvents} 
            slug={slug} 
            lastTweetDate={lastTweetDate} 
          />          
        </div>
      </ProfileEntry>
      
      <FloatingActions />
    </div>
  );
}