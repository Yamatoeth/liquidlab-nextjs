"use client";
import { Search } from "lucide-react";
import SearchAutocomplete from './SearchAutocomplete'

interface HeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectSuggestion?: (value: string) => void;
}

const Hero = ({ searchQuery, onSearchChange, onSelectSuggestion }: HeroProps) => {
  return (
    <section className="relative overflow-hidden border-b bg-secondary/30">
      <div className="container relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground opacity-0 animate-fade-in">
            Premium Shopify Components
          </p>
          <h1 className="mb-6 text-4xl font-bold leading-tight opacity-0 animate-fade-in md:text-6xl" style={{ animationDelay: "0.1s" }}>
            Custom Liquid snippets,
            <br />
            ready to drop in.
          </h1>
          <p className="mb-10 text-lg text-muted-foreground opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Professionally crafted Shopify Liquid code for mega menus, floating carts,
            animations, and more. Buy individually or unlock everything.
          </p>

          <div className="relative mx-auto max-w-xl opacity-0 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <SearchAutocomplete
              value={searchQuery}
              onChange={onSearchChange}
              onSelect={(id) => onSelectSuggestion?.(id)}
            />
          </div>
        </div>
      </div>

      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </section>
  );
};

export default Hero;
