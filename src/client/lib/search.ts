import supabase from './supabase'

export type SnippetHit = {
  id: string
  title: string
  short_description?: string
  price_cents?: number
}

export async function suggestSnippets(query: string, limit = 6): Promise<SnippetHit[]> {
  if (!query || query.trim() === '') return []
  const q = query.trim()

  try {
    // Search title and description with ILIKE OR (simple approach)
    const { data, error } = await supabase
      .from('snippets')
      .select('id, title, short_description, price_cents')
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .limit(limit)

    if (error) {
      console.warn('suggestSnippets error', error)
      return []
    }
    return (data || []).map((d: any) => ({ id: d.id, title: d.title, short_description: d.short_description, price_cents: d.price_cents }))
  } catch (e) {
    console.error(e)
    return []
  }
}
