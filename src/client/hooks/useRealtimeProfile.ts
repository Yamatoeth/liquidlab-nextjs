import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase'

export default function useRealtimeProfile(userId?: string | null) {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    let mounted = true
    setLoading(true)

    // initial load
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()
        if (error) throw error
        if (mounted) setProfile(data)
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load profile')
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    // subscribe to realtime changes for this profile
    const channel = supabase
      .channel(`public:profiles:id=eq.${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, (payload) => {
        try {
          const newRow = payload.new
          setProfile((prev: any) => ({ ...prev, ...newRow }))
        } catch (err) {
          console.error('Realtime profile update error', err)
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // subscribed
        }
      })

    return () => {
      mounted = false
      try { supabase.removeChannel(channel) } catch (e) { /* ignore */ }
    }
  }, [userId])

  return { profile, setProfile, loading, error }
}
