const LEGACY_ANIMATION_PATH = /^\/(?:animations|animations-source)\/([^/?#]+)\.html(?:[?#].*)?$/i;
const API_ANIMATION_PATH = /^\/api\/animation\/([^/?#]+)(?:[?#].*)?$/i;
const API_PREVIEW_PATH = /^\/api\/animation\/preview\/([^/?#]+)(?:[?#].*)?$/i;

function toAnimationId(input: string): string | null {
  const legacyMatch = input.match(LEGACY_ANIMATION_PATH);
  if (legacyMatch?.[1]) return decodeURIComponent(legacyMatch[1]);

  const apiMatch = input.match(API_ANIMATION_PATH);
  if (apiMatch?.[1]) return decodeURIComponent(apiMatch[1]);

  const previewMatch = input.match(API_PREVIEW_PATH);
  if (previewMatch?.[1]) return decodeURIComponent(previewMatch[1]);

  return null;
}

export function toProtectedAnimationPath(previewSrc: string): string {
  const animationId = toAnimationId(previewSrc);
  if (!animationId) return previewSrc;
  return `/api/animation/${encodeURIComponent(animationId)}`;
}

export function toPreviewAnimationPath(previewSrc: string): string {
  const animationId = toAnimationId(previewSrc);
  if (!animationId) return previewSrc;
  return `/api/animation/preview/${encodeURIComponent(animationId)}`;
}
