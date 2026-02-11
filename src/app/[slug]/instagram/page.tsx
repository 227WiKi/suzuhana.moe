import { getInstagramPosts, getUserData } from "@/lib/api";
import { notFound } from "next/navigation";
import InstagramGrid from "@/components/InstagramGrid";
import { Grid } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>; 
}

export default async function InstagramPage({ params }: PageProps) {
  const resolvedParams = await params;
  const username = resolvedParams.slug;

  if (!username) {
    console.error("Can't get slug from router");
    return notFound();
  }

  const [userData, posts] = await Promise.all([
    getUserData(username, 'instagram'),
    getInstagramPosts(username)
  ]);

  if (!userData) {
    console.warn(`Can't find user data: ${username}`);
    return notFound();
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 px-4 py-4 mb-2 border-b border-gray-100 dark:border-gray-800">
         <Grid size={18} className="text-gray-900 dark:text-white" />
         <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
            {posts.length} Posts
         </h2>
      </div>

      <InstagramGrid posts={posts} />
    </div>
  );
}