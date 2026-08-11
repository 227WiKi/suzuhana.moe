import { NextRequest, NextResponse } from "next/server";
import { getMemberBySlug } from "@/lib/members";
import { getMediaPage } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!getMemberBySlug(slug)) {
    return NextResponse.json({ error: "Archive not found" }, { status: 404 });
  }

  const offset = Number.parseInt(request.nextUrl.searchParams.get("offset") || "0", 10);
  const limit = Number.parseInt(request.nextUrl.searchParams.get("limit") || "15", 10);
  const page = await getMediaPage(
    slug,
    Number.isFinite(offset) ? offset : 0,
    Number.isFinite(limit) ? limit : 15,
  );

  return NextResponse.json(page, {
    headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
  });
}
