"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Twitter, Instagram, MoreHorizontal, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  username: string;
  user: any;
  allUsers: any[];
}

export default function Sidebar({ username, user, allUsers }: SidebarProps) {
  const pathname = usePathname();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  
  const placeholderRef = useRef<HTMLDivElement>(null);
  const switcherRef = useRef<HTMLDivElement>(null);
  const [sidebarLeft, setSidebarLeft] = useState<number | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      if (placeholderRef.current) {
        const rect = placeholderRef.current.getBoundingClientRect();
        setSidebarLeft(rect.left);
      }
    };

    updatePosition();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsSwitcherOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [switcherRef]);

  const navItems = [
    { name: 'Home', path: '/', isActive: pathname === '/', icon: Home },
    { name: 'Profile', path: `/${username}`, isActive: pathname === `/${username}` || pathname === `/${username}/`, icon: User },
    { name: 'Twitter', path: `/${username}/tweets`, isActive: pathname.includes(`/${username}/tweets`) || pathname.includes(`/${username}/media`), icon: Twitter },
    { name: 'Instagram', path: `/${username}/instagram`, isActive: pathname.includes(`/${username}/instagram`), icon: Instagram },
  ];

  return (
    <>
      <div 
        ref={placeholderRef} 
        className="hidden lg:block w-[260px] h-[calc(100vh-24px)] ml-3 flex-shrink-0 opacity-0 pointer-events-none" 
        aria-hidden="true"
      />

      <aside 
        style={{ left: sidebarLeft !== null ? `${sidebarLeft}px` : undefined }}
        className={`
          hidden lg:flex flex-col w-[260px] h-[calc(100vh-24px)] 
          fixed top-3 
          bg-white dark:bg-[#16181c] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-none z-50
          transition-opacity duration-150
          ${sidebarLeft === null ? 'opacity-0' : 'opacity-100'}
        `}
      >
        
        <div className="px-7 pt-8 pb-6 flex-shrink-0">
          <Link href="/" className="block group select-none">
             <h1 className="text-[20px] font-black leading-tight text-gray-900 dark:text-white group-hover:text-[#008CD2] transition-colors duration-300">
               Suzuhana Moe
               <br />
               <span className="text-[#008CD2]">Project</span>
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
            <Link 
              key={item.name} 
              href={item.path}
              className="group outline-none relative"
            >
              <div className={`
                relative flex items-center gap-4 px-4 py-3.5 rounded-xl text-[16px] font-bold transition-all duration-200
                ${item.isActive 
                  ? 'bg-[#008CD2]/5 text-[#008CD2]' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white' 
                }
              `}>
                <item.icon 
                  size={22} 
                  strokeWidth={item.isActive ? 2.5 : 2} 
                  className={`transition-transform duration-200 ${item.isActive ? "scale-105" : "group-hover:scale-105"}`}
                />
                <span>{item.name}</span>
              </div>
            </Link>
          ))}
        </nav>


        <div className="p-4 flex-shrink-0 relative" ref={switcherRef}>
          <AnimatePresence>
            {isSwitcherOpen && (
               <motion.div 
                 initial={{ opacity: 0, y: 10, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: 10, scale: 0.95 }}
                 transition={{ duration: 0.2, type: "spring", stiffness: 350, damping: 25 }}
                 className="absolute bottom-full left-2 right-2 mb-2 bg-white dark:bg-[#000] rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-2 z-[999] origin-bottom"
               >
                  <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-gray-800 mb-1">
                    Switch Account
                  </div>
                  <div className="flex flex-col gap-1 max-h-[240px] overflow-y-auto custom-scrollbar">
                    {allUsers.map((u) => (
                      <Link
                        key={u.screen_name}
                        href={`/${u.screen_name}`}
                        onClick={() => setIsSwitcherOpen(false)}
                        className={`flex items-center gap-3 p-2 rounded-xl transition cursor-pointer ${
                            u.screen_name === username 
                            ? "bg-[#008CD2]/5 dark:bg-[#008CD2]/10" 
                            : "hover:bg-gray-50 dark:hover:bg-white/5"
                        }`}
                      >
                        <img src={u.avatar} className="w-8 h-8 rounded-full object-cover" />
                        <div className="flex-1 min-w-0 text-left">
                            <div className={`font-bold text-xs truncate ${u.screen_name === username ? "text-[#008CD2]" : "text-gray-900 dark:text-white"}`}>
                              {u.name}
                            </div>
                        </div>
                        {u.screen_name === username && <Check size={14} className="text-[#008CD2]" />}
                      </Link>
                    ))}
                  </div>
               </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
            className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200 group outline-none
              ${isSwitcherOpen 
                 ? "bg-gray-50 dark:bg-white/5" 
                 : "hover:bg-gray-50 dark:hover:bg-white/5"
              }
            `}
          >
             <img src={user.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-[#2f3336]" />
             <div className="flex-1 min-w-0 text-left pl-1">
               <div className="font-bold text-sm truncate text-gray-900 dark:text-white">
                  {user.name}
               </div>
               <div className="text-[11px] text-gray-400 font-medium truncate">
                  @{username}
               </div>
             </div>
             <MoreHorizontal size={18} className="text-gray-300 group-hover:text-gray-500 transition" />
          </button>
        </div>
      </aside>
    </>
  );
}