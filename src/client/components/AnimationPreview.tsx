import React, { useRef, useEffect, useState } from "react";

interface AnimationPreviewProps {
  previewType: "iframe" | "video" | "gif";
  previewSrc: string;
  title: string;
  className?: string;
}

export const AnimationPreview: React.FC<AnimationPreviewProps> = ({
  previewType,
  previewSrc,
  title,
  className = "",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);

    // If the page is already fully loaded, show immediately
    const onLoad = () => setVisible(true);
    if (document.readyState === 'complete') {
      setVisible(true);
    } else {
      window.addEventListener('load', onLoad);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
      window.removeEventListener('load', onLoad);
    };
  }, []);

  // Use CSS variable for preview height
  return (
    <div ref={ref} className={className} style={{ width: '100%', height: '100%' }}>
      {visible && previewType === "iframe" && (
        <iframe
          src={previewSrc}
          title={title}
          loading="lazy"
          className="w-full h-full rounded border border-neutral-200 bg-black"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          allow="autoplay; fullscreen"
        />
      )}
      {visible && previewType === "video" && (
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
      {visible && previewType === "gif" && (
        <img
          src={previewSrc}
          alt={title}
          className="w-full h-full rounded border border-neutral-200 bg-black"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
    </div>
  );
};
