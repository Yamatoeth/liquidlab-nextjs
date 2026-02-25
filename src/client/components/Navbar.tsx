"use client";
import { Link } from "@App/useRouter";
import { Code2, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from '@/hooks/use-toast'
import LoadingSpinner from './ui/LoadingSpinner'
import { useSession } from "@/hooks/useSession";
import auth from "@/lib/auth";
import { getFavoritesCount } from '@/lib/favorites'

const Navbar = () => {
  const { session, loading } = useSession();
  const [email, setEmail] = useState<string | null>(null);
  const [favCount, setFavCount] = useState(0)
  const [favLoading, setFavLoading] = useState(false)
  const [favError, setFavError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    setEmail(session?.user?.email ?? null);
  }, [session]);

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setFavLoading(true)
        const c = await getFavoritesCount(session)
        if (mounted) setFavCount(c)
      } catch (e: unknown) {
        console.warn('Failed to load favorites count', e)
        if (e && typeof e === 'object' && 'message' in e && typeof (e as any).message === 'string') {
          setFavError((e as any).message)
          toast({ title: 'Favorites load failed', description: (e as any).message })
        } else {
          setFavError('Failed to load')
          toast({ title: 'Favorites load failed', description: 'Could not fetch favorites count.' })
        }
      } finally {
        if (mounted) setFavLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [session])

  const [open, setOpen] = useState(false)

  if (loading) {
    // Optionally, show a spinner or nothing while session is loading
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Code2 className="h-6 w-6" />
          <span className="text-lg font-semibold tracking-tight">LiquidMktplace</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Browse
          </Link>
          <Link to="/subscribe" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Subscribe
          </Link>
          <Link to="/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center gap-2">
            My Library
            {favCount > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {favLoading ? <LoadingSpinner size={12} /> : favCount}
              </span>
            )}
          </Link>
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border p-1"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <span className="hidden text-sm text-muted-foreground md:block">{email}</span>
              <button
                onClick={async () => await auth.signOut()}
                className="inline-flex h-9 items-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-accent"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                className="inline-flex h-9 items-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-accent"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
          <div className="w-72 max-w-full bg-background p-4 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                <Code2 className="h-6 w-6" />
                <span className="text-lg font-semibold tracking-tight">LiquidMktplace</span>
              </Link>
              <button aria-label="Close menu" onClick={() => setOpen(false)} className="p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-3">
              <Link to="/" className="text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>
                Browse
              </Link>
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>
                My Library
              </Link>

              <div className="mt-4 border-t pt-4">
                {session ? (
                  <>
                    <div className="mb-3 text-sm text-muted-foreground">{session?.user?.email}</div>
                    <button
                      onClick={async () => {
                        await auth.signOut();
                        setOpen(false)
                      }}
                      className="inline-flex w-full items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/signin" className="inline-flex w-full items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium" onClick={() => setOpen(false)}>
                      Sign In
                    </Link>
                    <Link to="/signup" className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" onClick={() => setOpen(false)}>
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
