import { getUserData, getUsers } from '@/lib/api';
import { notFound } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import RightSection from '@/components/RightSection';
import FloatingActions from '@/components/FloatingActions';
import SectionTransition from '@/components/SectionTransition'; 
import ProfileEntry from '@/components/ProfileEntry';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}

export default async function UserLayout({ children, params }: LayoutProps) {
  const { username } = await params;
  const data = await getUserData(username);
  const allUsers = await getUsers();

  if (!data) return notFound();
  const { user } = data;

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      
      <ProfileEntry>

        <div className="container max-w-[1400px] mx-auto flex justify-center items-start gap-4 lg:gap-8 pt-0">
          
          <Sidebar username={username} user={user} allUsers={allUsers} />

          <main className="flex-1 max-w-[640px]">
             <SectionTransition>
               {children}
             </SectionTransition>
          </main>

          <RightSection />
          
        </div>
      </ProfileEntry>
      
      <FloatingActions />
    </div>
  );
}