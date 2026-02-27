"use client";
import React from 'react';

const animationData = [
  { id: '001-aurora', title: 'Aurora', path: '/animations-source/001-aurora.html' },
  { id: '002-neon-orbit', title: 'Neon Orbit', path: '/animations-source/002-neon-orbit.html' },
  { id: '003-wave-grid', title: 'Wave Grid', path: '/animations-source/003-wave-grid.html' },
  { id: '004-particle-burst', title: 'Particle Burst', path: '/animations-source/004-particle-burst.html' },
];

export default function CatalogPreview() {
  return (
    <section className="mt-6">
      <h2 className="text-xl font-semibold mb-3">More Animations</h2>
      <div className="flex gap-4 overflow-x-auto py-2">
        {animationData.map((a) => (
          <a
            key={a.id}
            href={`/animations/${a.id}`}
            className="group min-w-[200px] md:min-w-[220px] rounded bg-[#071017] border border-[rgba(216,178,110,0.06)] overflow-hidden shadow-sm hover:shadow-md transition-all"
          >
            <div className="w-full h-[120px] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={`/animations-preview/${a.id}.png`}
                alt={a.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const t = e.currentTarget as HTMLImageElement;
                  if (!t.dataset.fallback) {
                    t.dataset.fallback = '1';
                    t.src = '/placeholder.svg';
                  }
                }}
              />
            </div>
            <div className="p-3">
              <div className="text-sm font-medium">{a.title}</div>
              <div className="text-xs text-muted-foreground mt-1">Voir la page</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
