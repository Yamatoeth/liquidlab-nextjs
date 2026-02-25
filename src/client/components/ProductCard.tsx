"use client";
import { Link } from "@App/useRouter";
import { ArrowRight, Heart } from "lucide-react";
import type { Snippet } from "@/data/snippets";
import { useEffect, useState } from 'react'
import { useSession } from '@/hooks/useSession'
import { isFavorited, toggleFavorite } from '@/lib/favorites'
import LoadingSpinner from './ui/LoadingSpinner'
import { useToast } from '@/hooks/use-toast'

interface ProductCardProps {
  snippet: Snippet;
}

const ProductCard = ({ snippet }: ProductCardProps) => {
  const { session } = useSession()
  const [fav, setFav] = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const v = await isFavorited(snippet.id, session)
      if (mounted) setFav(!!v)
    })()
    return () => { mounted = false }
  }, [snippet.id, session])
  return (
    <Link
      to={`/snippet/${snippet.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="aspect-[16/10] bg-secondary flex items-center justify-center overflow-hidden">
        {snippet.images && snippet.images[0] ? (
          <img
            src={`/snippets/${snippet.images[0]}`}
            alt={snippet.title}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/snippets/placeholder.png';
            }}
          />
        ) : (
          <div className="p-6 font-mono text-xs leading-relaxed text-muted-foreground opacity-60 group-hover:opacity-80 transition-opacity">
            <span>No image</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {snippet.category}
          </span>
        </div>
        <h3 className="mb-1 text-lg font-semibold group-hover:text-foreground">
          {snippet.title}
        </h3>
        <p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-2">
          {snippet.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">${snippet.price}</span>
          <div className="flex items-center gap-3">
            <button
              aria-label="Toggle favorite"
              onClick={async (e) => {
                e.preventDefault()
                if (favLoading) return

                const prev = fav
                // optimistic update
                setFav(!prev)
                setFavLoading(true)
                try {
                  const next = await toggleFavorite(snippet.id, session)
                  // toggleFavorite returns boolean for new state; update to be safe
                  setFav(!!next)
                  toast({ title: next ? 'Added favorite' : 'Removed favorite' })
                } catch (err: any) {
                  // rollback on error
                  setFav(prev)
                  console.error('Favorite toggle failed', err)
                  toast({ title: 'Favorite failed', description: err?.message || 'Please try again.' })
                } finally {
                  setFavLoading(false)
                }
              }}
              className="rounded p-1 text-muted-foreground hover:text-foreground"
              disabled={favLoading}
            >
              {favLoading ? <LoadingSpinner size={14} /> : <Heart className={`h-4 w-4 ${fav ? 'text-red-500' : ''}`} />}
            </button>

            <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
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
