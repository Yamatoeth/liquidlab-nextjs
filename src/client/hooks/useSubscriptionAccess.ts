import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import { useSession } from "@/hooks/useSession";

type State = {
  hasActiveSubscription: boolean;
  loading: boolean;
};

export function useSubscriptionAccess(): State {
  const { session, loading: sessionLoading } = useSession();
  const [state, setState] = useState<State>({
    hasActiveSubscription: false,
    loading: true,
  });

  useEffect(() => {
    let active = true;

    if (sessionLoading) {
      setState((prev) => ({ ...prev, loading: true }));
      return () => {
        active = false;
      };
    }

    if (!session?.user?.id) {
      setState({ hasActiveSubscription: false, loading: false });
      return () => {
        active = false;
      };
    }

    const nowIso = new Date().toISOString();
    supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("status", "active")
      .gt("current_period_end", nowIso)
      .limit(1)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setState({ hasActiveSubscription: false, loading: false });
          return;
        }
        setState({ hasActiveSubscription: Array.isArray(data) && data.length > 0, loading: false });
      })
      .catch(() => {
        if (!active) return;
        setState({ hasActiveSubscription: false, loading: false });
      });

    return () => {
      active = false;
    };
  }, [session?.user?.id, sessionLoading]);

  return state;
}

export default useSubscriptionAccess;
