"use client";
import React from "react";
import { testimonials } from "../data/testimonials";

const Testimonials: React.FC = () => {
  return (
    <section className="container py-12">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="mb-3 text-4xl font-semibold">What designers & engineers say</h2>
        <p className="mb-8 text-sm text-muted-foreground">
          Real teams using premium 3D visuals for product and marketing.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {testimonials.map((t) => (
          <blockquote key={t.id} className="panel p-6">
            <p className="mb-4 text-sm text-muted-foreground">“{t.quote}”</p>
            <div className="text-sm font-semibold">{t.author}</div>
            <div className="text-xs text-muted-foreground">{t.role}</div>
          </blockquote>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
