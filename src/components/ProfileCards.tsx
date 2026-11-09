import { ArrowUpRight, Calendar, Droplet, Ghost, GraduationCap, MapPin, Ruler } from "lucide-react";
import type { ArchiveUser, ProfileData } from "@/lib/api";

export function WikiBannerCard({ slug, name, className = "" }: { slug: string; name: string; className?: string }) {
  return (
    <a href={`https://227wiki.eu.org/member/${slug}/`} target="_blank" rel="noopener noreferrer"
      className={`flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm transition-colors hover:bg-muted ${className}`}>
      <span className="flex min-w-0 items-center gap-4">
        <img src="/images/wiki-logo.svg" alt="22/7 WiKi" className="h-10 w-auto shrink-0 object-contain dark:brightness-0 dark:invert" />
        <span className="text-lg font-bold">{name}</span>
      </span>
      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        在 22/7 WiKi 阅览<ArrowUpRight size={16} aria-hidden="true" />
      </span>
    </a>
  );
}

export function WikiBoxCard({ slug, name, className = "" }: { slug: string; name: string; className?: string }) {
  return (
    <a href={`https://227wiki.eu.org/member/${slug}/`} target="_blank" rel="noopener noreferrer"
      className={`flex min-w-0 flex-col items-start justify-between gap-6 rounded-3xl border border-border bg-card p-6 shadow-sm transition-colors hover:bg-muted ${className}`}>
      <img src="/images/wiki-logo.svg" alt="22/7 WiKi" className="h-10 w-auto object-contain dark:brightness-0 dark:invert" />
      <span className="text-lg font-bold">更多{name}的信息</span>
      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        在 22/7 WiKi 阅览<ArrowUpRight size={16} aria-hidden="true" />
      </span>
    </a>
  );
}

export function ProfileInfoCard({ profile, socialUser }: { profile: ProfileData; socialUser: ArchiveUser }) {
  const specs = [
    { label: "状态", value: profile.status, icon: GraduationCap },
    { label: "角色", value: profile.character, icon: Ghost },
    { label: "生日", value: profile.birthday, icon: Calendar },
    { label: "出生", value: profile.birthplace, icon: MapPin },
    { label: "血型", value: profile.blood_type, icon: Droplet },
    { label: "身高", value: profile.height, icon: Ruler },
  ];

  return (
    <div className="relative isolate flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm">
      {profile.assets.signature ? (
        <div className="pointer-events-none absolute -bottom-6 -right-6 -z-10 h-32 w-64 rotate-[-10deg] select-none opacity-10 grayscale mix-blend-multiply dark:opacity-20 dark:mix-blend-screen">
          <img src={profile.assets.signature} alt={`${profile.name}のサイン`} className="h-full w-full object-contain dark:invert" />
        </div>
      ) : null}
      <h1 className="text-4xl font-black tracking-tight">{profile.name}</h1>
      <p className="mt-3 break-all text-base text-muted-foreground">@{socialUser.screen_name}</p>
      <dl className="my-8 grid grid-cols-2 gap-x-4 gap-y-6">
        {specs.map((spec) => (
          <div key={spec.label} className="min-w-0">
            <dt className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <spec.icon size={16} aria-hidden="true" />{spec.label}
            </dt>
            <dd className="text-base font-bold">{spec.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-auto border-t border-border pt-6">
        <h2 className="mb-4 text-base font-bold">ひとこと</h2>
        <p className="whitespace-pre-wrap text-lg leading-relaxed">{profile.message}</p>
      </div>
    </div>
  );
}

export function ProfileImageCard({ profile, className = "" }: { profile: ProfileData; className?: string }) {
  const isHorizontal = profile.assets.type === "horizontal";
  if (!profile.assets.formula) return null;
  return (
    <div className={`relative w-full overflow-hidden rounded-3xl border border-border bg-muted shadow-sm ${className}`}>
      <img src={profile.assets.formula} alt={profile.name}
        className={`absolute inset-0 h-full w-full object-cover ${isHorizontal ? "object-center" : "object-top"}`} />
    </div>
  );
}
