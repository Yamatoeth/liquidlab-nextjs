"use client";
import React, { useRef, useEffect, useState } from "react";

interface AnimationViewerProps {
  previewType: "iframe" | "video" | "gif" | "image";
  previewSrc: string;
  title: string;
  className?: string;
}

const AnimationViewer: React.FC<AnimationViewerProps> = ({ previewType, previewSrc, title, className = "" }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);

    const onLoad = () => setVisible(true);
    if (document.readyState === 'complete') {
      setVisible(true);
    } else {
      window.addEventListener('load', onLoad);
    }

    return () => {
      obs.disconnect();
      window.removeEventListener('load', onLoad);
    };
  }, []);

  return (
    <div ref={ref} className={`${className} w-full h-full rounded-xl overflow-hidden bg-black`}>
      {visible && previewType === "iframe" && (
        <iframe
          src={previewSrc}
          title={title}
          loading="lazy"
          className="w-full h-full"
          allow="autoplay; fullscreen"
        />
      )}
      {visible && previewType === "video" && (
        <video src={previewSrc} autoPlay loop muted playsInline className="w-full h-full object-cover" />
      )}
      {visible && (previewType === "gif" || previewType === "image") && (
        <img src={previewSrc} alt={title} className="w-full h-full object-cover" />
      )}
      {!visible && <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">Loading preview…</div>}
    </div>
  );
};

export default AnimationViewer;
