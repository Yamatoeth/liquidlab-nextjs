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
    <section className="relative overflow-hidden border-b bg-gradient-to-b from-secondary/40 via-background to-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.15),transparent_45%)]" />

      <div className="container relative z-10 py-20 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Premium Marketplace
          </p>

          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
            Animations 3D haut de gamme
            <span className="block bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              pour des interfaces modernes
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-base text-muted-foreground md:text-lg">
            Explorez des effets 3D prêts à intégrer, pensés pour la performance et le design premium.
            Filtrez, prévisualisez, et trouvez l&apos;animation parfaite en quelques secondes.
          </p>

          <div className="relative mx-auto mb-8 max-w-2xl">
            <SearchAutocomplete
              value={searchQuery}
              onChange={onSearchChange}
              onSelect={(id) => onSelectSuggestion?.(id)}
            />
          </div>

          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-3 text-left sm:grid-cols-3">
            <div className="rounded-xl border bg-card/70 px-4 py-3 backdrop-blur">
              <div className="mb-1 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <BadgeCheck className="h-3.5 w-3.5" />
                Curated quality
              </div>
              <p className="text-sm font-medium">Rendus testés sur desktop et mobile</p>
            </div>
            <div className="rounded-xl border bg-card/70 px-4 py-3 backdrop-blur">
              <div className="mb-1 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Zap className="h-3.5 w-3.5" />
                Fast integration
              </div>
              <p className="text-sm font-medium">Copiez, adaptez et déployez rapidement</p>
            </div>
            <div className="rounded-xl border bg-card/70 px-4 py-3 backdrop-blur">
              <div className="mb-1 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                Premium visuals
              </div>
              <p className="text-sm font-medium">Interactions fluides et impact visuel</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-0 opacity-70">
        <div style={{ width: "100vw", height: "100%", position: "absolute", top: 0, left: 0 }}>
          <Hero3D />
        </div>
      </div>
    </section>
  );
};

export default Hero;
