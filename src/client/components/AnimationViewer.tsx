"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { Params } from "@/lib/params/types";
import { toPreviewAnimationPath } from "@/lib/protectedAnimation";

interface AnimationViewerProps {
  previewType: "iframe" | "video" | "gif" | "image";
  previewSrc: string;
  title: string;
  className?: string;
  params?: Params;
}

const AnimationViewer: React.FC<AnimationViewerProps> = ({ previewType, previewSrc, title, className = "", params = {} }) => {
  const ref = useRef<HTMLDivElement | null>(null);
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
    const prewarmObserver = new IntersectionObserver(
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
      { rootMargin: "600px 0px", threshold: 0.01 }
    );

    const visibilityObserver = new IntersectionObserver(([entry]) => setInViewport(entry.isIntersecting), { threshold: 0.15 });

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
    if (!nearViewport) return;
    if (!iframeRef.current) return;
    postToIframe({ type: "params:update", params });
  }, [nearViewport, params, postToIframe]);

  useEffect(() => {
    if (previewType !== "iframe" || !nearViewport) return;
    const onVisibility = () => {
      const action = document.hidden || !inViewport ? "pause" : "resume";
      postToIframe({ type: "animation:lifecycle", action });
      postToIframe({ type: "animation:visibility", state: action });
    };
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [previewType, nearViewport, inViewport, postToIframe]);

  return (
    <div ref={ref} className={`${className} w-full h-full rounded-xl overflow-hidden bg-black`}>
      {nearViewport && previewType === "iframe" && (
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          title={title}
          loading="lazy"
          className={`h-full w-full ${iframeLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
          sandbox="allow-scripts"
          referrerPolicy="origin"
          {...(!inViewport ? ({ importance: "low" } as Record<string, string>) : {})}
          onLoad={() => {
            setIframeLoaded(true);
            postToIframe({ type: "params:update", params });
            postToIframe({ type: "animation:lifecycle", action: inViewport ? "resume" : "pause" });
            postToIframe({ type: "animation:visibility", state: inViewport ? "resume" : "pause" });
          }}
          allow="autoplay; fullscreen"
        />
      )}
      {nearViewport && previewType === "video" && (
        <video src={previewSrc} autoPlay loop muted playsInline className="w-full h-full object-cover" />
      )}
      {nearViewport && (previewType === "gif" || previewType === "image") && (
        <img src={previewSrc} alt={title} className="w-full h-full object-cover" />
      )}
      {(!nearViewport || (previewType === "iframe" && !iframeLoaded)) && (
        <div className="flex h-full w-full items-center justify-center bg-[url('/placeholder.svg')] bg-cover bg-center text-sm text-muted-foreground">
          Loading preview...
        </div>
      )}
    </div>
  );
};

export default AnimationViewer;
