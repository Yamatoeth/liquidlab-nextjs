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
      const { data, error } = await supabase.auth.getSession();
      console.debug("useSession:getSession", { hasSession: Boolean(data?.session), error });
      if (error) {
        console.error("useSession:getSession failed", error);
      }
      if (mounted) setSession(data?.session ?? null);
      setLoading(false);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((event, sessionData) => {
      console.debug("useSession:onAuthStateChange", { event, hasSession: Boolean(sessionData) });
      const s = sessionData ?? null;
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
  }, [toast]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (session?.access_token) {
      document.cookie = `sb-access-token=${encodeURIComponent(session.access_token)}; Path=/; SameSite=Lax`;
      return;
    }
    document.cookie = "sb-access-token=; Path=/; Max-Age=0; SameSite=Lax";
  }, [session?.access_token]);

  return { session, loading };
}

export default useSession;
