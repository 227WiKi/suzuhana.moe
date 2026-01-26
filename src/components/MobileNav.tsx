"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Sidebar from "./Sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileNavProps {
  slug: string;
  user: any;
  allUsers: any[];
}

export default function MobileNav({ slug, user, allUsers }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  return (
    <>
      <div className="lg:hidden sticky top-0 z-40 w-full bg-white/80 dark:bg-[#16181c]/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 h-14 flex items-center justify-between">
        <button onClick={() => setIsOpen(true)} className="relative group">
          <img 
            src={user.avatar} 
            alt="Avatar" 
            className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700" 
          />
        </button>
        <Link href="/" className="font-black text-lg tracking-tight text-gray-900 dark:text-white">
            {user.name}
        </Link>
        <div className="w-8" />
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`
        fixed top-0 left-0 bottom-0 z-[70] w-[85vw] max-w-[300px] bg-white dark:bg-[#16181c] shadow-2xl 
        transform transition-transform duration-300 ease-in-out lg:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full relative">
          
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 z-[80]"
          >
            <X size={24} />
          </button>


          <div className="h-full overflow-y-auto pt-2 flex flex-col">
             <Sidebar 
                username={slug} 
                user={user} 
                allUsers={allUsers} 
                className="!flex !static !w-full !min-h-full !ml-0 !shadow-none !border-none !bg-transparent !p-0"
             />
          </div>
        </div>
      </div>
    </>
  );
}