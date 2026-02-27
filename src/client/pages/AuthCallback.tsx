"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@App/useRouter";
import supabase from "@/lib/supabase";

type CallbackState = {
  error: string | null;
  message: string;
};

export default function AuthCallback() {
  const navigate = useNavigate();
  const [state, setState] = useState<CallbackState>({
    error: null,
    message: "Finalizing sign-in...",
  });

  const nextPath = useMemo(() => {
    if (typeof window === "undefined") return "/dashboard";
    const params = new URLSearchParams(window.location.search);
    return params.get("next") || "/dashboard";
  }, []);

  useEffect(() => {
    let cancelled = false;

    const finalizeOAuth = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (!code) {
          const hash = window.location.hash ? window.location.hash.slice(1) : "";
          const hashParams = new URLSearchParams(hash);
          const accessToken = hashParams.get("access_token");

          if (accessToken) {
            console.debug("auth.callback: implicit flow token detected in URL hash");
          } else {
            throw new Error("Missing OAuth code/token in callback URL.");
          }
        } else {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          console.debug("auth.callback: exchangeCodeForSession result", {
            hasSession: Boolean(data?.session),
            hasUser: Boolean(data?.user),
            error,
          });

          if (error) throw error;
        }

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        console.debug("auth.callback: getSession after callback", {
          hasSession: Boolean(sessionData?.session),
          sessionError,
        });

        if (sessionError) throw sessionError;
        if (!sessionData?.session) {
          throw new Error("OAuth callback completed but no session was found.");
        }

        if (!cancelled) {
          navigate(nextPath);
        }
      } catch (error: any) {
        console.error("auth.callback: OAuth finalization failed", error);
        if (!cancelled) {
          setState({
            error: error?.message || "Could not finish Google sign-in.",
            message: "Sign-in failed.",
          });
        }
      }
    };

    finalizeOAuth();

    return () => {
      cancelled = true;
    };
  }, [navigate, nextPath]);

  return (
    <div className="container py-16 md:py-24">
      <div className="panel mx-auto max-w-md p-7 md:p-8">
        <h2 className="mb-2 text-3xl font-semibold">Google Sign-In</h2>
        <p className="text-sm text-muted-foreground">{state.message}</p>
        {state.error ? <p className="mt-3 text-sm text-red-400">{state.error}</p> : null}
      </div>
    </div>
  );
}
