import { getUserData, getProfile } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getMemberBySlug } from '@/lib/members';
import { ProfileImageCard, ProfileInfoCard, WikiBannerCard, WikiBoxCard } from '@/components/ProfileCards';
import { Instagram, BookOpen, ArrowUpRight } from 'lucide-react';
import XIcon from '@/components/icons/XIcon';

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const memberConfig = getMemberBySlug(slug);
  if (!memberConfig) return notFound();
  const profilePlatform = memberConfig.accounts.twitter ? 'twitter' : 'instagram';
  const [socialUser, profile] = await Promise.all([
    getUserData(slug, profilePlatform),
    getProfile(slug)
  ]);

  if (!socialUser || !profile) return notFound();

  const hasTwitter = Boolean(memberConfig.accounts.twitter);
  const hasInstagram = Boolean(memberConfig.accounts.instagram);
  const blogUrl = memberConfig.accounts.blog;
  const isHorizontal = profile.assets.type === 'horizontal';
  const hasPhoto = Boolean(profile.assets.formula);
  const socialCardCount = Number(hasTwitter) + Number(hasInstagram) + Number(Boolean(blogUrl));
  const socialColumns = socialCardCount === 3
    ? '@min-[440px]:grid-cols-2 @min-[600px]:grid-cols-3'
    : socialCardCount === 2 ? '@min-[440px]:grid-cols-2' : '';

  return (
    <div className="@container mx-auto mt-4 flex min-h-[calc(100vh-100px)] max-w-[1400px] flex-col gap-6 pb-10">
      <div className={`grid grid-cols-1 gap-6 ${!hasPhoto ? '' : isHorizontal ? '@min-[560px]:grid-cols-2' : '@min-[560px]:grid-cols-12'}`}>
        <div className={`min-w-0 ${isHorizontal || !hasPhoto ? '' : '@min-[560px]:col-span-7'}`}>
          <ProfileInfoCard profile={profile} socialUser={socialUser} />
        </div>
        {profile.assets.formula ? (
          <div className={`flex min-w-0 flex-col gap-6 ${isHorizontal ? '' : '@min-[560px]:col-span-5'}`}>
            <ProfileImageCard profile={profile} className={isHorizontal ? 'aspect-[3/2] shrink-0' : 'min-h-[500px] flex-1'} />
            {isHorizontal ? <WikiBoxCard slug={slug} name={profile.name} className="flex-1" /> : null}
          </div>
        ) : null}
      </div>
      {!isHorizontal || !hasPhoto ? (
        <WikiBannerCard slug={slug} name={profile.name} />
      ) : null}
      <div className={`grid grid-cols-1 gap-4 ${socialColumns}`}>
        {hasTwitter ? (
          <Link href={`/${slug}/tweets`} className="flex min-w-0 flex-col gap-6 rounded-3xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-social-twitter">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-social-twitter/10 text-social-twitter"><XIcon size={24} /></span>
            <h2 className="min-h-12 text-lg font-bold leading-6">X</h2>
            <span className="mt-auto inline-flex items-center gap-2 text-sm text-social-twitter">查看推文<ArrowUpRight size={16} aria-hidden="true" /></span>
          </Link>
        ) : null}
        {hasInstagram ? (
          <Link href={`/${slug}/instagram`} className="flex min-w-0 flex-col gap-6 rounded-3xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-social-instagram">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-social-instagram/10 text-social-instagram"><Instagram size={24} aria-hidden="true" /></span>
            <h2 className="min-h-12 text-lg font-bold leading-6">Instagram</h2>
            <span className="mt-auto inline-flex items-center gap-2 text-sm text-social-instagram">查看贴文<ArrowUpRight size={16} aria-hidden="true" /></span>
          </Link>
        ) : null}
        {blogUrl ? (
          <Link href={blogUrl} className="flex min-w-0 flex-col gap-6 rounded-3xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-social-blog">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-social-blog/10 text-social-blog"><BookOpen size={24} aria-hidden="true" /></span>
            <h2 className="min-h-12 text-lg font-bold leading-6">Blog</h2>
            <span className="mt-auto inline-flex items-center gap-2 text-sm text-social-blog">查看博客<ArrowUpRight size={16} aria-hidden="true" /></span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
