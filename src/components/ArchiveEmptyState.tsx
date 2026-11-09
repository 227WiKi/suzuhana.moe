import Link from "next/link";

export default function ArchiveEmptyState({ message, href, label }: {
  message: string;
  href: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm">
      <p className="text-muted-foreground">{message}</p>
      <Link href={href} className="mt-4 inline-flex min-h-11 items-center rounded-lg px-4 font-bold text-accent hover:underline">
        {label}
      </Link>
    </div>
  );
}
