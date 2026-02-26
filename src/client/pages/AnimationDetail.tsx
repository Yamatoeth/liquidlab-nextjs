import React, { useState } from "react";
import { useParams } from "@App/useRouter";
import AnimationViewer from "../components/AnimationViewer";
import { useAnimations } from "@/hooks/useAnimations";

const tabList = ["Preview", "Code", "Dependencies", "Installation"] as const;
type Tab = (typeof tabList)[number];

const AnimationDetail: React.FC = () => {
  const { id } = useParams();
  const [tab, setTab] = useState<Tab>("Preview");
  const { animations, loading, error } = useAnimations();
  const animation = animations.find((a) => a.id === id || a.slug === id);

  if (loading) return <div className="container py-12 text-center text-muted-foreground">Loading animation…</div>;
  if (error) return <div className="container py-12 text-center text-red-400">Error loading animation</div>;
  if (!animation) return <div className="container py-12 text-center">Animation not found.</div>;

  return (
    <div className="container py-12">
      <h1 className="mb-4 text-5xl font-semibold">{animation.title}</h1>
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
          <AnimationViewer
            previewType={animation.preview_video_url ? "video" : animation.preview_image_url ? "gif" : "iframe"}
            previewSrc={animation.preview_video_url || animation.preview_image_url || "/animations/" + (animation.slug || animation.id) + ".html"}
            title={animation.title}
            className="h-96 w-full"
          />
        )}
        {tab === "Code" && (
          <div>
            <p className="mb-2 text-sm text-muted-foreground">HTML file:</p>
            <pre className="overflow-x-auto rounded p-4 text-xs bg-[#0b0f16] text-[#d7cfbc] border border-[rgba(216,178,110,0.2)]">
              {"/animations/" + (animation.slug || animation.id) + ".html"}
            </pre>
          </div>
        )}
        {tab === "Dependencies" && (
          <ul className="list-disc pl-6">
            {Array.isArray(animation.tags) && animation.tags.length === 0 ? (
              <li>No dependencies</li>
            ) : (
              (animation.tags || []).map((dep: string) => <li key={dep}>{dep}</li>)
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
              <li>Include dependencies as needed: {(animation.tags || []).join(", ") || "None"}</li>
              <li>Follow documentation for integration.</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimationDetail;
