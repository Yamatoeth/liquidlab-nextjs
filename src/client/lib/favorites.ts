import supabase from './supabase'

const LOCAL_KEY = 'favorites'

export async function isFavorited(snippetId: string, session?: any) {
  if (session?.user?.id && supabase) {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('snippet_id', snippetId)
        .limit(1)
        .maybeSingle()
      if (error) return false
      return !!data
    } catch (e) {
      return false
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    const parsed: string[] = raw ? JSON.parse(raw) : []
    return parsed.includes(snippetId)
  } catch (e) {
    return false
  }
}

export async function toggleFavorite(snippetId: string, session?: any) {
  if (session?.user?.id && supabase) {
    try {
      // check existing
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('snippet_id', snippetId)
        .limit(1)
        .maybeSingle()

      if (data) {
        await supabase.from('favorites').delete().eq('id', data.id)
        return false
      }

      await supabase.from('favorites').insert([{ user_id: session.user.id, snippet_id: snippetId }])
      return true
    } catch (e) {
      console.error('Favorites toggle error', e)
      throw e
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    const parsed: string[] = raw ? JSON.parse(raw) : []
    if (parsed.includes(snippetId)) {
      const next = parsed.filter((s) => s !== snippetId)
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next))
      return false
    } else {
      parsed.push(snippetId)
      localStorage.setItem(LOCAL_KEY, JSON.stringify(parsed))
      return true
    }
  } catch (e) {
    console.error(e)
    throw e
  }
}

export async function getFavoritesCount(session?: any) {
  if (session?.user?.id && supabase) {
    try {
      const { count, error } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
      if (error) return 0
      return count || 0
    } catch (e) {
      return 0
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    const parsed: string[] = raw ? JSON.parse(raw) : []
    return parsed.length
  } catch (e) {
    return 0
  }
}

export async function syncLocalFavoritesToSupabase(session?: any) {
  if (!session?.user?.id || !supabase) return { synced: 0, failed: 0 }

  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    const parsed: string[] = raw ? JSON.parse(raw) : []
    if (parsed.length === 0) return { synced: 0, failed: 0 }

    let synced = 0
    let failed = 0

    for (const snippetId of parsed) {
      try {
        const { data } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('snippet_id', snippetId)
          .limit(1)
          .maybeSingle()
        if (!data) {
          await supabase.from('favorites').insert([{ user_id: session.user.id, snippet_id: snippetId }])
        }
        synced++
      } catch (e) {
        console.warn('Failed to sync favorite', snippetId, e)
        failed++
      }
    }

    // Clear local favorites after attempting sync
    localStorage.removeItem(LOCAL_KEY)
    return { synced, failed }
  } catch (e) {
    console.error('syncLocalFavoritesToSupabase error', e)
    return { synced: 0, failed: 0 }
  }
}
