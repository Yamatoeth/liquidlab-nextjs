"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "@App/useRouter";
import AnimationViewer from "../components/AnimationViewer";
import AnimationViewer3D from "../components/AnimationViewer3D";
import ParameterControls from "../components/ParameterControls";
import { applyDefaults } from "@/lib/params/validate";
import { useAnimations } from "@/hooks/useAnimations";
import { animations3D } from "@/data/animations";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SyntaxHighlighter from "@/components/SyntaxHighlighter";
import { toPreviewAnimationPath } from "@/lib/protectedAnimation";
import { useSubscriptionAccess } from "@/hooks/useSubscriptionAccess";

const tabList = ["Preview", "Code", "ReadMe", "React"] as const;
type Tab = (typeof tabList)[number];

const AnimationDetail: React.FC = () => {
  const { id } = useParams();
  const [tab, setTab] = useState<Tab>("Preview");
  const { animations, loading, error } = useAnimations();
  const { hasActiveSubscription, loading: subscriptionLoading } = useSubscriptionAccess();
  const paramId = Array.isArray(id) ? id[0] : id;
  const sourceAnimations = Array.isArray(animations) && animations.length > 0 ? animations : animations3D as any;
  const animation = sourceAnimations.find((a: any) => a.id === paramId || a.slug === paramId);
  const [code, setCode] = useState<string | null>(null);
  const [currentParams, setCurrentParams] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!animation || !hasActiveSubscription) {
      setCode("// Subscribe to access full source code.");
      return;
    }
    let active = true;
    const url = "/api/animation/" + encodeURIComponent(animation.slug || animation.id);
    fetch(url)
      .then((r) => (r.ok ? r.text() : Promise.resolve("// Source unavailable (unauthorized or missing)")))
      .then((t) => {
        if (active) setCode(t);
      })
      .catch(() => {
        if (active) setCode("// Unable to load source");
      });
    return () => {
      active = false;
    };
  }, [animation, hasActiveSubscription]);

  useEffect(() => {
    if (!animation) return;
    const schema = animation.paramsSchema || [];
    setCurrentParams(applyDefaults(schema, {}));
  }, [animation]);

  // Don't short-circuit on loading/error — prefer local fallback and show non-blocking banners
  if (error) console.warn("useAnimations error:", error);
  if (!animation) return <div className="container py-12 text-center">Animation not found.</div>;
  const protectedSrc = "/api/animation/" + encodeURIComponent(animation.slug || animation.id);
  const previewSrc =
    animation.previewSrc ||
    animation.previewVideoUrl ||
    animation.previewImageUrl ||
    toPreviewAnimationPath(animation.htmlFile || `/animations-source/${animation.slug || animation.id}.html`);
  const currentIframeSrc = hasActiveSubscription ? protectedSrc : previewSrc;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <div className="container py-12">
          <div className="mb-4 flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              aria-label="Back"
              className="inline-flex items-center gap-2 rounded px-3 py-1.5 text-sm font-semibold transition-all border border-[rgba(216,178,110,0.12)] bg-[rgba(216,178,110,0.02)] hover:bg-[rgba(216,178,110,0.06)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
              </svg>
              Back
            </button>
            <h1 className="text-5xl font-semibold">{animation.title}</h1>
          </div>
          {loading && (
            <div className="mb-4 text-sm text-muted-foreground">Loading remote animations…</div>
          )}
          {error && (
            <div className="mb-4 rounded-md border border-yellow-600/20 bg-yellow-900/5 p-3 text-sm text-yellow-300">Remote animations unavailable — using local data.</div>
          )}
          <div className="mb-6 flex flex-wrap gap-2">
        {tabList.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              tab === t
                ? "border border-[rgba(216,178,110,0.6)] bg-[rgba(216,178,110,0.2)] text-primary"
                : "border border-[rgba(216,178,110,0.24)] bg-[rgba(16,22,30,0.75)] text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="panel p-6">
        {tab === "Preview" && (
          <div className="grid grid-cols-10 gap-6">
            <div className="col-span-7">
              {animation.renderer === "threejs" ? (
                <AnimationViewer3D
                  animation={animation}
                  params={currentParams}
                  className="w-full h-[68vh] rounded border border-[rgba(216,178,110,0.12)] bg-black"
                />
              ) : (
                <AnimationViewer
                  previewType={animation.previewType || "iframe"}
                  previewSrc={currentIframeSrc}
                  title={animation.title}
                       className="w-full h-[68vh]"
                  params={currentParams}
                />
              )}
            </div>
            <aside className="col-span-3 space-y-6">
              <ParameterControls schema={animation.paramsSchema || []} params={currentParams} onChange={(p) => setCurrentParams(p)} />
            </aside>
          </div>
        )}
        {tab === "ReadMe" && (
          <div>
            <h2 className="text-lg font-semibold mb-2">README</h2>
            <p className="mb-3 text-sm text-muted-foreground">Short instructions for using this animation. This section combines dependency information and installation/usage examples.</p>

            <div className="mb-4">
              <div className="font-medium">Dependencies</div>
              {Array.isArray(animation.dependencies) && animation.dependencies.length > 0 ? (
                <ul className="list-disc pl-6 mt-2">{animation.dependencies.map((d: string) => <li key={d}>{d}</li>)}</ul>
              ) : Array.isArray(animation.tags) && animation.tags.length > 0 ? (
                <ul className="list-disc pl-6 mt-2">{animation.tags.map((t: string) => <li key={t}>{t}</li>)}</ul>
              ) : (
                <div className="text-sm text-muted-foreground mt-2">No dependencies</div>
              )}
            </div>

          

            <div className="mb-4">
              <div className="font-medium mb-2">Embed example</div>
              <div className="h-[20vh] overflow-auto rounded border border-[rgba(216,178,110,0.12)] bg-[#0b0f16] p-3">
                {(() => {
                  const embedPath = "/api/animation/" + encodeURIComponent(animation.slug || animation.id);
                  const snippet = `<iframe src="${embedPath}" width="800" height="450" loading="lazy" importance="low" sandbox="allow-scripts" referrerpolicy="origin" frameborder="0"></iframe>`;
                  return <SyntaxHighlighter code={snippet} language="html" />;
                })()}
              </div>
            </div>
          </div>
        )}
        {tab === "Code" && (
          <div>
            {subscriptionLoading ? (
              <p className="text-sm text-muted-foreground">Checking subscription access…</p>
            ) : hasActiveSubscription ? (
              <>
                <p className="mb-2 text-sm text-muted-foreground">HTML source:</p>
                <div className="h-[48vh] overflow-auto rounded border border-[rgba(216,178,110,0.12)] bg-[#0b0f16] p-0">
                  <SyntaxHighlighter code={code ?? "// Loading..."} language="html" />
                </div>
              </>
            ) : (
              <div className="rounded border border-[rgba(216,178,110,0.24)] bg-[rgba(16,22,30,0.75)] p-6 text-center">
                <h3 className="text-xl font-semibold">Subscribe to get access to code snippet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  You can preview and tweak parameters, but HTML/React snippets are reserved for active subscribers.
                </p>
                <a
                  href="/subscribe"
                  className="mt-4 inline-flex rounded bg-primary px-4 py-2 text-sm font-semibold text-black"
                >
                  View plans
                </a>
              </div>
            )}
          </div>
        )}
        
        {tab === "React" && (
          <div>
            {subscriptionLoading ? (
              <p className="text-sm text-muted-foreground">Checking subscription access…</p>
            ) : hasActiveSubscription ? (
              <>
                <h2 className="text-lg font-semibold mb-2">React</h2>
                <p className="mb-3 text-sm text-muted-foreground">Example React usage for this animation via iframe wrapper.</p>
                <div className="h-[48vh] overflow-auto rounded border border-[rgba(216,178,110,0.12)] bg-[#0b0f16] p-3">
                  {(() => {
                    const embedPath = "/api/animation/" + encodeURIComponent(animation.slug || animation.id);
                    const snip = `import React, { useEffect, useRef } from 'react';\n\nexport default function AnimationIframe({ params = {} }) {\n  const ref = useRef<HTMLIFrameElement | null>(null);\n  useEffect(() => {\n    const iframe = ref.current;\n    if (!iframe) return;\n    iframe.contentWindow?.postMessage({ type: 'params:update', params }, '*');\n  }, [params]);\n  return (\n    <iframe\n      ref={ref}\n      src='${embedPath}'\n      loading='lazy'\n      sandbox='allow-scripts'\n      referrerPolicy='origin'\n      style={{ width: '100%', height: 480, border: 0 }}\n    />\n  );\n}`;
                    return <SyntaxHighlighter code={snip} language="tsx" />;
                  })()}
                </div>
              </>
            ) : (
              <div className="rounded border border-[rgba(216,178,110,0.24)] bg-[rgba(16,22,30,0.75)] p-6 text-center">
                <h3 className="text-xl font-semibold">Subscribe to get access to code snippet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  You can preview and tweak parameters, but HTML/React snippets are reserved for active subscribers.
                </p>
                <a
                  href="/subscribe"
                  className="mt-4 inline-flex rounded bg-primary px-4 py-2 text-sm font-semibold text-black"
                >
                  View plans
                </a>
              </div>
            )}
          </div>
        )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AnimationDetail;
