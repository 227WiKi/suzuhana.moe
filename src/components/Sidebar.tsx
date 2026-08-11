"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Twitter, Instagram, MoreHorizontal } from "lucide-react";
import type { ArchiveUser, ArchiveUserSummary } from "@/lib/api";
import { MEMBERS } from "@/lib/members";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface SidebarProps {
  username: string;
  user: ArchiveUser;
  allUsers: ArchiveUserSummary[];
  className?: string;
  onNavigate?: () => void;
}

export default function Sidebar({ username, user, allUsers, className = "", onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const configMember = MEMBERS.find((member) => member.slug === username || member.accounts.twitter === username);
  const hasInstagram = Boolean(configMember?.accounts?.instagram);
  const navItems = [
    { name: "Home", path: "/", isActive: pathname === "/", icon: Home },
    { name: "Profile", path: `/${username}`, isActive: pathname === `/${username}` || pathname === `/${username}/`, icon: User },
    { name: "Twitter", path: `/${username}/tweets`, isActive: pathname.includes(`/${username}/tweets`) || pathname.includes(`/${username}/media`), icon: Twitter },
  ];
  if (hasInstagram) {
    navItems.push({ name: "Instagram", path: `/${username}/instagram`, isActive: pathname.includes(`/${username}/instagram`), icon: Instagram });
  }

  return (
    <div className={`flex flex-col w-[260px] h-[calc(100vh-24px)] bg-white dark:bg-[#16181c] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm ${className}`}>
      <div className="px-7 pt-8 pb-6 flex-shrink-0">
        <Link href="/" onClick={onNavigate} className="block group select-none">
          <h1 className="text-[20px] font-black leading-tight text-gray-900 dark:text-white group-hover:text-[#008CD2] transition-colors duration-300">
            Project<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF99CC] to-[#FFCCFF]">Suzuhana Moe</span>
          </h1>
          <div className="mt-2.5 flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity duration-300">
            <div className="h-px w-3 bg-gray-400 dark:bg-gray-500" />
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">a part of 22/7 WiKi</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto px-4 min-h-0 custom-scrollbar">
        {navItems.map((item) => (
          <Link key={item.name} href={item.path} onClick={onNavigate} className="group outline-none relative">
            <div className={`relative flex items-center gap-4 px-4 py-3.5 rounded-xl text-[16px] font-bold transition-all duration-200 ${item.isActive ? "bg-[#008CD2]/5 text-[#008CD2]" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"}`}>
              <item.icon size={22} strokeWidth={item.isActive ? 2.5 : 2} className="transition-transform duration-200" />
              <span>{item.name}</span>
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-4 flex-shrink-0 relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all outline-none">
              <img src={configMember?.avatar || user.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-100" alt="" />
              <span className="flex-1 min-w-0 text-left pl-1">
                <span className="block font-bold text-sm truncate">{configMember?.name || user.name}</span>
                <span className="block text-[11px] text-gray-400 font-medium truncate">@{username}</span>
              </span>
              <MoreHorizontal size={18} className="text-gray-300" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="center"
            sideOffset={8}
            className="w-[calc(var(--radix-dropdown-menu-trigger-width)+1rem)] min-w-0 origin-bottom rounded-2xl bg-white dark:bg-black shadow-lg border border-gray-100 dark:border-gray-800 p-2 max-h-[240px] overflow-y-auto custom-scrollbar"
          >
            <DropdownMenuGroup>
              {allUsers.map((archiveUser) => (
                <DropdownMenuItem key={archiveUser.slug} asChild className="p-0 rounded-xl focus:bg-gray-50 dark:focus:bg-white/5">
                  <Link href={`/${archiveUser.slug}`} onClick={onNavigate} className="flex items-center gap-3 p-2 w-full outline-none">
                    <img src={archiveUser.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                    <span className="font-bold text-xs truncate">{archiveUser.name}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
