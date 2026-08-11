import { getUserData, getProfile } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MEMBERS } from '@/lib/members'; 
import { ProfileImageCard, ProfileInfoCard, WikiBannerCard, WikiBoxCard } from '@/components/ProfileCards';
import { 
  Twitter, 
  Instagram, 
  BookOpen, 
  ArrowUpRight
} from 'lucide-react';

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const [twitterUser, profile] = await Promise.all([
    getUserData(slug, 'twitter'),
    getProfile(slug)
  ]);

  if (!twitterUser || !profile) return notFound();

  const memberConfig = MEMBERS.find(m => m.slug === slug);
  const hasInstagram = Boolean(memberConfig?.accounts?.instagram);
  const blogUrl = memberConfig?.accounts?.blog;

  const isHorizontal = profile.assets.type === 'horizontal';

  return (
    <div className="flex flex-col gap-6 mt-4 pb-10 max-w-[1400px] mx-auto px-4 sm:px-0 min-h-[calc(100vh-100px)]">
      
      <div className={`grid grid-cols-1 gap-6 flex-1 ${isHorizontal ? 'lg:grid-cols-2' : 'lg:grid-cols-12'}`}>
        
        <div className={`h-full ${isHorizontal ? '' : 'lg:col-span-7'}`}>
           <ProfileInfoCard profile={profile} twitterUser={twitterUser} />
        </div>

        <div className={`flex flex-col gap-6 ${isHorizontal ? '' : 'lg:col-span-5 h-full'}`}>
           
           <ProfileImageCard profile={profile}
             className={isHorizontal 
               ? 'aspect-[3/2]' 
               : 'flex-1 min-h-[500px]'
             } 
           />

           {isHorizontal && (
             <WikiBoxCard slug={slug} name={profile.name} className="flex-1" />
           )}

        </div>
      </div>

      {!isHorizontal && (
        <WikiBannerCard slug={slug} name={profile.name} />
      )}


      <div className={`grid grid-cols-1 ${hasInstagram ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
        <Link href={`/${slug}/tweets`} className="group bg-white dark:bg-[#16181c] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-48 sm:h-64">
           <div className="absolute -top-4 -right-4 text-gray-100 dark:text-[#1d9bf0]/5 group-hover:scale-110 transition-transform">
             <Twitter size={140} strokeWidth={1} />
           </div>
           <div className="relative z-10">
             <div className="w-14 h-14 bg-[#1d9bf0]/10 rounded-2xl flex items-center justify-center text-[#1d9bf0] mb-6">
               <Twitter size={28} />
             </div>
             <h3 className="text-2xl font-black text-gray-900 dark:text-white">Twitter</h3>
           </div>
           <div className="relative z-10 flex items-center font-bold text-[#1d9bf0]">
             Visit <ArrowUpRight size={18} className="ml-2" />
           </div>
        </Link>

        {hasInstagram && (
          <Link href={`/${slug}/instagram`} className="group bg-white dark:bg-[#16181c] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-48 sm:h-64">
             <div className="absolute -top-4 -right-4 text-gray-100 dark:text-pink-500/5 group-hover:scale-110 transition-transform">
               <Instagram size={140} strokeWidth={1} />
             </div>
             <div className="relative z-10">
               <div className="w-14 h-14 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-500 mb-6">
                 <Instagram size={28} />
               </div>
               <h3 className="text-2xl font-black text-gray-900 dark:text-white">Instagram</h3>
             </div>
             <div className="relative z-10 flex items-center font-bold text-pink-500">
               Visit <ArrowUpRight size={18} className="ml-2" />
             </div>
          </Link>
        )}

        <Link href={blogUrl!} className="group bg-white dark:bg-[#16181c] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-48 sm:h-64">
           <div className="absolute -top-4 -right-4 text-gray-100 dark:text-emerald-500/5 group-hover:scale-110 transition-transform">
             <BookOpen size={140} strokeWidth={1} />
           </div>
           <div className="relative z-10">
             <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6">
               <BookOpen size={28} />
             </div>
             <h3 className="text-2xl font-black text-gray-900 dark:text-white">Blog</h3>
           </div>
           <div className="relative z-10 flex items-center font-bold text-emerald-500">
             Visit <ArrowUpRight size={18} className="ml-2" />
           </div>
        </Link>
      </div>

    </div>
  );
}
