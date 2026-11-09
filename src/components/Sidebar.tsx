"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { Home, User, Instagram, MoreHorizontal } from "lucide-react";
import type { ArchiveUserSummary } from "@/lib/api";
import XIcon from "./icons/XIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface SidebarProps {
  username: string;
  user: ArchiveUserSummary;
  allUsers: ArchiveUserSummary[];
  className?: string;
  onNavigate?: () => void;
}

export default function Sidebar({ username, user, allUsers, className = "", onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const configMember = allUsers.find((member) => member.slug === username || member.accounts.twitter === username);
  const hasTwitter = Boolean(configMember?.accounts?.twitter);
  const hasInstagram = Boolean(configMember?.accounts?.instagram);
  const navItems: { name: string; path: string; isActive: boolean; icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string; "aria-hidden"?: boolean | "true" | "false" }> }[] = [
    { name: "Home", path: "/", isActive: pathname === "/", icon: Home },
    { name: "Profile", path: `/${username}`, isActive: pathname === `/${username}` || pathname === `/${username}/`, icon: User },
  ];
  if (hasTwitter) {
    navItems.push({ name: "X", path: `/${username}/tweets`, isActive: pathname.includes(`/${username}/tweets`) || pathname.includes(`/${username}/media`), icon: XIcon });
  }
  if (hasInstagram) {
    navItems.push({ name: "Instagram", path: `/${username}/instagram`, isActive: pathname.includes(`/${username}/instagram`), icon: Instagram });
  }

  return (
    <div className={`flex flex-col w-[260px] h-[calc(100vh-32px)] bg-card rounded-3xl border border-border shadow-sm ${className}`}>
      <div className="px-7 pt-8 pb-6 flex-shrink-0">
        <Link href="/" onClick={onNavigate} className="block group select-none">
          <h1 className="text-xl font-black leading-tight text-foreground group-hover:text-accent transition-colors duration-300">
            Project<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-start to-brand-end">Suzuhana Moe</span>
          </h1>
        </Link>
      </div>

      <nav className="flex-1 flex flex-col gap-2 overflow-y-auto px-4 min-h-0 custom-scrollbar">
        {navItems.map((item) => (
          <Link key={item.name} href={item.path} onClick={onNavigate} className="group outline-none relative">
            <div className={`relative flex items-center gap-4 px-4 py-4 rounded-xl text-base font-bold transition-all duration-200 ${item.isActive ? "bg-muted text-accent" : "text-muted-foreground hover:bg-muted dark:hover:bg-white/5"}`}>
              <item.icon size={16} aria-hidden="true" strokeWidth={item.isActive ? 2.5 : 2} className="transition-transform duration-200" />
              <span>{item.name}</span>
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-4 flex-shrink-0 relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted dark:hover:bg-white/5 transition-all outline-none">
              <img src={configMember?.avatar || user.avatar} className="w-10 h-10 rounded-full object-cover border border-border" alt="" />
              <span className="flex-1 min-w-0 text-left pl-1">
                <span className="block font-bold text-sm truncate">{configMember?.name || user.name}</span>
                <span className="block text-xs text-muted-foreground font-medium truncate">@{user.screen_name}</span>
              </span>
              <MoreHorizontal size={18} className="text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="center"
            sideOffset={8}
            className="w-[calc(var(--radix-dropdown-menu-trigger-width)+1rem)] min-w-0 origin-bottom rounded-2xl bg-card shadow-sm border border-border p-2 max-h-[240px] overflow-y-auto custom-scrollbar"
          >
            <DropdownMenuGroup>
              {allUsers.map((archiveUser) => (
                <DropdownMenuItem key={archiveUser.slug} asChild className="p-0 rounded-xl focus:bg-muted dark:focus:bg-white/5">
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
