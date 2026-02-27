"use client";
import dynamic from "next/dynamic";
import { BadgeCheck, Sparkles, Zap } from "lucide-react";
import SearchAutocomplete from "./SearchAutocomplete";

const Hero3D = dynamic(() => import("../../app/Hero3D"), { ssr: false });

interface HeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectSuggestion?: (value: string) => void;
}

const Hero = ({ searchQuery, onSearchChange, onSelectSuggestion }: HeroProps) => {
  return (
    <section className="hero-section relative overflow-hidden border-b border-[rgba(216,178,110,0.22)] min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(216,178,110,0.2),transparent_45%),radial-gradient(circle_at_85%_10%,rgba(122,150,194,0.2),transparent_38%)]" />

      <div className="container relative z-10 min-h-screen flex items-center py-24 md:py-32">
        <div className="mx-auto max-w-5xl text-center">
          <p className="premium-chip mb-5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em]">
            Premium Marketplace
          </p>

          <h1 className="mb-6 text-5xl leading-[0.98] text-foreground md:text-7xl">High-End 3D Animations</h1>

          <p className="mx-auto mb-10 max-w-2xl text-base text-muted-foreground md:text-lg">
            Explore production-ready 3D effects built for performance and premium design. Filter, preview, and find
            the perfect animation in seconds.
          </p>

          <div className="panel relative mx-auto mb-9 max-w-2xl p-2">
            <SearchAutocomplete value={searchQuery} onChange={onSearchChange} onSelect={(id) => onSelectSuggestion?.(id)} />
          </div>

          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 text-left sm:grid-cols-3">
            <div className="surface-soft px-4 py-3 backdrop-blur">
              <div className="mb-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                Curated quality
              </div>
              <p className="text-sm font-semibold">Renderings tested on desktop and mobile</p>
            </div>
            <div className="surface-soft px-4 py-3 backdrop-blur">
              <div className="mb-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                <Zap className="h-3.5 w-3.5 text-primary" />
                Fast integration
              </div>
              <p className="text-sm font-semibold">Copy, adapt, and ship quickly</p>
            </div>
            <div className="surface-soft px-4 py-3 backdrop-blur">
              <div className="mb-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Premium visuals
              </div>
              <p className="text-sm font-semibold">Fluid interactions with strong visual impact</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-0 opacity-60 hero-canvas-wrapper">
        <div style={{ width: "100vw", height: "100vh", position: "absolute", top: 0, left: 0 }}>
          <Hero3D />
        </div>
      </div>
      <div className="absolute bottom-10 left-1/2 z-20 -translate-x-1/2">
        <button
          aria-label="Jump to catalogue"
          onClick={() => {
            const el = document.getElementById("catalog");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="btn-primary h-14 w-14 p-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6">
            <path fill="currentColor" d="M12 16l-6-6h12l-6 6z" />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default Hero;
