"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "@App/useRouter";
import AnimationViewer from "../components/AnimationViewer";
import AnimationViewer3D from "../components/AnimationViewer3D";
import ParameterControls from "../components/ParameterControls";
import PresetSelector from "../components/PresetSelector";
import { applyDefaults } from "@/lib/params/validate";
import { useAnimations } from "@/hooks/useAnimations";
import { animations3D } from "@/data/animations";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SyntaxHighlighter from "@/components/SyntaxHighlighter";

const tabList = ["Preview", "Code", "Dependencies", "Installation"] as const;
type Tab = (typeof tabList)[number];

const AnimationDetail: React.FC = () => {
  const { id } = useParams();
  const [tab, setTab] = useState<Tab>("Preview");
  const { animations, loading, error } = useAnimations();
  const paramId = Array.isArray(id) ? id[0] : id;
  const sourceAnimations = Array.isArray(animations) && animations.length > 0 ? animations : animations3D as any;
  const animation = sourceAnimations.find((a: any) => a.id === paramId || a.slug === paramId);
  const [code, setCode] = useState<string | null>(null);
  const [currentParams, setCurrentParams] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!animation) return;
    let active = true;
    const url = animation.previewSrc || animation.htmlFile || ("/animations/" + (animation.slug || animation.id) + ".html");
    fetch(url)
      .then((r) => r.text())
      .then((t) => {
        if (active) setCode(t);
      })
      .catch(() => {
        if (active) setCode("// Unable to load source");
      });
    return () => {
      active = false;
    };
  }, [animation]);

  useEffect(() => {
    if (!animation) return;
    const schema = animation.params_schema || [];
    setCurrentParams(applyDefaults(schema, animation.initialParams || {}));
  }, [animation]);

  // Don't short-circuit on loading/error — prefer local fallback and show non-blocking banners
  if (error) console.warn("useAnimations error:", error);
  if (!animation) return <div className="container py-12 text-center">Animation not found.</div>;

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
          <div className="mb-4 flex flex-wrap gap-2">
            {(animation.frameworks && animation.frameworks.length > 0 ? animation.frameworks : animation.tags || []).map((f: string) => (
              <span key={f} className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,255,255,0.02)] px-3 py-1 text-sm font-semibold text-muted-foreground">{f}</span>
            ))}
            {animation.formats && animation.formats.length > 0 && (
              <div className="ml-2 flex items-center gap-2">
                {animation.formats.map((fmt: string) => (
                  <span key={fmt} className="text-xs rounded-full border border-[rgba(216,178,110,0.12)] px-2 py-0.5 text-muted-foreground">{fmt}</span>
                ))}
              </div>
            )}
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
                  className="w-full h-[60vh] rounded border border-[rgba(216,178,110,0.12)] bg-black"
                />
              ) : (
                <AnimationViewer
                  previewType={animation.preview_video_url ? "video" : animation.preview_image_url ? "gif" : animation.previewType || "iframe"}
                  previewSrc={animation.preview_video_url || animation.preview_image_url || animation.previewSrc || animation.htmlFile || ("/animations/" + (animation.slug || animation.id) + ".html")}
                  title={animation.title}
                  className="w-full h-[60vh]"
                  params={currentParams}
                />
              )}
            </div>
            <aside className="col-span-3 space-y-6">
              <ParameterControls schema={animation.params_schema || []} params={currentParams} onChange={(p) => setCurrentParams(p)} />
              <PresetSelector
                presets={animation.presets || []}
                onApply={(preset) => setCurrentParams(applyDefaults(animation.params_schema || [], preset.params || {}))}
              />
            </aside>
          </div>
        )}
        {tab === "Code" && (
          <div>
            <p className="mb-2 text-sm text-muted-foreground">HTML source:</p>
            <div className="h-[48vh] overflow-auto rounded border border-[rgba(216,178,110,0.12)] bg-[#0b0f16] p-0">
              <SyntaxHighlighter code={code ?? "// Loading..."} language="html" />
            </div>
          </div>
        )}
        {tab === "Dependencies" && (
          <ul className="list-disc pl-6">
            {Array.isArray(animation.frameworks) && animation.frameworks.length === 0 && Array.isArray(animation.tags) && animation.tags.length === 0 ? (
              <li>No dependencies</li>
            ) : (
              ((animation.frameworks && animation.frameworks.length > 0 ? animation.frameworks : animation.tags) || []).map((dep: string) => <li key={dep}>{dep}</li>)
            )}
          </ul>
        )}
        {tab === "Installation" && (
          <div>
            <p className="mb-2 text-sm text-muted-foreground">To use this animation:</p>
            <ol className="list-decimal pl-6">
              <li>
                Embed or use the HTML file: <code>{"/animations/" + (animation.slug || animation.id) + ".html"}</code>
              </li>
              <li>Include dependencies as needed: {(animation.frameworks && animation.frameworks.length > 0 ? animation.frameworks.join(", ") : (animation.tags || []).join(", ") ) || "None"}</li>
              <li>Available formats: {(animation.formats || []).join(", ") || "html"}</li>
              {animation.reactComponent && (
                <li>
                  React: import the component from <code>{animation.reactComponent}</code>
                </li>
              )}
              <li>Follow documentation for integration.</li>
            </ol>
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
