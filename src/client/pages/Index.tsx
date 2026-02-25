"use client";
import { useState, useMemo } from "react";
import { snippets } from "@/data/snippets";
import Hero from "@/components/Hero";
import CategoryFilter from "@/components/CategoryFilter";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Sparkles } from "lucide-react";
import { Link } from "@App/useRouter";

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

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <Hero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectSuggestion={(v) => setSearchQuery(v)}
      />

      {/* Featured Snippets */}
      {(() => {
        const featuredIds = ["mega-menu", "floating-cart", "sticky-atc"]
        const featuredSnippets = snippets.filter((s) => featuredIds.includes(s.id))
        if (featuredSnippets.length === 0) return null
        return (
          <section className="border-b">
            <div className="container py-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Featured Snippets</h2>
                <Link to="/" className="text-sm text-muted-foreground">Explore all</Link>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredSnippets.map((snippet) => (
                  <ProductCard key={snippet.id} snippet={snippet} />
                ))}
              </div>
            </div>
          </section>
        )
      })()}

      {/* All-Access Banner */}
      <section className="border-b">
        <div className="container py-8">
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-primary p-8 text-primary-foreground md:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/10">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">All-Access Pass</h3>
                <p className="text-sm text-primary-foreground/70">
                  Unlock every snippet for $19/month or $149/year
                </p>
              </div>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex h-10 items-center rounded-lg bg-primary-foreground px-6 text-sm font-medium text-primary transition-colors hover:bg-primary-foreground/90"
            >
              Subscribe Now
            </Link>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <main className="flex-1">
        <div className="container py-12">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Browse Snippets</h2>
              <p className="text-sm text-muted-foreground">
                {filteredSnippets.length} snippet{filteredSnippets.length !== 1 ? "s" : ""} available
              </p>
            </div>
            <CategoryFilter
              selected={selectedCategories}
              onChange={setSelectedCategories}
            />
          </div>

          {filteredSnippets.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSnippets.map((snippet) => (
                <ProductCard key={snippet.id} snippet={snippet} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-lg font-medium text-muted-foreground">
                No snippets found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or filter
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
