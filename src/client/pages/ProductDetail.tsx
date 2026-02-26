"use client";
import { useParams, Link } from "@App/useRouter";
import { snippets } from "@/data/snippets";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Check, Copy, Lock, Sparkles } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import SyntaxHighlighter from "@/components/SyntaxHighlighter";
import { startCheckout } from "@/lib/stripeClient";
import useSession from "@/hooks/useSession";

const ProductDetail = () => {
  const { id } = useParams();
  const snippetId = Array.isArray(id) ? id[0] : id;
  const snippet = snippets.find((s) => s.id === snippetId);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const { session } = useSession();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [purchased] = useState(() => {
    try {
      const raw = localStorage.getItem("purchases");
      if (!raw) return false;
      const parsed: string[] = JSON.parse(raw);
      return parsed.includes(snippetId || "");
    } catch (e) {
      return false;
    }
  });

  if (!snippet) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container flex flex-1 items-center justify-center py-20">
          <div className="panel text-center p-8">
            <h1 className="text-3xl font-semibold">Snippet not found</h1>
            <Link to="/" className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Browse
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="container py-12">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Browse
          </Link>

          <div className="grid gap-12 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <span className="premium-chip mb-3 inline-flex px-3 py-1 text-xs font-medium">{snippet.category}</span>
              <h1 className="mb-4 text-5xl font-semibold">{snippet.title}</h1>
              <p className="mb-8 text-muted-foreground">{snippet.description}</p>

              <div className="mb-8 space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Features</h3>
                <ul className="space-y-2">
                  {snippet.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-semibold">${snippet.price}</span>
                  <span className="text-sm text-muted-foreground">one-time</span>
                </div>

                <div>
                  {checkoutError && (
                    <div className="mb-3">
                      <ErrorAlert message={checkoutError} />
                    </div>
                  )}
                  <button
                    onClick={async () => {
                      setCheckoutError(null);
                      try {
                        if (!snippetId) throw new Error("Missing snippet id");
                        setCheckoutLoading(true);
                        await startCheckout({
                          snippetId,
                          amount: Number(snippet.price),
                          email: session?.user?.email,
                          successUrl: `${window.location.origin}/snippets/${snippetId}?checkout=success`,
                          cancelUrl: `${window.location.origin}/snippets/${snippetId}?checkout=canceled`,
                        });
                      } catch (e: any) {
                        console.error(e);
                        setCheckoutError(e?.message || "Please try again.");
                        toast({ title: "Checkout failed", description: e?.message || "Please try again." });
                      } finally {
                        setCheckoutLoading(false);
                      }
                    }}
                    className="btn-primary h-12 w-full text-sm"
                    disabled={checkoutLoading}
                  >
                    {checkoutLoading ? <LoadingSpinner /> : "Buy this Snippet"}
                  </button>
                </div>

                <button className="btn-secondary flex h-12 w-full items-center justify-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4" />
                  Unlock All with Subscription
                </button>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="panel overflow-hidden">
                <div className="flex items-center justify-between border-b border-[rgba(216,178,110,0.2)] bg-[rgba(19,26,36,0.65)] px-4 py-3">
                  <span className="text-xs font-medium text-muted-foreground">{snippet.id}.liquid</span>
                  {purchased ? (
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy Code
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Lock className="h-3.5 w-3.5" />
                      Purchase to copy
                    </span>
                  )}
                </div>

                <div className="relative">
                  <div className="max-h-[480px] overflow-auto rounded-b-2xl bg-black">
                    <SyntaxHighlighter code={snippet.code} language="liquid" />
                  </div>
                  {!purchased && (
                    <div className="pointer-events-none absolute inset-0 flex items-end">
                      <div className="w-full rounded-t-2xl bg-background/88 p-6 text-center shadow-lg backdrop-blur-sm md:rounded-none md:bg-transparent md:shadow-none md:backdrop-blur-0">
                        <Lock className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                        <p className="text-sm font-medium">Purchase to unlock full code</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="panel mt-12 p-8">
            <h2 className="mb-4 text-4xl font-semibold">Setup & Customization Guidelines</h2>
            <p className="mb-4 text-muted-foreground">
              Here you'll find instructions on how to set up and modify this snippet. You can easily change colors, sizes,
              and other properties to fit your store's design.
            </p>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">Setup:</span> Copy the code and paste it into your Shopify
                theme file as instructed.
              </li>
              <li>
                <span className="font-semibold text-foreground">Color:</span> Look for variables or CSS classes in the snippet
                to adjust color values.
              </li>
              <li>
                <span className="font-semibold text-foreground">Size:</span> Change width, height, or font-size properties as
                needed.
              </li>
              <li>
                <span className="font-semibold text-foreground">Customization:</span> Refer to comments in the code for further
                customization options.
              </li>
              <li>
                <span className="font-semibold text-foreground">Support:</span> If you need help, contact us or check our
                documentation.
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
