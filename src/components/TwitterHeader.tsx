"use client";

import RichText from '@/components/RichText';
import ProfileTabs from '@/components/ProfileTabs';
import { useRef, useState, useEffect } from 'react';

interface TwitterHeaderProps {
  user: any;
  uniqueTweetsCount: number;
  username: string;
}

export default function TwitterHeader({ user, uniqueTweetsCount, username }: TwitterHeaderProps) {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [headerStyle, setHeaderStyle] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      if (placeholderRef.current) {
        const rect = placeholderRef.current.getBoundingClientRect();
        setHeaderStyle({
          left: rect.left,
          width: rect.width,
        });
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

  return (
    <>
      <div 
        ref={placeholderRef} 
        className="mt-3 mb-4 px-4 py-3 border border-transparent opacity-0 pointer-events-none select-none"
        aria-hidden="true"
      >
        <h1 className="text-xl font-bold leading-none">{user.name}</h1>
        <p className="text-xs text-gray-500 mt-1">{uniqueTweetsCount} posts</p>
      </div>

      <div 
        className={`
          fixed top-3 z-40 
          bg-white/90 dark:bg-[#16181c]/90 backdrop-blur-md 
          px-4 py-3 rounded-xl shadow-sm border border-white/20 
          transition-opacity duration-150
          ${headerStyle ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          left: headerStyle?.left,
          width: headerStyle?.width,
        }}
      >
        <h1 className="text-xl font-bold leading-none">{user.name}</h1>
        <p className="text-xs text-gray-500 mt-1">{uniqueTweetsCount} posts</p>
      </div>

      <div className="bg-white dark:bg-[#16181c] rounded-2xl overflow-hidden shadow-sm mb-4 border border-gray-100 dark:border-gray-800">
          <div className="relative">
            <div className="h-32 sm:h-48 bg-gray-200 dark:bg-gray-800 overflow-hidden">
                {user.banner && <img src={user.banner} alt="banner" className="w-full h-full object-cover" />}
            </div>
            <div className="absolute -bottom-12 left-4">
                <img src={user.avatar} className="w-24 h-24 rounded-full border-4 border-white dark:border-[#16181c] object-cover bg-white dark:bg-black" />
            </div>
          </div>
          
          <div className="mt-14 px-5 pb-5">
            <h2 className="text-xl font-bold">{user.name}</h2>
            <div className="text-gray-500 text-sm">@{user.screen_name}</div>
            <div className="mt-3 whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200 text-[15px]">
              <RichText text={user.bio} />
            </div>
          </div>

          <ProfileTabs username={username} />
      </div>
    </>
  );
}