import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { animations3D } from "@/data/animations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function resolveAnimationFile(id: string): string {
  const key = decodeURIComponent(id).replace(/\.html$/i, "");
  const match = animations3D.find((animation: any) => {
    const slug = typeof animation?.slug === "string" ? animation.slug : "";
    const htmlFile = path.basename(String(animation?.htmlFile || animation?.previewSrc || ""));
    const base = htmlFile.replace(/\.html$/i, "");
    return animation?.id === key || slug === key || base === key;
  });

  if (match) {
    const fromCatalog = path.basename(String((match as any).htmlFile || (match as any).previewSrc || ""));
    if (fromCatalog) return fromCatalog;
  }

  const fallback = `${key}.html`;
  if (/^[a-zA-Z0-9._ -]+\.html$/.test(fallback)) return fallback;
  throw new Error("Invalid animation id");
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const file = resolveAnimationFile(id);
    const sourceDir = path.resolve(process.cwd(), "animations-source");
    const absolute = path.resolve(sourceDir, file);
    if (!absolute.startsWith(sourceDir + path.sep)) {
      return NextResponse.json({ error: "Invalid animation path" }, { status: 400 });
    }

    const html = await fs.readFile(absolute, "utf8");
    return new NextResponse(html, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300",
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      return NextResponse.json({ error: "Animation not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to serve preview animation" }, { status: 500 });
  }
}
