"use client";
import React from 'react';

interface PricingCardProps {
  plan: { id: string; name: string; monthly: number; yearly: number; features: string[] };
  billing: 'monthly' | 'yearly';
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, billing }) => {
  const price = billing === 'monthly' ? plan.monthly : plan.yearly;
  const suffix = billing === 'monthly' ? '/mo' : '/yr';

  return (
    <div className="rounded-2xl border bg-card/60 p-6 text-center">
      <h3 className="mb-2 text-xl font-semibold">{plan.name}</h3>
      <div className="mb-4 text-3xl font-bold">${price}<span className="text-sm font-medium text-muted-foreground">{suffix}</span></div>
      <ul className="mb-6 text-sm text-muted-foreground">
        {plan.features.map((f) => (
          <li key={f} className="py-1">{f}</li>
        ))}
      </ul>
      <button className="btn-primary w-full px-4 py-2 text-sm">Start free trial</button>
    </div>
  );
};

export default PricingCard;
