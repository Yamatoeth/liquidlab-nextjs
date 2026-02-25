"use client";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import { syncLocalFavoritesToSupabase } from "@/lib/favorites";
import { useToast } from "./use-toast";


export function useSession() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { data: urlData, error: urlErr } = await supabase.auth.getSessionFromUrl({ storeSession: true });
        if (!urlErr && urlData?.session && mounted) {
          setSession(urlData.session);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.debug('getSessionFromUrl:', e);
      }
      const { data } = await supabase.auth.getSession();
      if (mounted) setSession(data.session ?? null);
      setLoading(false);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((event, sessionData) => {
      const s = sessionData?.session ?? null;
      if (mounted) setSession(s);
      if (event === 'SIGNED_IN' && s) {
        (async () => {
          try {
            const { synced, failed } = await syncLocalFavoritesToSupabase(s);
            if (synced > 0) {
              toast({ title: 'Favorites synced', description: `${synced} favorite(s) merged.` });
            }
            if (failed > 0) {
              toast({ title: 'Favorites sync partial', description: `${failed} favorite(s) failed to sync.` });
            }
          } catch (e: any) {
            console.warn('Favorites sync failed', e);
            toast({ title: 'Favorites sync failed', description: e?.message || 'Could not sync favorites.' });
          }
        })();
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}

export default useSession;
