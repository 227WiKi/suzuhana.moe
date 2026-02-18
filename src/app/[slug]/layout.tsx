import { getUsers, getUserData, getTimeline, getTweetDateRange } from "@/lib/api"; // 👈 修复：确保这一行存在
import { notFound } from 'next/navigation';
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
  const dateRange = await getTweetDateRange(slug);  
  const data = await getUserData(slug, 'twitter');
  const allUsers = await getUsers();

  if (!data) return notFound();
  const user = data; 

  return (
    <div 
      className="min-h-screen bg-[#F9FAFB] dark:bg-black text-gray-900 dark:text-white transition-colors duration-300" 
      style={{ scrollbarGutter: 'stable' }} // 👈 核心：防止滚动条出现引起的布局抖动
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
            dateRange={dateRange}
          />          
        </div>
      </ProfileEntry>
      
      <FloatingActions />
    </div>
  );
}