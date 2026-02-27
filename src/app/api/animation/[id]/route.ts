import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { animations3D } from "@/data/animations";
import { getSupabaseAdminClient } from "@/lib/server/supabaseAdmin";
import { hasActiveSubscription } from "@/lib/server/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extractAccessToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length).trim();
    if (token) return token;
  }

  const explicitCookie = request.cookies.get("sb-access-token")?.value;
  if (explicitCookie) return explicitCookie;

  const authCookie = request.cookies
    .getAll()
    .find((cookie) => cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token"));

  if (!authCookie?.value) return null;

  const value = decodeURIComponent(authCookie.value);
  try {
    const parsed = JSON.parse(value);
    if (parsed?.access_token && typeof parsed.access_token === "string") return parsed.access_token;
    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (item?.access_token && typeof item.access_token === "string") return item.access_token;
      }
    }
  } catch {
    return null;
  }

  return null;
}

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
  if (/^[a-zA-Z0-9._-]+\.html$/.test(fallback)) return fallback;
  throw new Error("Invalid animation id");
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const token = extractAccessToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await hasActiveSubscription(data.user.id);
    if (!access) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
        "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
        pragma: "no-cache",
        expires: "0",
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      return NextResponse.json({ error: "Animation not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to serve animation" }, { status: 500 });
  }
}
