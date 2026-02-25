"use client";
import { useState, useMemo } from "react";
import { animations3D } from "../../data/animations";
import Hero from "@/components/Hero";
import CategoryFilter from "@/components/CategoryFilter";
import ProductCard from "@/components/ProductCard";
import DisplayModeToggle from "@/components/DisplayModeToggle";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Layers, Rocket, SlidersHorizontal } from "lucide-react";
import { useAnimations } from "@/hooks/useAnimations";
import type { Animation3D } from "@/types/animation3d";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["All"]);

  const { animations, loading, error } = useAnimations({ search: searchQuery });
  const [displayMode, setDisplayMode] = useState<"list" | "grid3" | "grid6">("grid3");

  const mapSupabaseToAnimation3D = (anim): Animation3D => ({
    id: anim.id,
    title: anim.title,
    description: anim.description || anim.short_description || "",
    renderer: (() => {
      if (Array.isArray(anim.tags)) {
        if (anim.tags.includes("three") || anim.tags.includes("threejs")) return "threejs";
        if (anim.tags.includes("gsap")) return "gsap";
        if (anim.tags.includes("css")) return "css";
        if (anim.tags.includes("webgl")) return "webgl";
      }
      return "custom";
    })(),
    previewType: anim.preview_video_url ? "video" : anim.preview_image_url ? "gif" : "iframe",
    previewSrc: anim.preview_video_url || anim.preview_image_url || `/animations/${anim.slug || anim.id}.html`,
    htmlFile: `/animations/${anim.slug || anim.id}.html`,
    tags: anim.tags || [],
    dependencies: anim.tags || [],
    difficulty:
      anim.complexity === "complex"
        ? "advanced"
        : anim.complexity === "moderate"
          ? "intermediate"
          : "beginner",
    performanceScore: anim.performance_tier === "heavy" ? 5 : anim.performance_tier === "standard" ? 3 : 1,
    price: 0,
    features: [],
    images: anim.screenshots || [],
  });

  const sourceAnimations = useMemo(() => {
    if (!loading && !error && Array.isArray(animations) && animations.length > 0) {
      return animations.map((anim) => mapSupabaseToAnimation3D(anim));
    }
    return animations3D;
  }, [animations, loading, error]);

  const filteredAnimations = useMemo(() => {
    if (selectedCategories.includes("All")) return sourceAnimations;

    return sourceAnimations.filter((animation) => {
      const haystack = `${animation.title} ${animation.description} ${animation.tags.join(" ")}`.toLowerCase();
      return selectedCategories.some((category) => haystack.includes(category.toLowerCase()));
    });
  }, [sourceAnimations, selectedCategories]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <Hero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectSuggestion={(v) => setSearchQuery(v)}
      />

      <main className="flex-1">
        <div className="container py-12 md:py-16">
          <section className="mb-8 grid gap-4 rounded-2xl border bg-card/60 p-4 backdrop-blur md:grid-cols-3 md:p-6">
            <div className="flex items-start gap-3 rounded-xl border bg-background/60 p-4">
              <Layers className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Catalogue</p>
                <p className="text-lg font-semibold">{sourceAnimations.length} animations</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border bg-background/60 p-4">
              <SlidersHorizontal className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Filtres actifs</p>
                <p className="text-lg font-semibold">
                  {selectedCategories.includes("All") ? "Tous" : selectedCategories.length}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border bg-background/60 p-4">
              <Rocket className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Résultats</p>
                <p className="text-lg font-semibold">{filteredAnimations.length} visibles</p>
              </div>
            </div>
          </section>

          <section className="mb-8 rounded-2xl border bg-card/40 p-5">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold md:text-2xl">Explorer les animations</h2>
                <p className="text-sm text-muted-foreground">Affinez par catégorie pour trouver plus vite.</p>
              </div>
              <DisplayModeToggle value={displayMode} onChange={setDisplayMode} />
            </div>
            <CategoryFilter selected={selectedCategories} onChange={setSelectedCategories} />
          </section>

          {loading ? (
            <div className="rounded-2xl border bg-card/30 py-20 text-center text-muted-foreground">
              Chargement des animations…
            </div>
          ) : (
            <div
              className={
                displayMode === "list"
                  ? "flex flex-col gap-4"
                  : displayMode === "grid6"
                    ? "grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
                    : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              }
            >
              {filteredAnimations.map((anim) => (
                <ProductCard
                  key={anim.id}
                  snippet={anim}
                  type="animation3d"
                  displayMode={displayMode === "list" ? "list" : "grid"}
                />
              ))}
            </div>
          )}

          {!loading && filteredAnimations.length === 0 && (
            <div className="mt-8 rounded-2xl border bg-card/30 py-14 text-center">
              <h3 className="mb-2 text-lg font-semibold">Aucun résultat avec ces filtres</h3>
              <p className="text-sm text-muted-foreground">Essayez une autre catégorie ou supprimez certains filtres.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
