import supabase from './supabase'

const LOCAL_KEY = 'favorites'
let favoritesRemoteUnavailable = false

function isFavoritesNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const maybe = error as { status?: number | string; code?: string; message?: string; details?: string }
  if (maybe.status === 404 || maybe.status === '404') return true
  if (maybe.code === 'PGRST205') return true
  const message = `${maybe.message || ''} ${maybe.details || ''}`.toLowerCase()
  return message.includes('favorites') && (message.includes('not found') || message.includes('does not exist'))
}

function markFavoritesRemoteUnavailable(error: unknown) {
  if (!favoritesRemoteUnavailable && isFavoritesNotFoundError(error)) {
    favoritesRemoteUnavailable = true
    console.warn('[favorites] Supabase table unavailable, using local fallback.')
  }
}

export async function isFavorited(snippetId: string, session?: any) {
  if (session?.user?.id && supabase && !favoritesRemoteUnavailable) {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('snippet_id', snippetId)
        .limit(1)
        .maybeSingle()
      if (error) {
        markFavoritesRemoteUnavailable(error)
        return false
      }
      return !!data
    } catch (e) {
      markFavoritesRemoteUnavailable(e)
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
  if (session?.user?.id && supabase && !favoritesRemoteUnavailable) {
    try {
      // check existing
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('snippet_id', snippetId)
        .limit(1)
        .maybeSingle()

      if (error) {
        markFavoritesRemoteUnavailable(error)
      }

      if (favoritesRemoteUnavailable) {
        return toggleFavorite(snippetId)
      }

      if (data) {
        const { error: deleteError } = await supabase.from('favorites').delete().eq('id', data.id)
        if (deleteError) {
          markFavoritesRemoteUnavailable(deleteError)
          if (favoritesRemoteUnavailable) return toggleFavorite(snippetId)
        }
        return false
      }

      const { error: insertError } = await supabase.from('favorites').insert([{ user_id: session.user.id, snippet_id: snippetId }])
      if (insertError) {
        markFavoritesRemoteUnavailable(insertError)
        if (favoritesRemoteUnavailable) return toggleFavorite(snippetId)
        throw insertError
      }
      return true
    } catch (e) {
      markFavoritesRemoteUnavailable(e)
      if (favoritesRemoteUnavailable) return toggleFavorite(snippetId)
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
  if (session?.user?.id && supabase && !favoritesRemoteUnavailable) {
    try {
      const { count, error } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
      if (error) {
        markFavoritesRemoteUnavailable(error)
        return 0
      }
      return count || 0
    } catch (e) {
      markFavoritesRemoteUnavailable(e)
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
  if (!session?.user?.id || !supabase || favoritesRemoteUnavailable) return { synced: 0, failed: 0 }

  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    const parsed: string[] = raw ? JSON.parse(raw) : []
    if (parsed.length === 0) return { synced: 0, failed: 0 }

    let synced = 0
    let failed = 0

    for (const snippetId of parsed) {
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('snippet_id', snippetId)
          .limit(1)
          .maybeSingle()

        if (error) {
          markFavoritesRemoteUnavailable(error)
          failed++
          if (favoritesRemoteUnavailable) break
          continue
        }

        if (!data) {
          const { error: insertError } = await supabase
            .from('favorites')
            .insert([{ user_id: session.user.id, snippet_id: snippetId }])
          if (insertError) {
            markFavoritesRemoteUnavailable(insertError)
            failed++
            if (favoritesRemoteUnavailable) break
            continue
          }
        }
        synced++
      } catch (e) {
        markFavoritesRemoteUnavailable(e)
        console.warn('Failed to sync favorite', snippetId, e)
        failed++
        if (favoritesRemoteUnavailable) break
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
