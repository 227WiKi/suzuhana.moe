import { getUserData } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, History, Image as ImageIcon, Star } from 'lucide-react';

export default async function ProjectHomePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const data = await getUserData(username);
  if (!data) return notFound();
  const { user } = data;

  return (
    <div className="flex flex-col gap-4 mt-2">
      
      <div className="relative rounded-2xl overflow-hidden bg-gray-900 shadow-sm h-[400px] group">
        <img 
          src={user.banner} 
          alt="Hero" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 p-8 w-full">
          <div className="flex items-center gap-4 mb-4">
             <img src={user.avatar} className="w-16 h-16 rounded-full border-2 border-white/50 shadow-lg" />
             <div>
                <h1 className="text-3xl font-black text-white tracking-tight">{user.name}</h1>
                <p className="text-gray-300 text-sm tracking-widest uppercase opacity-80">Project Archive</p>
             </div>
          </div>
          <p className="text-white/80 line-clamp-2 max-w-lg leading-relaxed">
            {user.bio}
          </p>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        

        <Link href={`/${username}/tweets`} className="group relative bg-white dark:bg-[#16181c] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl transition duration-300 overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition group-hover:scale-110 duration-500">
              <History size={100} />
           </div>
           <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-500 mb-4">
                 <History size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Twitter Archive</h3>
              <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                Browse the complete history of tweets.
              </p>
              <div className="flex items-center gap-2 text-sm font-bold text-blue-500 group-hover:gap-3 transition-all">
                Enter Archive <ArrowRight size={16} />
              </div>
           </div>
        </Link>


        <Link href={`/${username}/media`} className="group relative bg-white dark:bg-[#16181c] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl transition duration-300 overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition group-hover:scale-110 duration-500">
              <ImageIcon size={100} />
           </div>
           <div className="relative z-10">
              <div className="w-12 h-12 bg-pink-50 dark:bg-pink-900/20 rounded-2xl flex items-center justify-center text-pink-500 mb-4">
                 <ImageIcon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Media Gallery</h3>
              <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                A visual collection of photos and videos.
              </p>
              <div className="flex items-center gap-2 text-sm font-bold text-pink-500 group-hover:gap-3 transition-all">
                View Gallery <ArrowRight size={16} />
              </div>
           </div>
        </Link>

      </div>
      
      <div className="bg-[#008CD2] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
         <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
               <h3 className="font-bold text-lg flex items-center gap-2">
                  <Star className="fill-white" size={20} /> 
                  Special Project
               </h3>
               <p className="text-white/80 text-sm mt-1">Preserving digital memories for the future.</p>
            </div>
         </div>
      </div>

    </div>
  );
}