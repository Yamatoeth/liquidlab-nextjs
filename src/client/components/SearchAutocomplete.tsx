"use client";
import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { suggestSnippets } from '@/client/lib/search'
import type { SnippetHit as Snippet } from '@/client/lib/search'
import { useNavigate } from '@App/useRouter'
import LoadingSpinner from './ui/LoadingSpinner'
import ErrorAlert from './ui/ErrorAlert'

interface Props {
  value: string
  onChange: (v: string) => void
  onSelect?: (id: string) => void
}

const SearchAutocomplete = ({ value, onChange, onSelect }: Props) => {
  const [suggestions, setSuggestions] = useState<Snippet[]>([])
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nav = useNavigate()
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [])

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!value || value.trim() === '') {
        setSuggestions([])
        setOpen(false)
        return
      }
      setLoading(true)
      setError(null)
      let res: Snippet[] = []
      try {
        res = await suggestSnippets(value, 6)
        setSuggestions(res)
      } catch (e: unknown) {
        let message = 'Failed to load suggestions';
        if (e && typeof e === 'object' && 'message' in e && typeof (e as any).message === 'string') {
          message = (e as any).message;
        }
        setError(message)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
      setActive(0)
      setOpen(res.length > 0)
    }, 250)
    return () => clearTimeout(t)
  }, [value])

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const s = suggestions[active]
      if (s) {
        onSelect?.(s.id)
        nav(`/snippet/${s.id}`)
        setOpen(false)
      }
    }
  }

  return (
    <div ref={ref} className="relative mx-auto max-w-xl">
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        placeholder='Search snippets... (e.g. "Mega Menu", "Sticky ATC")'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        onFocus={() => { if (suggestions.length) setOpen(true) }}
        className="h-14 w-full rounded-2xl border bg-background pl-12 pr-4 text-sm shadow-sm transition-shadow placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />

      {open && (
        <div className="absolute left-0 right-0 z-20 mt-2 max-h-56 overflow-auto rounded-xl border bg-card p-2">
          {loading && (
            <div className="flex items-center justify-center p-3">
              <LoadingSpinner />
            </div>
          )}
          {error && (
            <div className="p-2">
              <ErrorAlert message={error} />
            </div>
          )}
          {!loading && !error && suggestions.length === 0 && (
            <div className="p-3 text-sm text-muted-foreground">No suggestions</div>
          )}
          {!loading && !error && suggestions.map((s, i) => (
            <li
              key={s.id}
              onMouseDown={(e) => { e.preventDefault(); onSelect?.(s.id); nav(`/snippet/${s.id}`); setOpen(false) }}
              className={`cursor-pointer rounded-md px-3 py-2 text-sm ${i === active ? 'bg-accent' : ''}`}
            >
              <div className="font-medium">{s.title}</div>
              {s.short_description && <div className="text-xs text-muted-foreground">{s.short_description}</div>}
            </li>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchAutocomplete
