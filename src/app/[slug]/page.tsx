import { getUserData, getProfile } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  Twitter, 
  Instagram, 
  BookOpen, 
  ArrowUpRight, 
  Sparkles,
  MapPin,
  Calendar,
  Ruler,
  Droplet,
  Ghost,
  Database,
  GraduationCap
} from 'lucide-react';

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const [twitterUser, profile] = await Promise.all([
    getUserData(slug, 'twitter'),
    getProfile(slug)
  ]);

  if (!twitterUser || !profile) return notFound();

  const PROFILE_SPECS = [
    { label: "状态", value: profile.status, icon: GraduationCap },
    { label: "角色", value: profile.character, icon: Ghost },
    { label: "生日", value: profile.birthday, icon: Calendar },
    { label: "出生", value: profile.birthplace, icon: MapPin },
    { label: "血型", value: profile.blood_type, icon: Droplet },
    { label: "身高", value: profile.height, icon: Ruler },
  ];

  return (
    <div className="flex flex-col gap-6 mt-4 pb-10 max-w-[1400px] mx-auto px-4 sm:px-0 min-h-[calc(100vh-100px)]">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        <div className="lg:col-span-7 flex flex-col h-full">
          <div className="h-full bg-white dark:bg-[#16181c] rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between relative overflow-hidden">
            
            <div className="absolute -bottom-6 -right-6 w-64 h-32 opacity-10 dark:opacity-20 pointer-events-none select-none grayscale mix-blend-multiply dark:mix-blend-screen rotate-[-10deg]">
               <img 
                 src={profile.assets.signature} 
                 alt="Signature" 
                 className="w-full h-full object-contain dark:invert" 
               />
            </div>

            <div className="relative z-10">
                <div className="mb-8">
                  <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-4 mb-2">
                    {profile.name} 
                    <Sparkles 
                      className="animate-pulse opacity-80" 
                      size={32} 
                      style={{ color: profile.color, fill: profile.color }} 
                    />
                  </h1>
                  <div className="flex items-center gap-3 text-gray-500 font-medium text-xl">
                    <span>@{twitterUser.screen_name}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-8 gap-x-6 mb-8 p-1">
                   {PROFILE_SPECS.map((spec) => (
                     <div key={spec.label} className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 opacity-80">
                           <spec.icon size={14} /> {spec.label}
                        </span>
                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                           {spec.value}
                        </span>
                     </div>
                   ))}
                </div>
            </div>

            <div className="relative z-10 pt-8 border-t border-gray-100 dark:border-gray-800 mt-auto">
              <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                 ひとこと
              </h3>
              <p className="text-gray-800 dark:text-gray-200 text-xl leading-relaxed whitespace-pre-wrap font-medium">
                {profile.message}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col h-full min-h-[500px]">
          <div className="relative h-full w-full rounded-3xl overflow-hidden bg-gray-100 dark:bg-[#16181c] shadow-md border border-gray-100 dark:border-gray-800 group select-none">
            <img 
              src={profile.assets.formula} 
              alt={profile.name} 
              className="absolute inset-0 w-full h-full object-cover object-top transition duration-1000 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-30" />
            
            <div className="absolute top-6 right-6 px-4 py-2 bg-black/20 backdrop-blur-md rounded-full text-white/90 text-xs font-bold border border-white/20">
               公式照
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Twitter */}
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

        {/* Instagram */}
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

        <Link href={`https://blog.227wiki.eu.org/categories/%E6%88%90%E5%91%98%E5%8D%9A%E5%AE%A2/%E6%B6%BC%E8%8A%B1%E8%90%8C/`} className="group bg-white dark:bg-[#16181c] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-48 sm:h-64">
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

      <a 
        href="https://227wiki.eu.org/member/moe/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="group relative flex flex-col sm:flex-row items-center justify-between gap-8 bg-white dark:bg-[#16181c] p-10 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
      >
        <div className="absolute -right-20 -bottom-24 text-gray-50 dark:text-[#008CD2]/5 group-hover:scale-110 transition-transform pointer-events-none">
           <Database size={300} strokeWidth={0.5} />
        </div>

        <div className="relative z-10 flex items-center justify-center sm:justify-start h-16 sm:h-20 w-full sm:w-auto">
           <img 
             src="https://227wiki.eu.org/assets/logo.svg" 
             alt="22/7 Wiki" 
             className="h-full w-auto object-contain dark:brightness-0 dark:invert transition-all" 
           />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
           <div className="text-center sm:text-right hidden sm:block">
              <div className="font-bold text-gray-900 dark:text-white text-xl">22/7 WiKi</div>
              <div className="text-gray-500 text-base"></div>
           </div>
           <div className="px-6 py-3 rounded-full bg-[#008CD2]/10 dark:bg-[#008CD2]/20 flex items-center justify-center text-[#008CD2] font-bold group-hover:bg-[#008CD2] group-hover:text-white transition-colors gap-2">
              在 22/7 WiKi 阅览 <ArrowUpRight size={18} />
           </div>
        </div>
      </a>

    </div>
  );
}