"use client";
import React, { useMemo } from "react";
import type { Animation } from "@/types/animation3d";

type CatalogPreviewProps = {
  currentAnimation: Pick<Animation, "id" | "slug" | "renderer" | "animationTypeId" | "tags">;
  animations: Array<Pick<Animation, "id" | "slug" | "title" | "renderer" | "animationTypeId" | "tags" | "previewImageUrl">>;
  limit?: number;
};

function extractAnimationNumber(value?: string): number {
  if (!value) return Number.POSITIVE_INFINITY;
  const match = value.match(/(\d{1,3})/);
  if (!match) return Number.POSITIVE_INFINITY;
  return Number.parseInt(match[1], 10);
}

export default function CatalogPreview({ currentAnimation, animations, limit = 6 }: CatalogPreviewProps) {
  const relatedAnimations = useMemo(() => {
    const currentId = currentAnimation.slug || currentAnimation.id;
    const currentTags = new Set((currentAnimation.tags || []).map((tag) => String(tag).toLowerCase()));
    const currentNum = extractAnimationNumber(currentId);

    return animations
      .filter((anim) => (anim.slug || anim.id) !== currentId)
      .map((anim) => {
        const animTags = (anim.tags || []).map((tag) => String(tag).toLowerCase());
        const sharedTagCount = animTags.reduce((count, tag) => count + (currentTags.has(tag) ? 1 : 0), 0);
        const sameRenderer = anim.renderer === currentAnimation.renderer ? 1 : 0;
        const sameType =
          anim.animationTypeId && currentAnimation.animationTypeId && anim.animationTypeId === currentAnimation.animationTypeId ? 1 : 0;

        const candidateId = anim.slug || anim.id;
        const candidateNum = extractAnimationNumber(candidateId);
        const distanceScore =
          Number.isFinite(currentNum) && Number.isFinite(candidateNum) ? Math.max(0, 40 - Math.abs(candidateNum - currentNum)) / 40 : 0;

        const score = sharedTagCount * 10 + sameRenderer * 6 + sameType * 8 + distanceScore;
        return { anim, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.anim);
  }, [animations, currentAnimation, limit]);

  if (relatedAnimations.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="mb-3 text-xl font-semibold">Animations similaires</h2>
      <div className="flex gap-4 overflow-x-auto py-2">
        {relatedAnimations.map((a) => {
          const routeId = a.slug || a.id;
          return (
          <a
            key={a.id}
            href={`/animations/${routeId}`}
            className="group min-w-[200px] md:min-w-[220px] rounded bg-[#071017] border border-[rgba(216,178,110,0.06)] overflow-hidden shadow-sm hover:shadow-md transition-all"
          >
            <div className="w-full h-[120px] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={a.previewImageUrl || `/animations-preview/${routeId}.png`}
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
              <div className="mt-1 text-xs text-muted-foreground">Voir l'animation</div>
            </div>
          </a>
          );
        })}
      </div>
    </section>
  );
}
