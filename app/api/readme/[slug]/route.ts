import { NextResponse } from "next/server";
import { getReadme } from "@/lib/readme";
import { projects } from "@/data/projects";

/** Only configured project slugs are fetchable, so there is no arbitrary repo proxying. */
const allowed = new Set(projects.map((p) => p.slug));

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!allowed.has(slug)) {
    return NextResponse.json({ status: "error", message: "Unknown project." }, { status: 404 });
  }

  const result = await getReadme(slug);
  const status = result.status === "error" ? 502 : 200;

  return NextResponse.json(result, {
    status,
    headers: { "Cache-Control": "public, max-age=0, s-maxage=3600" },
  });
}
