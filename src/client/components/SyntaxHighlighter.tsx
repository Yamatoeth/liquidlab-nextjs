"use client";
import { useEffect, useRef } from "react";

interface Props {
  code: string;
  language?: string;
}

const HLJS_CSS = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github-dark.min.css";
const HLJS_SCRIPT = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js";

export default function SyntaxHighlighter({ code, language = "liquid" }: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // inject CSS if not present
    if (!document.querySelector(`link[href='${HLJS_CSS}']`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = HLJS_CSS;
      document.head.appendChild(link);
    }

    const ensureHLJS = () =>
      new Promise<void>((resolve) => {
        const w = window as any;
        if (w.hljs) return resolve();
        if (document.querySelector(`script[src='${HLJS_SCRIPT}']`)) {
          const check = setInterval(() => {
            if (w.hljs) {
              clearInterval(check);
              resolve();
            }
          }, 50);
          return;
        }
        const script = document.createElement("script");
        script.src = HLJS_SCRIPT;
        script.async = true;
        script.onload = () => resolve();
        document.body.appendChild(script);
      });

    let mounted = true;

    ensureHLJS().then(() => {
      if (!mounted) return;
      const w = window as any;
      try {
        if (ref.current) {
          w.hljs.highlightElement(ref.current);
        }
      } catch (e) {
        // ignore
      }
    });

    return () => {
      mounted = false;
    };
  }, [code, language]);

  return (
    <pre className="overflow-x-auto p-6 font-mono text-xs leading-relaxed text-foreground/80">
      <code ref={ref as any} className={language}>{code}</code>
    </pre>
  );
}
