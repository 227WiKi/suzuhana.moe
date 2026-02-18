"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Twitter, Instagram, MoreHorizontal, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MEMBERS } from '@/lib/members';

interface SidebarProps {
  username: string;
  user: any; 
  allUsers: any[]; 
  className?: string;
}

export default function Sidebar({ username, user, allUsers, className = "" }: SidebarProps) {
  const pathname = usePathname();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  const configMember = MEMBERS.find(m => m.slug === username || m.accounts.twitter === username);
  const hasInstagram = Boolean(configMember?.accounts?.instagram);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsSwitcherOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { name: 'Home', path: '/', isActive: pathname === '/', icon: Home },
    { name: 'Profile', path: `/${username}`, isActive: pathname === `/${username}` || pathname === `/${username}/`, icon: User },
    { name: 'Twitter', path: `/${username}/tweets`, isActive: pathname.includes(`/${username}/tweets`) || pathname.includes(`/${username}/media`), icon: Twitter },
  ];
  if (hasInstagram) {
    navItems.push({ name: 'Instagram', path: `/${username}/instagram`, isActive: pathname.includes(`/${username}/instagram`), icon: Instagram });
  }

  return (
    <div 
      className={`
        flex flex-col w-[260px] h-[calc(100vh-24px)] 
        bg-white dark:bg-[#16181c] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm
        ${className}
      `}
    >
      <div className="px-7 pt-8 pb-6 flex-shrink-0">
        <Link href="/" className="block group select-none">
           <h1 className="text-[20px] font-black leading-tight text-gray-900 dark:text-white group-hover:text-[#008CD2] transition-colors duration-300">
             Project<br />
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF99CC] to-[#FFCCFF]">
                Suzuhana Moe
             </span>
           </h1>
           <div className="mt-2.5 flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity duration-300">
             <div className="h-px w-3 bg-gray-400 dark:bg-gray-500"></div>
             <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
               a part of 22/7 WiKi
             </span>
           </div>
        </Link>
      </div>

      <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto px-4 min-h-0 custom-scrollbar">
        {navItems.map((item) => (
          <Link key={item.name} href={item.path} className="group outline-none relative">
            <div className={`
              relative flex items-center gap-4 px-4 py-3.5 rounded-xl text-[16px] font-bold transition-all duration-200
              ${item.isActive ? 'bg-[#008CD2]/5 text-[#008CD2]' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}
            `}>
              <item.icon size={22} strokeWidth={item.isActive ? 2.5 : 2} className="transition-transform duration-200" />
              <span>{item.name}</span>
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-4 flex-shrink-0 relative" ref={switcherRef}>
        <AnimatePresence>
          {isSwitcherOpen && (
             <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
               className="absolute bottom-full left-2 right-2 mb-2 bg-white dark:bg-[#000] rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-2 z-[999] origin-bottom"
             >
                <div className="flex flex-col gap-1 max-h-[240px] overflow-y-auto custom-scrollbar">
                  {allUsers.map((u: any) => (
                    <Link key={u.screen_name} href={`/${MEMBERS.find(m => m.accounts.twitter === u.screen_name)?.slug || u.screen_name}`} onClick={() => setIsSwitcherOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-xl transition hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      <img src={u.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                      <div className="font-bold text-xs truncate">{u.name}</div>
                    </Link>
                  ))}
                </div>
             </motion.div>
          )}
        </AnimatePresence>

        <button onClick={() => setIsSwitcherOpen(!isSwitcherOpen)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
           <img src={configMember?.avatar || user.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-100" alt="" />
           <div className="flex-1 min-w-0 text-left pl-1">
             <div className="font-bold text-sm truncate">{configMember?.name || user.name}</div>
             <div className="text-[11px] text-gray-400 font-medium truncate">@{username}</div>
           </div>
           <MoreHorizontal size={18} className="text-gray-300" />
        </button>
      </div>
    </div>
  );
}