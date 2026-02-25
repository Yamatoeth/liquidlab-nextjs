"use client";
import { useParams, Link } from "@App/useRouter";
import { snippets } from "@/data/snippets";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Check, Copy, Lock, Sparkles } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorAlert from '@/components/ui/ErrorAlert'
import SyntaxHighlighter from "@/components/SyntaxHighlighter";
import { startCheckout } from "@/lib/stripeClient";
import useSession from "@/hooks/useSession";

const ProductDetail = () => {
  const { id } = useParams();
  const snippet = snippets.find((s) => s.id === id);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const { session } = useSession();
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [purchased, setPurchased] = useState(() => {
    try {
      const raw = localStorage.getItem("purchases");
      if (!raw) return false;
      const parsed: string[] = JSON.parse(raw);
      return parsed.includes(id || "");
    } catch (e) {
      return false;
    }
  });

  const savePurchase = (snippetId: string) => {
    try {
      const raw = localStorage.getItem("purchases");
      const parsed: string[] = raw ? JSON.parse(raw) : [];
      if (!parsed.includes(snippetId)) {
        parsed.push(snippetId);
        localStorage.setItem("purchases", JSON.stringify(parsed));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!snippet) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container flex flex-1 items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Snippet not found</h1>
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
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Browse
          </Link>

          <div className="grid gap-12 lg:grid-cols-5">
            {/* Left: Details */}
            <div className="lg:col-span-2">
              <span className="mb-3 inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                {snippet.category}
              </span>
              <h1 className="mb-4 text-3xl font-bold md:text-4xl">{snippet.title}</h1>
              <p className="mb-8 text-muted-foreground">{snippet.description}</p>

              <div className="mb-8 space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Features
                </h3>
                <ul className="space-y-2">
                  {snippet.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <Check className="h-4 w-4 text-foreground" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">${snippet.price}</span>
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
                      setCheckoutError(null)
                      try {
                        if (!id) throw new Error('Missing snippet id')
                        setCheckoutLoading(true)
                        await startCheckout({
                          snippetId: id,
                          amount: Number(snippet.price),
                          email: session?.user?.email,
                          successUrl: `${window.location.origin}/snippets/${id}?checkout=success`,
                          cancelUrl: `${window.location.origin}/snippets/${id}?checkout=canceled`,
                        })
                      } catch (e: any) {
                        console.error(e)
                        setCheckoutError(e?.message || 'Please try again.')
                        toast({ title: 'Checkout failed', description: e?.message || 'Please try again.' })
                      } finally {
                        setCheckoutLoading(false)
                      }
                    }}
                    className="flex h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    disabled={checkoutLoading}
                  >
                    {checkoutLoading ? <LoadingSpinner /> : 'Buy this Snippet'}
                  </button>
                </div>

                <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors hover:bg-accent">
                  <Sparkles className="h-4 w-4" />
                  Unlock All with Subscription
                </button>
              </div>
            </div>

            {/* Right: Code Preview */}
            <div className="lg:col-span-3">
              <div className="overflow-hidden rounded-2xl border">
                <div className="flex items-center justify-between border-b bg-secondary/50 px-4 py-3">
                  <span className="text-xs font-medium text-muted-foreground">
                    {snippet.id}.liquid
                  </span>
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
                  <div
                    className="max-h-[480px] overflow-auto bg-black rounded-b-2xl"
                  >
                    <SyntaxHighlighter code={snippet.code} language="liquid" />
                  </div>
                  {!purchased && (
                    <div className="absolute inset-0 flex items-end pointer-events-none">
                      <div className="w-full p-6 text-center bg-background/90 backdrop-blur-sm rounded-t-2xl shadow-lg md:bg-transparent md:backdrop-blur-0 md:rounded-none md:shadow-none">
                        <Lock className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                        <p className="text-sm font-medium">Purchase to unlock full code</p>
                        {/* <p className="mt-1 text-xs text-muted-foreground">
                          Buy for ${snippet.price} or subscribe for full access
                        </p> */}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Guidelines Section */}
          <div className="mt-12 rounded-2xl border bg-secondary/50 p-8">
            <h2 className="text-xl font-bold mb-4">Setup & Customization Guidelines</h2>
            <p className="mb-4 text-muted-foreground">
              Here you'll find instructions on how to set up and modify this snippet. 
              You can easily change colors, sizes, and other properties to fit your store's design.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <span className="font-semibold">Setup:</span> Copy the code and paste it into your Shopify theme file as instructed.
              </li>
              <li>
                <span className="font-semibold">Color:</span> Look for variables or CSS classes in the snippet to adjust color values.
              </li>
              <li>
                <span className="font-semibold">Size:</span> Change width, height, or font-size properties as needed.
              </li>
              <li>
                <span className="font-semibold">Customization:</span> Refer to comments in the code for further customization options.
              </li>
              <li>
                <span className="font-semibold">Support:</span> If you need help, contact us or check our documentation.
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
