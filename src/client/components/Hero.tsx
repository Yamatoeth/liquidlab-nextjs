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
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Marketplace Animations 3D Premium
          </p>
          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
            Stunning 3D Web Animations<br />
            for modern interfaces.
          </h1>
          <p className="mb-10 text-lg text-muted-foreground">
            Discover premium 3D effects, interactive backgrounds, and UI micro-animations.<br />
            Built with Three.js, GSAP, WebGL, and CSS3D. Buy individually or unlock all.
          </p>

          <div className="relative mx-auto max-w-xl">
            <SearchAutocomplete
              value={searchQuery}
              onChange={onSearchChange}
              onSelect={(id) => onSelectSuggestion?.(id)}
            />
          </div>
        </div>
      </div>

      {/* Placeholder for premium background animation */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* TODO: Insert premium 3D animation background here */}
      </div>
    </section>
  );
};

export default Hero;
