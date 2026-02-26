"use client";
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { startSubscription } from "@/lib/stripeClient";
import { useSession } from "@/hooks/useSession";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";

const SubscriptionPlans: React.FC = () => {
  const { session } = useSession();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: "monthly" | "yearly") => {
    setLoadingPlan(plan);
    try {
      await startSubscription({
        plan,
        email: session?.user?.email,
        successUrl: `${window.location.origin}/?sub=success`,
        cancelUrl: `${window.location.origin}/?sub=canceled`,
      });
    } catch (e: any) {
      console.error("Subscription start failed", e);
      toast({ title: "Subscription failed", description: e?.message || "Please try again." });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <Navbar />
      <main className="relative z-20 flex flex-1 items-center justify-center py-16">
        <section className="container">
          <div className="panel mx-auto max-w-4xl p-7 md:p-10">
            <h1 className="mb-3 text-center text-6xl font-semibold">Choose Your Plan</h1>
            <p className="mb-10 text-center text-sm text-muted-foreground">Instant access. Cancel anytime. Priority support.</p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="surface-soft relative p-7">
                <h2 className="text-4xl font-semibold">Monthly</h2>
                <div className="mt-2 text-4xl font-semibold text-primary">
                  $9<span className="text-base font-medium text-muted-foreground">/mo</span>
                </div>
                <p className="mb-6 mt-3 text-sm text-muted-foreground">Access the full snippet library. Cancel anytime.</p>
                <button onClick={() => handleSubscribe("monthly")} className="btn-primary h-11 w-full text-sm" disabled={loadingPlan === "monthly"}>
                  {loadingPlan === "monthly" ? <LoadingSpinner /> : <span>Subscribe Monthly</span>}
                </button>
              </div>
              <div className="surface-soft relative p-7">
                <h2 className="text-4xl font-semibold">Yearly</h2>
                <div className="mt-2 text-4xl font-semibold text-primary">
                  $90<span className="text-base font-medium text-muted-foreground">/yr</span>
                </div>
                <p className="mb-6 mt-3 text-sm text-muted-foreground">Save 20%. Annual access, priority support.</p>
                <button onClick={() => handleSubscribe("yearly")} className="btn-primary h-11 w-full text-sm" disabled={loadingPlan === "yearly"}>
                  {loadingPlan === "yearly" ? <LoadingSpinner /> : <span>Subscribe Yearly</span>}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SubscriptionPlans;
