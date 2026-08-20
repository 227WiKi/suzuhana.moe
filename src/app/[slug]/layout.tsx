import { getUsers, getUserData, getTimeline, getTweetCalendarData } from "@/lib/api";
import { notFound } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import RightSection from '@/components/RightSection';
import SectionTransition from '@/components/SectionTransition'; 
import ProfileEntry from '@/components/ProfileEntry';
import MobileNav from '@/components/MobileNav';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function MemberLayout({ children, params }: LayoutProps) {
  const { slug } = await params;
  
  const [timelineEvents, calendarData, data, allUsers] = await Promise.all([
    getTimeline(slug),
    getTweetCalendarData(slug),
    getUserData(slug, 'twitter'),
    getUsers(),
  ]);

  if (!data) return notFound();
  const user = data; 

  return (
    <div 
      className="min-h-screen bg-[#F9FAFB] dark:bg-black text-gray-900 dark:text-white transition-colors duration-300" 
      style={{ scrollbarGutter: 'stable' }}
    >
      
      <MobileNav slug={slug} user={user} allUsers={allUsers} />

      <ProfileEntry>
        <div className="container max-w-[1400px] mx-auto flex justify-center items-start gap-8 pt-0 px-4">
          
          <aside className="hidden lg:block flex-shrink-0 sticky top-3 self-start z-40"> 
             <Sidebar 
               username={slug} 
               user={user} 
               allUsers={allUsers} 
             />
          </aside>

          <main className="flex-1 max-w-[640px] pb-10">
              <SectionTransition>
                {children}
              </SectionTransition>
          </main>

          <RightSection 
            events={timelineEvents} 
            slug={slug} 
            calendarData={calendarData}
          />          
        </div>
      </ProfileEntry>
    </div>
  );
}
