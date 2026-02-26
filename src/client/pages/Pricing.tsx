"use client";
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PricingCard from '@/components/PricingCard';
import { pricingPlans } from '@/data/pricing';

const PricingPage: React.FC = () => {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="container py-16">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <h1 className="mb-2 text-4xl font-bold">Pricing</h1>
            <p className="text-muted-foreground">Choose the plan that fits your team. Annual billing saves 2 months.</p>
          </div>

          <div className="mb-8 flex items-center justify-center gap-4">
            <button onClick={() => setBilling('monthly')} className={`px-4 py-2 rounded ${billing === 'monthly' ? 'bg-primary text-white' : 'bg-card'}`}>
              Monthly
            </button>
            <button onClick={() => setBilling('yearly')} className={`px-4 py-2 rounded ${billing === 'yearly' ? 'bg-primary text-white' : 'bg-card'}`}>
              Yearly
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {pricingPlans.map((p) => (
              <PricingCard key={p.id} plan={p} billing={billing} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;
