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
      .then(({ data, error }) => {
        if (error) setError(error);
        else setAnimations(data || []);
        setLoading(false);
      });
  }, [search, typeId]);

  return { animations, loading, error };
}
