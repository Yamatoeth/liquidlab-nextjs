#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const { register } = require("esbuild-register/dist/node");

const repoRoot = path.resolve(__dirname, "..");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function loadLocalEnv() {
  loadEnvFile(path.join(repoRoot, ".env"));
  loadEnvFile(path.join(repoRoot, ".env.local"));
}

function isUuid(value) {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function coerceArray(value) {
  return Array.isArray(value) ? value : [];
}

function coerceDate(value) {
  if (typeof value !== "string" || !value) return new Date().toISOString();
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return new Date().toISOString();
  return date.toISOString();
}

function toDbRow(animation) {
  const row = {
    slug: String(animation.slug || "").trim(),
    title: String(animation.title || "").trim(),
    description: animation.description ? String(animation.description) : null,
    short_description: animation.shortDescription ? String(animation.shortDescription) : null,
    renderer: animation.renderer || "custom",
    preview_type: animation.previewType || "iframe",
    preview_src: animation.previewSrc || null,
    html_file: animation.htmlFile || null,
    animation_type_id: isUuid(animation.animationTypeId) ? animation.animationTypeId : null,
    tags: coerceArray(animation.tags),
    performance_tier: animation.performanceTier || null,
    color_palette: coerceArray(animation.colorPalette),
    compatible_backgrounds: coerceArray(animation.compatibleBackgrounds),
    dependencies: coerceArray(animation.dependencies),
    params_schema: coerceArray(animation.paramsSchema),
    duration_ms: typeof animation.durationMs === "number" ? animation.durationMs : null,
    price: typeof animation.price === "number" ? animation.price : Number(animation.price || 0),
    is_free: !!animation.isFree,
    features: coerceArray(animation.features),
    preview_image_url: animation.previewImageUrl || null,
    preview_video_url: animation.previewVideoUrl || null,
    screenshots: coerceArray(animation.screenshots),
    is_published: typeof animation.isPublished === "boolean" ? animation.isPublished : false,
    is_featured: typeof animation.isFeatured === "boolean" ? animation.isFeatured : false,
    sort_order: typeof animation.sortOrder === "number" ? animation.sortOrder : 0,
    created_at: coerceDate(animation.createdAt),
    updated_at: coerceDate(animation.updatedAt),
  };

  if (!row.slug || !row.title) return null;
  return row;
}

async function run() {
  const dryRun = process.argv.includes("--dry-run");
  const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : null;

  loadLocalEnv();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.");
  }

  register({ extensions: [".ts", ".tsx"] });
  const { animations3D } = require(path.join(repoRoot, "src/data/animations.ts"));
  if (!Array.isArray(animations3D)) throw new Error("Unable to load animations from src/data/animations.ts");

  const source = limit && Number.isFinite(limit) ? animations3D.slice(0, limit) : animations3D;
  const rows = source.map(toDbRow).filter(Boolean);
  if (rows.length === 0) {
    console.log("No valid animations to seed.");
    return;
  }

  const uniqueBySlug = new Map();
  for (const row of rows) uniqueBySlug.set(row.slug, row);
  const payload = Array.from(uniqueBySlug.values());

  console.log(`Animations loaded: ${animations3D.length}`);
  console.log(`Rows prepared: ${payload.length}${dryRun ? " (dry-run)" : ""}`);

  if (dryRun) {
    console.log("First row preview:");
    console.log(JSON.stringify(payload[0], null, 2));
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const batchSize = 200;
  let processed = 0;
  for (let i = 0; i < payload.length; i += batchSize) {
    const batch = payload.slice(i, i + batchSize);
    const { error } = await supabase
      .from("animations")
      .upsert(batch, { onConflict: "slug", ignoreDuplicates: false });
    if (error) {
      throw new Error(`Batch ${Math.floor(i / batchSize) + 1} failed: ${error.message}`);
    }
    processed += batch.length;
    console.log(`Upserted ${processed}/${payload.length}`);
  }

  console.log("Seed complete.");
}

run().catch((error) => {
  console.error("[seed-animations-supabase] Failed:", error.message || error);
  process.exit(1);
});
