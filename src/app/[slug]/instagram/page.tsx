import { getInstagramPosts, getUserData } from "@/lib/api";
import { notFound } from "next/navigation";
import InstagramGrid from "@/components/InstagramGrid";
import InstagramProfile from "@/components/InstagramProfile";
import { Grid } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>; 
}

export default async function InstagramPage({ params }: PageProps) {
  const { slug } = await params;

  const [userData, posts] = await Promise.all([
    getUserData(slug, 'instagram'),
    getInstagramPosts(slug)
  ]);

  if (!userData) return notFound();

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4">
      <InstagramProfile userData={userData} />

      <div className="flex items-center gap-2 px-2 py-4 mb-4 border-b border-gray-100 dark:border-zinc-800">
         <Grid size={18} className="text-gray-900 dark:text-white" />
         <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
            {posts.length} Posts
         </h2>
      </div>

      <InstagramGrid posts={posts} userData={userData} />
    </div>
  );
}