"use client";
import { useState, useMemo } from "react";
import { animations3D } from "../../data/animations";
import Hero from "@/components/Hero";
import Onboarding from "@/components/Onboarding";
import dynamic from "next/dynamic";
import CategoryFilter from "@/components/CategoryFilter";
import ProductCard from "@/components/ProductCard";
import DisplayModeToggle from "@/components/DisplayModeToggle";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Layers, Rocket, SlidersHorizontal } from "lucide-react";
import { useAnimations } from "@/hooks/useAnimations";
import type { Animation3D } from "@/types/animation3d";
import { toPreviewAnimationPath } from "@/lib/protectedAnimation";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["All"]);

  const { animations, loading, error } = useAnimations({ search: searchQuery });
  const [displayMode, setDisplayMode] = useState<"list" | "grid3" | "grid6">("grid3");

  const sourceAnimations = useMemo(() => {
    if (!loading && !error && Array.isArray(animations) && animations.length > 0) {
      return animations.map((anim) => ({
        ...anim,
        previewSrc:
          anim.previewSrc ||
          anim.previewVideoUrl ||
          anim.previewImageUrl ||
          toPreviewAnimationPath(`/animations-source/${anim.slug || anim.id}.html`),
      })) as Animation3D[];
    }
    return animations3D;
  }, [animations, loading, error]);

  const filteredAnimations = useMemo(() => {
    if (selectedCategories.includes("All")) return sourceAnimations;

    return sourceAnimations.filter((animation) => {
      const haystack = `${animation.title} ${animation.description || ""} ${animation.tags.join(" ")}`.toLowerCase();
      return selectedCategories.some((category) => haystack.includes(category.toLowerCase()));
    });
  }, [sourceAnimations, selectedCategories]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <Hero searchQuery={searchQuery} onSearchChange={setSearchQuery} onSelectSuggestion={(v) => setSearchQuery(v)} />

      {/* Testimonials removed per request */}
      <Onboarding />

      <main className="flex-1">
        <div id="catalog" className="container py-12 md:py-16">
          <section className="panel mb-8 grid gap-4 p-4 md:grid-cols-3 md:p-6">
            <div className="surface-soft flex items-start gap-3 p-4">
              <Layers className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Catalog</p>
                <p className="text-xl font-semibold">{sourceAnimations.length} animations</p>
              </div>
            </div>
            <div className="surface-soft flex items-start gap-3 p-4">
              <SlidersHorizontal className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Active filters</p>
                <p className="text-xl font-semibold">{selectedCategories.includes("All") ? "All" : selectedCategories.length}</p>
              </div>
            </div>
            <div className="surface-soft flex items-start gap-3 p-4">
              <Rocket className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Results</p>
                <p className="text-xl font-semibold">{filteredAnimations.length} visible</p>
              </div>
            </div>
          </section>

          <section className="panel mb-8 p-5">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-4xl font-semibold leading-none">Explore animations</h2>
                <p className="text-sm text-muted-foreground">Refine by category to find the right one faster.</p>
              </div>
              <DisplayModeToggle value={displayMode} onChange={setDisplayMode} />
            </div>
            <CategoryFilter selected={selectedCategories} onChange={setSelectedCategories} />
          </section>

          {loading ? (
            <div className="panel py-20 text-center text-muted-foreground">Loading animations…</div>
          ) : (
            <div
              className={
                displayMode === "list"
                  ? "flex flex-col gap-6"
                  : displayMode === "grid6"
                    ? "grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
                    : "catalog-grid"
              }
            >
              {filteredAnimations.map((anim) => (
                <ProductCard key={anim.id} snippet={anim} type="animation3d" displayMode={displayMode === "list" ? "list" : "grid"} />
              ))}
            </div>
          )}

          {!loading && filteredAnimations.length === 0 && (
            <div className="panel mt-8 py-14 text-center">
              <h3 className="mb-2 text-2xl font-semibold">No results with these filters</h3>
              <p className="text-sm text-muted-foreground">Try another category or clear some filters.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
