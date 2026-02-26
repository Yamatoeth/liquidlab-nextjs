"use client";
import { Link } from "@App/useRouter";
import { ArrowRight, Heart } from "lucide-react";
import type { LiquidSnippet } from "@/types/liquidSnippet";
import type { Animation3D } from "@/types/animation3d";
import { AnimationPreview } from "./AnimationPreview";
import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { isFavorited, toggleFavorite } from "@/lib/favorites";
import LoadingSpinner from "./ui/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";

type ProductCardProps =
  | { snippet: LiquidSnippet; type: "liquid" }
  | { snippet: Animation3D; type: "animation3d" };

type ProductCardPropsWithMode = ProductCardProps & { displayMode?: "list" | "grid" };

const ProductCard = ({ snippet, type, displayMode = "grid" }: ProductCardPropsWithMode) => {
  const { session } = useSession();
  const [fav, setFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const v = await isFavorited(snippet.id, session);
      if (mounted) setFav(!!v);
    })();
    return () => {
      mounted = false;
    };
  }, [snippet.id, session]);

  return (
    <Link
      to={type === "animation3d" ? `/animations/${snippet.id}` : `/snippet/${snippet.id}`}
      className={
        displayMode === "list"
          ? "group product-card panel flex w-full flex-row items-center gap-6 overflow-hidden p-4"
          : "group product-card panel flex flex-col overflow-hidden"
      }
    >
      {displayMode !== "list" && (
        <div className="aspect-[4/3] bg-[linear-gradient(180deg,rgba(41,50,63,0.55),rgba(18,24,33,0.75))] flex items-center justify-center overflow-hidden border-b border-[rgba(216,178,110,0.18)]">
          {type === "animation3d" ? (
            <AnimationPreview previewType={snippet.previewType} previewSrc={snippet.previewSrc} title={snippet.title} />
          ) : snippet.images && snippet.images[0] ? (
            <img
              src={`/snippets/${snippet.images[0]}`}
              alt={snippet.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/snippets/placeholder.png";
              }}
            />
          ) : (
            <div className="p-6 font-mono text-xs leading-relaxed text-muted-foreground opacity-70 transition-opacity group-hover:opacity-90">
              <span>No image</span>
            </div>
          )}
        </div>
      )}

      <div className={displayMode === "list" ? "flex flex-1 flex-col py-0" : "flex flex-1 flex-col p-6"}>
        <div className="mb-2 flex items-center gap-2">
          {type === "liquid" && (
            <span className="premium-chip px-2.5 py-0.5 text-xs font-semibold text-primary">{snippet.category}</span>
          )}
          {type === "animation3d" && (
            <>
              {Array.isArray((snippet as Animation3D).frameworks) && (snippet as Animation3D).frameworks.length > 0 ? (
                (snippet as Animation3D).frameworks.map((f) => (
                  <span key={f} className="premium-chip px-2.5 py-0.5 text-xs font-semibold text-primary">{f}</span>
                ))
              ) : snippet.tags?.[0] ? (
                <span className="premium-chip px-2.5 py-0.5 text-xs font-semibold text-primary">{snippet.tags[0]}</span>
              ) : null}
            </>
          )}
        </div>
        <h3 className="mb-1 text-2xl font-semibold group-hover:text-primary">{snippet.title}</h3>
        <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground md:text-base">{snippet.description}</p>
        {type === "animation3d" && Array.isArray((snippet as Animation3D).formats) && (snippet as Animation3D).formats.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {(snippet as Animation3D).formats.map((fmt) => (
              <span key={fmt} className="text-xs rounded-full border border-[rgba(216,178,110,0.12)] px-2 py-0.5 text-muted-foreground">{fmt}</span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              aria-label="Toggle favorite"
              onClick={async (e) => {
                e.preventDefault();
                if (favLoading) return;

                const prev = fav;
                setFav(!prev);
                setFavLoading(true);
                try {
                  const next = await toggleFavorite(snippet.id, session);
                  setFav(!!next);
                  toast({ title: next ? "Added favorite" : "Removed favorite" });
                } catch (err: unknown) {
                  setFav(prev);
                  console.error("Favorite toggle failed", err);
                  let message = "Please try again.";
                  if (err && typeof err === "object" && "message" in err && typeof (err as any).message === "string") {
                    message = (err as any).message;
                  }
                  toast({ title: "Favorite failed", description: message });
                } finally {
                  setFavLoading(false);
                }
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(216,178,110,0.22)] text-muted-foreground transition-colors hover:text-foreground"
              disabled={favLoading}
            >
              {favLoading ? <LoadingSpinner size={14} /> : <Heart className={`h-4 w-4 ${fav ? "text-red-400" : ""}`} />}
            </button>

            <span className="flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors group-hover:text-foreground">
              View Details
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
