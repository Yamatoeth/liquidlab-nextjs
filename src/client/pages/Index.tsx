"use client";
import { useState, useMemo } from "react";
import { snippets } from "@/data/snippets";
import { animations3D } from "../../data/animations";
import Hero from "@/components/Hero";
import CategoryFilter from "@/components/CategoryFilter";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Sparkles } from "lucide-react";
import { Link } from "@App/useRouter";
import { useAnimations } from "@/hooks/useAnimations";
import type { Animation3D } from "@/types/animation3d";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["All"]);

  const filteredSnippets = useMemo(() => {
    return snippets.filter((snippet) => {
      const matchesSearch =
        searchQuery === "" ||
        snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snippet.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategories.includes('All') || selectedCategories.includes(snippet.category);

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategories]);

  // suggestions are provided by Supabase-backed autocomplete in the Hero component
  const suggestions: string[] = []

  // Animations dynamiques depuis Supabase
  const { animations, loading, error } = useAnimations({ search: searchQuery });

  // Map SupabaseAnimation to Animation3D type for ProductCard
  const mapSupabaseToAnimation3D = (anim): Animation3D => ({
    id: anim.id,
    title: anim.title,
    description: anim.description || anim.short_description || '',
    renderer: ((): 'custom' | 'threejs' | 'gsap' | 'css' | 'webgl' => {
      // Optionally, you could infer from tags or type
      if (Array.isArray(anim.tags)) {
        if (anim.tags.includes('three') || anim.tags.includes('threejs')) return 'threejs';
        if (anim.tags.includes('gsap')) return 'gsap';
        if (anim.tags.includes('css')) return 'css';
        if (anim.tags.includes('webgl')) return 'webgl';
      }
      return 'custom';
    })(),
    previewType: anim.preview_video_url
      ? 'video'
      : anim.preview_image_url
      ? 'gif'
      : 'iframe',
    previewSrc: anim.preview_video_url || anim.preview_image_url || `/animations/${anim.slug || anim.id}.html`,
    htmlFile: `/animations/${anim.slug || anim.id}.html`,
    tags: anim.tags || [],
    dependencies: anim.tags || [],
    difficulty: anim.complexity === 'complex' ? 'advanced' : anim.complexity === 'moderate' ? 'intermediate' : 'beginner',
    performanceScore: anim.performance_tier === 'heavy' ? 5 : anim.performance_tier === 'standard' ? 3 : 1,
    price: 0,
    features: [],
    images: anim.screenshots || [],
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <Hero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectSuggestion={(v) => setSearchQuery(v)}
      />


      {/* Animations 3D Grid */}
      <main className="flex-1">
        <div className="container py-12">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold">3D Animations</h2>
              <p className="text-sm text-muted-foreground">
                {loading ? "Loading..." : `${animations.length} animation${animations.length !== 1 ? "s" : ""} available`}
              </p>
            </div>
            {/* Optionnel : CategoryFilter pour animations 3D */}
          </div>
          {loading ? (
            <div className="py-20 text-center text-muted-foreground">Loading animations…</div>
          ) : error || !Array.isArray(animations) || animations.length === 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {animations3D.map((anim) => (
                <ProductCard key={anim.id} snippet={anim} type="animation3d" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {animations.map((anim) => (
                <ProductCard key={anim.id} snippet={mapSupabaseToAnimation3D(anim)} type="animation3d" />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
