import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface SupabaseAnimation {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  animation_type_id?: string;
  params_schema: any[];
  presets: any[];
  runtime_bundle_url?: string;
  preview_video_url?: string;
  preview_image_url?: string;
  tags?: string[];
  complexity?: string;
  performance_tier?: string;
  is_published: boolean;
  is_featured: boolean;
}

export function useAnimations({ search = "", typeId = undefined }: { search?: string; typeId?: string } = {}) {
  const [animations, setAnimations] = useState<SupabaseAnimation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let query = supabase
      .from("animations")
      .select("*")
      .eq("is_published", true);
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
          setAnimations(data || []);
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
