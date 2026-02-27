"use client";
import { Link } from "@App/useRouter";
import { Code2, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "./ui/LoadingSpinner";
import { useSession } from "@/hooks/useSession";
import auth from "@/lib/auth";
import { getFavoritesCount } from "@/lib/favorites";

const Navbar = () => {
  const { session, loading } = useSession();
  const [email, setEmail] = useState<string | null>(null);
  const [favCount, setFavCount] = useState(0);
  const [favLoading, setFavLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setEmail(session?.user?.email ?? null);
  }, [session]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setFavLoading(true);
        const c = await getFavoritesCount(session);
        if (mounted) setFavCount(c);
      } catch (e: unknown) {
        console.warn("Failed to load favorites count", e);
        if (e && typeof e === "object" && "message" in e && typeof (e as any).message === "string") {
          toast({ title: "Favorites load failed", description: (e as any).message });
        } else {
          toast({ title: "Favorites load failed", description: "Could not fetch favorites count." });
        }
      } finally {
        if (mounted) setFavLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [session, toast]);

  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const headerEl = () => document.querySelector("header");
    const hero = document.querySelector(".hero-section");

    const onScroll = () => {
      const heroHeight = hero ? (hero as HTMLElement).offsetHeight : window.innerHeight;
      const hdr = headerEl();
      const headerHeight = hdr ? (hdr as HTMLElement).offsetHeight : 0;
      const threshold = Math.max(0, heroHeight - headerHeight - 10);
      setSolid(window.scrollY > threshold);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (loading) {
    return null;
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        solid ? "border-[rgba(216,178,110,0.08)] bg-[rgba(9,13,20,0.6)] backdrop-blur-sm" : "border-transparent bg-transparent"
      }`}
    >
      <div className="container flex h-20 items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(216,178,110,0.45)] bg-[rgba(216,178,110,0.1)]">
            <Code2 className="h-6 w-6 text-primary" strokeWidth={1.6} />
          </span>
          <span
            className="text-3xl font-display tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-[#f8e6b3] via-[#d8b26e] to-[#b8860b]"
            style={{
              fontFamily: "'Baloo 2', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
              fontWeight: 800,
              textShadow: "0 8px 28px rgba(216,178,110,0.25)",
              letterSpacing: "0.5px",
            }}
          >
            LiquidLab
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link to="/" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
            Browse
          </Link>
          <Link to="/subscribe" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link
            to="/dashboard"
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground flex items-center gap-2"
          >
            Dashboard
            {favCount > 0 && (
              <span className="inline-flex min-w-7 items-center justify-center rounded-full border border-[rgba(216,178,110,0.45)] bg-[rgba(216,178,110,0.14)] px-2 py-0.5 text-xs font-semibold text-primary">
                {favLoading ? <LoadingSpinner size={12} /> : favCount}
              </span>
            )}
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <button
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(216,178,110,0.35)] bg-[rgba(216,178,110,0.08)]"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {session ? (
            <>
              <Link to="/profile" className="btn-secondary h-10 px-4 text-sm">
                Profile
              </Link>
              <button onClick={async () => await auth.signOut()} className="btn-secondary h-10 px-5 text-sm">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="btn-secondary h-10 px-5 text-sm">
                Sign In
              </Link>
              <Link to="/signup" className="btn-primary h-10 px-5 text-sm">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/60" onClick={() => setOpen(false)} />
          <div className="w-80 max-w-full border-l border-[rgba(216,178,110,0.3)] bg-[rgba(9,13,20,0.9)] p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                <Code2 className="h-6 w-6 text-primary" strokeWidth={1.6} />
                <span
                  className="font-display text-2xl bg-clip-text text-transparent bg-gradient-to-r from-[#f8e6b3] via-[#d8b26e] to-[#b8860b]"
                  style={{
                    fontFamily: "'Baloo 2', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
                    fontWeight: 800,
                    textShadow: "0 6px 20px rgba(216,178,110,0.18)",
                  }}
                >
                  LiquidLab
                </span>
              </Link>
              <button aria-label="Close menu" onClick={() => setOpen(false)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border">
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              <Link to="/" className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground" onClick={() => setOpen(false)}>
                Browse
              </Link>
              <Link to="/subscribe" className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground" onClick={() => setOpen(false)}>
                Pricing
              </Link>
              <Link to="/dashboard" className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground" onClick={() => setOpen(false)}>
                Dashboard
              </Link>

              <div className="mt-4 border-t border-[rgba(216,178,110,0.2)] pt-4">
                {session ? (
                  <>
                    <Link to="/profile" className="btn-secondary h-10 w-full text-sm mb-2" onClick={() => setOpen(false)}>
                      Profil
                    </Link>
                    <button
                      onClick={async () => {
                        await auth.signOut();
                        setOpen(false);
                      }}
                      className="btn-secondary h-10 w-full text-sm"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/signin" className="btn-secondary h-10 w-full text-sm" onClick={() => setOpen(false)}>
                      Sign In
                    </Link>
                    <Link to="/signup" className="btn-primary mt-2 h-10 w-full text-sm" onClick={() => setOpen(false)}>
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
