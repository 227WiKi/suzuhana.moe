"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import type { ArchiveUser, ArchiveUserSummary } from "@/lib/api";
import Sidebar from "./Sidebar";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";

interface MobileNavProps {
  slug: string;
  user: ArchiveUser;
  allUsers: ArchiveUserSummary[];
}

export default function MobileNav({ slug, user, allUsers }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <div
        data-archive-sticky-header
        className="lg:hidden sticky top-0 z-40 w-full bg-white/80 dark:bg-[#16181c]/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 h-14 flex items-center justify-between"
      >
        <SheetTrigger asChild>
          <button className="relative group" aria-label="Open navigation">
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
            />
          </button>
        </SheetTrigger>
        <Link href="/" className="font-black text-lg tracking-tight text-gray-900 dark:text-white">
          {user.name}
        </Link>
        <div className="w-8" />
      </div>

      <SheetContent
        side="left"
        showCloseButton={false}
        className="lg:hidden w-[85vw] max-w-[300px] p-0 gap-0 border-none rounded-none bg-white dark:bg-[#16181c] text-gray-900 dark:text-white shadow-2xl"
      >
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500"
          aria-label="Close navigation"
        >
          <X size={24} />
        </button>
        <div className="h-full overflow-y-auto pt-2 flex flex-col">
          <Sidebar
            username={slug}
            user={user}
            allUsers={allUsers}
            onNavigate={() => setIsOpen(false)}
            className="!flex !static !w-full !min-h-full !ml-0 !shadow-none !border-none !bg-transparent !p-0"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
