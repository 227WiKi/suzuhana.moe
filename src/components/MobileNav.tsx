"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import type { ArchiveUserSummary } from "@/lib/api";
import Sidebar from "./Sidebar";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";

interface MobileNavProps {
  slug: string;
  user: ArchiveUserSummary;
  allUsers: ArchiveUserSummary[];
}

export default function MobileNav({ slug, user, allUsers }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <div
        data-archive-sticky-header
        className="lg:hidden sticky top-0 z-40 w-full bg-card/80 backdrop-blur-md border-b border-border px-4 h-14 flex items-center justify-between"
      >
        <SheetTrigger asChild>
          <button className="icon-control relative group" aria-label="Open navigation">
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover border border-border"
            />
          </button>
        </SheetTrigger>
        <Link href="/" className="font-black text-lg tracking-tight text-foreground">
          {user.name}
        </Link>
        <div className="w-8" />
      </div>

      <SheetContent
        side="left"
        showCloseButton={false}
        className="lg:hidden w-[85vw] max-w-[300px] p-0 gap-0 border-none rounded-none bg-card text-foreground shadow-sm"
      >
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <button
          onClick={() => setIsOpen(false)}
          className="icon-control absolute top-4 right-4 p-2 rounded-full hover:bg-muted dark:hover:bg-white/10 text-muted-foreground"
          aria-label="Close navigation"
        >
          <X size={16} aria-hidden="true" />
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
