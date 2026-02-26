"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import supabase from "@/lib/supabase";
import { createCustomerPortalSession } from "@/lib/stripeClient";
import { useSession } from "@/hooks/useSession";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import useRealtimeProfile from "@/hooks/useRealtimeProfile";

export default function Profile() {
  const { session, loading } = useSession();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [portalLoading, setPortalLoading] = useState(false);

  const { profile: realtimeProfile, loading: realtimeLoading, error: realtimeError } = useRealtimeProfile(session?.user?.id);

  useEffect(() => {
    if (realtimeProfile) {
      setProfile(realtimeProfile);
      setName(realtimeProfile?.full_name || "");
      setAvatar(realtimeProfile?.avatar_url || "");
    }
    if (realtimeError) setError(realtimeError);
  }, [realtimeProfile, realtimeError]);

  if (loading) {
    return null;
  }

  const handleSave = async () => {
    if (!session?.user?.id) return;
    setSaving(true);
    setError(null);
    try {
      const updates = {
        id: session.user.id,
        email: session.user.email,
        full_name: name || null,
        avatar_url: avatar || null,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("profiles").upsert([updates], { onConflict: "id" });
      if (error) throw error;
      toast({ title: "Profile saved" });
    } catch (e: any) {
      console.error("Failed to save profile", e);
      setError(e?.message || "Failed to save");
      toast({ title: "Save failed", description: e?.message || "Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleManage = async () => {
    if (!profile?.stripe_customer_id) return toast({ title: "No customer id", description: "No Stripe customer associated" });
    try {
      setPortalLoading(true);
      await createCustomerPortalSession({ customerId: profile.stripe_customer_id, returnUrl: `${window.location.origin}/profile` });
    } catch (e: any) {
      console.error("Failed to open customer portal", e);
      toast({ title: "Could not open portal", description: e?.message || "Please try again." });
    } finally {
      setPortalLoading(false);
    }
  };

  const showLoading = loading || realtimeLoading;

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="container flex flex-1 items-center justify-center py-20">
          <div className="panel text-center p-8">
            <p className="text-lg">Please sign in to view your profile.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container py-12">
          <h1 className="mb-6 text-5xl font-semibold">Your Profile</h1>

          {showLoading && (
            <div className="mb-4">
              <LoadingSpinner />
            </div>
          )}

          {error && (
            <div className="mb-4">
              <ErrorAlert message={error} />
            </div>
          )}

          <div className="panel max-w-xl space-y-4 p-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground">Email</label>
              <div className="mt-1 text-sm">{profile?.email ?? session.user.email}</div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-muted-foreground">Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="input-premium" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-muted-foreground">Avatar URL</label>
              <input value={avatar} onChange={(e) => setAvatar(e.target.value)} className="input-premium" />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground">Subscription</label>
              <div className="mt-1 text-sm">
                {profile?.subscription_status ?? "none"} {profile?.subscription_plan ? `· ${profile.subscription_plan}` : ""}
                {profile?.subscription_end_date ? ` · ends ${new Date(profile.subscription_end_date).toLocaleDateString()}` : ""}
              </div>
              <div className="mt-3">
                <button
                  onClick={handleManage}
                  disabled={portalLoading || !profile?.stripe_customer_id}
                  className="btn-secondary h-10 px-4 text-sm"
                >
                  {portalLoading ? <LoadingSpinner /> : "Manage Subscription"}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button onClick={handleSave} disabled={saving} className="btn-primary h-10 px-4 text-sm">
                {saving ? <LoadingSpinner /> : "Save Profile"}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
