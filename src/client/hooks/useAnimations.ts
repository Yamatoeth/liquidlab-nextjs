import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Animation, ParamDescriptor } from "@/types/animation3d";

type SupabaseAnimationRow = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  short_description?: string;
  renderer: "threejs" | "gsap" | "css" | "webgl" | "custom";
  preview_type: "iframe" | "video" | "gif";
  preview_src?: string;
  html_file?: string;
  animation_type_id?: string;
  tags?: string[];
  performance_tier?: "lightweight" | "moderate" | "heavy";
  color_palette?: string[];
  compatible_backgrounds?: Array<"dark" | "light" | "transparent">;
  dependencies?: string[];
  params_schema?: ParamDescriptor[];
  duration_ms?: number;
  price?: number;
  is_free?: boolean;
  features?: string[];
  preview_image_url?: string;
  preview_video_url?: string;
  screenshots?: string[];
  is_published: boolean;
  is_featured: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
};

function mapDbAnimation(row: SupabaseAnimationRow): Animation {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    shortDescription: row.short_description,
    renderer: row.renderer,
    previewType: row.preview_type,
    previewSrc: row.preview_src,
    htmlFile: row.html_file,
    animationTypeId: row.animation_type_id,
    tags: row.tags ?? [],
    performanceTier: row.performance_tier,
    colorPalette: row.color_palette ?? [],
    compatibleBackgrounds: row.compatible_backgrounds ?? [],
    dependencies: row.dependencies ?? [],
    paramsSchema: row.params_schema ?? [],
    durationMs: row.duration_ms,
    price: Number(row.price ?? 0),
    isFree: !!row.is_free,
    features: row.features ?? [],
    previewImageUrl: row.preview_image_url,
    previewVideoUrl: row.preview_video_url,
    screenshots: row.screenshots ?? [],
    isPublished: row.is_published,
    isFeatured: row.is_featured,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useAnimations({ search = "", typeId = undefined }: { search?: string; typeId?: string } = {}) {
  const [animations, setAnimations] = useState<Animation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let query = supabase
      .from("animations")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (typeId) query = query.eq("animation_type_id", typeId);
    if (search) query = query.ilike("title", `%${search}%`);
    query
      .then((res: any) => {
        const { data, error, status } = res || {};
        if (error) {
          // Handle unauthorized separately so UI can fallback to local data
          if (status === 401 || (error && (error.status === 401 || /401/.test(String(error.message || error))))) {
            setError(new Error("Unauthorized (401) when fetching remote animations"));
            setAnimations([]);
          } else {
            setError(error instanceof Error ? error : new Error(String(error)));
          }
        } else {
          setAnimations(Array.isArray(data) ? data.map((row) => mapDbAnimation(row as SupabaseAnimationRow)) : []);
        }
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e : new Error(String(e)));
        setAnimations([]);
        setLoading(false);
      });
  }, [search, typeId]);

  return { animations, loading, error };
}
