import React, { useRef, useEffect, useState, useCallback } from "react";
import { toPreviewAnimationPath } from "@/lib/protectedAnimation";

interface AnimationPreviewProps {
  previewType: "iframe" | "video" | "gif";
  previewSrc: string;
  title: string;
  className?: string;
  thumbnail?: string;
  active?: boolean; // when true, force-mount interactive preview (used on hover)
}

export const AnimationPreview: React.FC<AnimationPreviewProps> = ({
  previewType,
  previewSrc,
  title,
  className = "",
  thumbnail,
  active = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [nearViewport, setNearViewport] = useState(false);
  const [inViewport, setInViewport] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeSrc =
    previewType === "iframe" &&
    (previewSrc.startsWith("/animations/") || previewSrc.startsWith("/animations-source/"))
      ? toPreviewAnimationPath(previewSrc)
      : previewSrc;

  useEffect(() => {
    setIframeLoaded(false);
  }, [iframeSrc]);

  const postToIframe = useCallback((message: Record<string, unknown>) => {
    const target = iframeRef.current;
    if (!target) return;
    target.contentWindow?.postMessage(message, "*");
  }, []);

  useEffect(() => {
    const prewarmObserver = new window.IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNearViewport(true);

        if (previewType === "iframe" && iframeSrc.startsWith("/")) {
          const preloadHref = new URL(iframeSrc, window.location.origin).href;
          if (!document.head.querySelector(`link[data-iframe-prefetch="${preloadHref}"]`)) {
            const link = document.createElement("link");
            link.rel = "prefetch";
            link.as = "document";
            link.href = preloadHref;
            link.setAttribute("data-iframe-prefetch", preloadHref);
            document.head.appendChild(link);
          }
        }
      },
      { rootMargin: "500px 0px", threshold: 0.01 }
    );
    const visibilityObserver = new window.IntersectionObserver(
      ([entry]) => setInViewport(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (ref.current) {
      prewarmObserver.observe(ref.current);
      visibilityObserver.observe(ref.current);
    }

    return () => {
      prewarmObserver.disconnect();
      visibilityObserver.disconnect();
    };
  }, [previewType, iframeSrc]);

  useEffect(() => {
    if (previewType !== "iframe" || !nearViewport) return;
    const onVisibility = () => {
      // Pause if document hidden, not in viewport, or not active (not hovering)
      const action = document.hidden || !inViewport || !active ? "pause" : "resume";
      postToIframe({ type: "animation:lifecycle", action });
      postToIframe({ type: "animation:visibility", state: action });
    };
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [previewType, nearViewport, inViewport, active, postToIframe]);

  // Pre-mount iframe when near viewport but hide it until hover
  // This ensures instant display on hover with no loading delay
  const shouldPreloadInteractive = previewType === "iframe" && nearViewport;
  const shouldShowInteractive = shouldPreloadInteractive && active && iframeLoaded;

  return (
    <div ref={ref} className={className} style={{ width: "100%", height: "100%", position: "relative" }}>
      {shouldPreloadInteractive && (
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          title={title}
          loading="lazy"
          className={`absolute inset-0 h-full w-full rounded border border-neutral-200 bg-black ${shouldShowInteractive ? "opacity-100 z-10" : "opacity-0 pointer-events-none -z-10"}`}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          sandbox="allow-scripts"
          referrerPolicy="origin"
          {...(!inViewport ? ({ importance: "low" } as Record<string, string>) : {})}
          allow="autoplay; fullscreen"
          onLoad={() => {
            setIframeLoaded(true);
            // Start paused since iframe is preloaded but not visible yet
            const initialAction = active ? "resume" : "pause";
            postToIframe({ type: "animation:lifecycle", action: initialAction });
            postToIframe({ type: "animation:visibility", state: initialAction });
          }}
        />
      )}
      {nearViewport && previewType === "video" && (
        <video
          src={previewSrc}
          title={title}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full rounded border border-neutral-200 bg-black"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
      {nearViewport && previewType === "gif" && (
        <img
          src={previewSrc}
          alt={title}
          className="w-full h-full rounded border border-neutral-200 bg-black"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
      {/* Show thumbnail when not hovering or iframe hasn't loaded yet */}
      {(!shouldShowInteractive || previewType !== "iframe") && (
        thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className={`absolute inset-0 w-full h-full rounded border border-neutral-200 bg-black object-cover ${shouldShowInteractive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              // fall back to placeholder if thumbnail missing
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex h-full w-full items-center justify-center rounded border border-neutral-200 bg-[url('/placeholder.svg')] bg-cover bg-center text-xs text-muted-foreground">
            Loading preview...
          </div>
        )
      )}
    </div>
  );
};
