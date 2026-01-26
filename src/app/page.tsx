import Link from 'next/link';
import { getUsers } from '@/lib/api';
import { ArrowRight, Database, Users, Globe, History, GitCommit } from 'lucide-react';
import HomeEntry from '@/components/HomeEntry';

export default async function GlobalLandingPage() {
  const users = await getUsers();
  const buildVersion = process.env.NEXT_PUBLIC_COMMIT_SHA || 'DEV'; 

  return (
    <HomeEntry>
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-black text-gray-900 dark:text-white transition-colors duration-300 flex flex-col font-sans selection:bg-[#FFCCFF] selection:text-black">
      
      <nav className="w-full max-w-7xl mx-auto px-6 py-8 flex justify-between items-start">
        <div className="flex flex-col select-none">
           <h1 className="text-2xl font-black leading-[1.1] tracking-tight text-gray-900 dark:text-white">
             Project
             <br />
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF99CC] to-[#FFCCFF]">
               Suzuhana Moe
             </span>
           </h1>
           <div className="mt-2 flex items-center gap-2 opacity-60">
             <div className="h-px w-3 bg-gray-400 dark:bg-gray-600"></div>
             <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
               a part of 22/7 WiKi
             </span>
           </div>
        </div>

        <div className="hidden sm:flex items-center gap-6 text-sm font-bold text-gray-400">
          <a href="https://227wiki.eu.org" target="_blank" className="hover:text-[#FF99CC] transition-colors">
            Main Wiki
          </a>
          <span className="bg-gray-100 dark:bg-[#16181c] px-3 py-1 rounded-full text-xs font-mono flex items-center gap-2">
            <GitCommit size={12} />
            {buildVersion}
          </span>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 sm:py-16 flex flex-col">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-900/20 text-[#FF6699] text-xs font-bold uppercase tracking-wider mb-6">
              <Database size={14} />
              <span>Digital Archive System</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-black mb-8 leading-[1.1] tracking-tight">
              Preserving <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF99CC] to-[#FFCCFF]">
                Moments
              </span>
            </h1>
            
            <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg mb-8">
              A comprehensive read-only archive dedicated to storing tweets, media, and memories for Project Suzuhana Moe.
            </p>

            <div className="flex items-center gap-8 text-sm font-bold text-gray-400">
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-[#FF99CC]" />
                <span>Public Access</span>
              </div>
              <div className="flex items-center gap-2">
                <History size={18} className="text-[#FF99CC]" />
                <span>Permanent Storage</span>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:block relative">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF99CC]/20 rounded-full blur-3xl"></div>
          </div>
        </div>

        <div id="archives">
          <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="flex items-center gap-3 text-sm font-bold text-gray-400 uppercase tracking-widest">
              <Users size={16} />
              Archived Members
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <Link 
                key={user.slug} 
                href={`/${user.slug}`} 
                className="group relative flex flex-col"
              >
                <div className="bg-white dark:bg-[#16181c] rounded-[32px] p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-15px_rgba(255,153,204,0.15)] dark:group-hover:shadow-none h-full flex flex-col">
                  
                  <div className="flex items-start justify-between mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full p-1 bg-white dark:bg-[#16181c] border border-gray-100 dark:border-gray-800 shadow-sm">
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="w-full h-full rounded-full object-cover"
                          />
                      </div>
                      <div className="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-[3px] border-white dark:border-[#16181c]" title="Archived" />
                    </div>
                    
                    <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-[#FF99CC] group-hover:text-white transition-colors duration-300">
                       <ArrowRight size={20} />
                    </div>
                  </div>

                  <div className="mb-6 flex-1">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1 group-hover:text-[#FF99CC] transition-colors">
                      {user.name}
                    </h3>
                    <p className="text-sm font-bold text-gray-400 mb-4">@{user.screen_name}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">
                      {user.bio || "No biography available for this archive."}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-gray-50 dark:border-gray-800/50 flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[]"></div>
                        Tweets
                      </span>

                  </div>

                </div>
              </Link>
            ))}
          </div>
        </div>

      </main>

      <footer className="w-full border-t border-gray-100 dark:border-gray-800 mt-12 bg-white dark:bg-[#16181c]">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
          
          <div className="text-center md:text-left">
            <h4 className="text-base font-black text-gray-900 dark:text-white leading-none">
              Project Suzuhana Moe
            </h4>
            
            <div className="mt-2.5 flex items-center justify-center md:justify-start gap-2 opacity-60">
                <div className="h-px w-3 bg-gray-400 dark:bg-gray-600"></div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  a part of 22/7 WiKi
                </span>
            </div>

            <p className="text-xs text-gray-400 mt-4 font-medium flex items-center gap-2 justify-center md:justify-start">
              <span>&copy; {new Date().getFullYear()} 22/7 WiKi. All rights reserved.</span>
              <span className="hidden sm:inline text-gray-300">•</span>
              <span className="font-mono opacity-50">Build {buildVersion}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-8">
             <Link href="https://227wiki.eu.org" target="_blank" className="text-sm font-bold text-gray-500 hover:text-[#FF99CC] transition-colors">
               22/7 WiKi
             </Link>
             <Link href="https://github.com/227WiKi/suzuhana.moe" target="_blank" className="text-sm font-bold text-gray-500 hover:text-[#FF99CC] transition-colors">
               GitHub
             </Link>
          </div>
        </div>
      </footer>
    </div>
    </HomeEntry>
  );
}