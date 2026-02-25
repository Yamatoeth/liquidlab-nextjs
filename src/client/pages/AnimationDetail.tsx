import React, { useState } from "react";
import { useParams } from "@App/useRouter";
import { AnimationPreview } from "../components/AnimationPreview";
import { useAnimations } from "@/hooks/useAnimations";

const tabList = ["Preview", "Code", "Dependencies", "Installation"] as const;
type Tab = typeof tabList[number];

const AnimationDetail: React.FC = () => {

  const { id } = useParams();
  const [tab, setTab] = useState<Tab>("Preview");
  // Fetch from Supabase using useAnimations hook
  const { animations, loading, error } = useAnimations();
  // Try to match by id or slug (for future-proofing)
  const animation = animations.find((a) => a.id === id || a.slug === id);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading animation…</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error loading animation</div>;
  if (!animation) return <div className="p-8 text-center">Animation not found.</div>;

  return (
    <div className="container py-12">
      <h1 className="mb-4 text-3xl font-bold">{animation.title}</h1>
      <div className="mb-6 flex gap-2">
        {tabList.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="rounded-xl border bg-card p-6">
        {tab === "Preview" && (
          <AnimationPreview
            previewType={animation.preview_video_url ? "video" : animation.preview_image_url ? "gif" : "iframe"}
            previewSrc={animation.preview_video_url || animation.preview_image_url || "/animations/" + (animation.slug || animation.id) + ".html"}
            title={animation.title}
            className="w-full h-96"
          />
        )}
        {tab === "Code" && (
          <div>
            <p className="mb-2 text-sm text-muted-foreground">HTML file:</p>
            <pre className="bg-neutral-900 text-neutral-100 rounded p-4 overflow-x-auto text-xs">
              {"/animations/" + (animation.slug || animation.id) + ".html"}
            </pre>
            {/* Pour affichage du code réel, il faudra loader le contenu du fichier HTML depuis public/animations/ */}
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
              <li>Embed or use the HTML file: <code>{"/animations/" + (animation.slug || animation.id) + ".html"}</code></li>
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
