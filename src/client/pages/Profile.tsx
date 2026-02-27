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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, CreditCard, Save } from "lucide-react";

export default function Profile() {
  const { session, loading } = useSession();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [portalLoading, setPortalLoading] = useState(false);

  const { profile: realtimeProfile, loading: realtimeLoading, error: realtimeError } = useRealtimeProfile(session?.user?.id);

  useEffect(() => {
    if (realtimeProfile) {
      setProfile(realtimeProfile);
      setName(realtimeProfile?.full_name || "");
      setAvatarUrl(realtimeProfile?.avatar_url || "");
    }
    if (realtimeError) setError(realtimeError);
  }, [realtimeProfile, realtimeError]);

  const handleSave = async () => {
    if (!session?.user?.id) return;
    setSaving(true);
    setError(null);
    try {
      const updates = {
        id: session.user.id,
        full_name: name || null,
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("profiles").upsert(updates, { onConflict: "id" });
      if (error) throw error;
      toast({ title: "Profile saved", description: "Your profile has been updated successfully." });
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

  if (showLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="container flex flex-1 items-center justify-center py-20">
          <LoadingSpinner />
        </main>
        <Footer />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="container flex flex-1 items-center justify-center py-20">
          <div className="text-center p-8">
            <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
            <p className="text-lg text-muted-foreground">Please sign in to view your profile.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-gray-900/20 to-gray-800/20">
        <div className="container py-12 md:py-20">
          <h1 className="mb-8 text-4xl font-bold tracking-tight md:text-5xl">Your Profile</h1>

          {error && (
            <div className="mb-6">
              <ErrorAlert message={error} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <Card className="bg-card/80 border-border/60">
                <CardHeader className="items-center text-center">
                  <Avatar className="w-24 h-24 mb-4 border-2 border-primary/50">
                    <AvatarImage src={avatarUrl} alt={name} />
                    <AvatarFallback><User className="w-10 h-10" /></AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-2xl">{name || "Your Name"}</CardTitle>
                  <CardDescription>{session.user.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    id="avatarUrl"
                    type="text"
                    placeholder="Avatar URL"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2 space-y-8">
              <Card className="bg-card/80 border-border/60">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details here.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-1">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">Email</label>
                    <p className="mt-1 text-sm text-muted-foreground">{session.user.email}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? <LoadingSpinner className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-card/80 border-border/60">
                <CardHeader>
                  <CardTitle>Subscription</CardTitle>
                  <CardDescription>Manage your billing and subscription plan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-semibold">
                        {profile?.subscription_plan ? profile.subscription_plan : "No active plan"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Status: {profile?.subscription_status ?? "none"}
                      </p>
                    </div>
                    {profile?.subscription_end_date && (
                      <p className="text-sm">
                        Ends on {new Date(profile.subscription_end_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleManage}
                    disabled={portalLoading || !profile?.stripe_customer_id}
                    variant="outline"
                  >
                    {portalLoading ? <LoadingSpinner className="mr-2" /> : <CreditCard className="mr-2 h-4 w-4" />}
                    Manage Subscription
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
