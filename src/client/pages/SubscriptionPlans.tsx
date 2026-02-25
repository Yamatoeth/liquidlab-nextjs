"use client";
import React, { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { startSubscription } from '@/lib/stripeClient'
import { useSession } from '@/hooks/useSession'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useToast } from '@/hooks/use-toast'

export default function SubscriptionPlans() {
  const { session } = useSession()
  const { toast } = useToast()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    setLoadingPlan(plan)
    try {
      await startSubscription({
        plan,
        email: session?.user?.email,
        successUrl: `${window.location.origin}/?sub=success`,
        cancelUrl: `${window.location.origin}/?sub=canceled`,
      })
    } catch (e: any) {
      console.error('Subscription start failed', e)
      toast({ title: 'Subscription failed', description: e?.message || 'Please try again.' })
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container py-12">
          <h1 className="mb-6 text-3xl font-bold">Subscription Plans</h1>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border p-6">
              <h2 className="text-xl font-semibold">Monthly</h2>
              <p className="mt-2 text-muted-foreground">$9 / month — access to entire snippet library</p>
              <div className="mt-4">
                <button
                  onClick={() => handleSubscribe('monthly')}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  {loadingPlan === 'monthly' ? <LoadingSpinner /> : 'Subscribe Monthly'}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border p-6">
              <h2 className="text-xl font-semibold">Yearly</h2>
              <p className="mt-2 text-muted-foreground">$90 / year — save 20% compared to monthly</p>
              <div className="mt-4">
                <button
                  onClick={() => handleSubscribe('yearly')}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  {loadingPlan === 'yearly' ? <LoadingSpinner /> : 'Subscribe Yearly'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
