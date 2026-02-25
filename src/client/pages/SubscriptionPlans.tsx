"use client";
import React, { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { startSubscription } from '@/lib/stripeClient'
import { useSession } from '@/hooks/useSession'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useToast } from '@/hooks/use-toast'
// Custom font import (retro-futuristic display)
import Image from 'next/image'

const SubscriptionPlans: React.FC = () => {
  const { session } = useSession()
  const { toast } = useToast()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  // Retro-futuristic display font (Google Fonts: Orbitron)
  // Add <Head> for font and meta
  // Animated gradient mesh background
  // Geometric layout, dramatic color, and motion

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
    <>
      {/* Font is preloaded in app/layout.tsx or via next/font for best performance */}
      <div className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Animated mesh gradient background */}
        <div className="absolute inset-0 z-0 animate-gradient-mesh" style={{background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'}} />
        {/* Noise overlay for texture, optimized with next/image */}
        <div className="pointer-events-none absolute inset-0 z-10">
          <Image src="/noise.png" alt="Noise texture" fill priority style={{opacity: 0.08, objectFit: 'cover'}} />
        </div>
        <Navbar />
        <main className="flex-1 relative z-20 flex items-center justify-center">
          <section className="w-full max-w-3xl mx-auto px-6 py-16 rounded-3xl shadow-xl bg-white/10 backdrop-blur-lg border border-white/20">
            <h1 className="text-5xl font-bold mb-10 text-center tracking-tight" style={{fontFamily: 'Orbitron, sans-serif', color: '#fff', letterSpacing: '0.04em', textShadow: '0 4px 32px #302b63'}}>Choose Your Plan</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Monthly Plan */}
              <div className="relative group rounded-2xl p-8 bg-gradient-to-br from-[#302b63] via-[#24243e] to-[#0f0c29] border border-white/20 shadow-lg overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{background: 'url("/mesh.svg")', backgroundSize: 'cover'}} />
                <h2 className="text-2xl font-extrabold mb-2" style={{fontFamily: 'Orbitron, sans-serif', color: '#fff'}}>Monthly</h2>
                <div className="text-4xl font-bold mb-2 text-[#00ffe7]">$9<span className="text-lg font-normal text-[#fff]">/mo</span></div>
                <p className="mb-6 text-white/80">Access the full snippet library. Cancel anytime.</p>
                <button
                  onClick={() => handleSubscribe('monthly')}
                  className="relative inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#00ffe7] text-[#302b63] font-bold text-lg shadow-lg transition-transform transform group-hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#00ffe7] focus:ring-offset-2"
                  style={{fontFamily: 'Orbitron, sans-serif'}}
                  disabled={loadingPlan === 'monthly'}
                >
                  {loadingPlan === 'monthly' ? <LoadingSpinner /> : <span>Subscribe Monthly</span>}
                  <span className="ml-2 animate-pulse">→</span>
                </button>
              </div>
              {/* Yearly Plan */}
              <div className="relative group rounded-2xl p-8 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] border border-white/20 shadow-lg overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{background: 'url("/mesh.svg")', backgroundSize: 'cover'}} />
                <h2 className="text-2xl font-extrabold mb-2" style={{fontFamily: 'Orbitron, sans-serif', color: '#fff'}}>Yearly</h2>
                <div className="text-4xl font-bold mb-2 text-[#ff00c8]">$90<span className="text-lg font-normal text-[#fff]">/yr</span></div>
                <p className="mb-6 text-white/80">Save 20%. Annual access, priority support.</p>
                <button
                  onClick={() => handleSubscribe('yearly')}
                  className="relative inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#ff00c8] text-[#0f0c29] font-bold text-lg shadow-lg transition-transform transform group-hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ff00c8] focus:ring-offset-2"
                  style={{fontFamily: 'Orbitron, sans-serif'}}
                  disabled={loadingPlan === 'yearly'}
                >
                  {loadingPlan === 'yearly' ? <LoadingSpinner /> : <span>Subscribe Yearly</span>}
                  <span className="ml-2 animate-pulse">→</span>
                </button>
              </div>
            </div>
            {/* Decorative divider */}
            <div className="my-12 flex items-center justify-center">
              <div className="w-32 h-1 bg-gradient-to-r from-[#00ffe7] via-[#fff] to-[#ff00c8] rounded-full opacity-60" />
            </div>
            <div className="text-center text-white/70 text-sm mt-6">
              <span>All plans include instant access, cancel anytime, and priority support.</span>
            </div>
          </section>
        </main>
        <Footer />
      </div>
      {/* Mesh animation CSS should be in global styles for instant paint. See app/globals.css. */}
    </>
  )
}

export default SubscriptionPlans;
