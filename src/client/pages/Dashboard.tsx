"use client";
import React, { useEffect, useMemo, useState } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { Package, Lock } from "lucide-react"
import { Link } from "@App/useRouter"
import { snippets } from "@/data/snippets"
import ProductCard from "@/components/ProductCard"

export default function Dashboard() {
  const [purchasedIds, setPurchasedIds] = useState<string[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem("purchases")
      const parsed: string[] = raw ? JSON.parse(raw) : []
      setPurchasedIds(parsed)
    } catch (e) {
      setPurchasedIds([])
    }
  }, [])

  const mySnippets = useMemo(() => snippets.filter((s) => purchasedIds.includes(s.id)), [purchasedIds])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="container py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">My Library</h1>
            <p className="mt-1 text-muted-foreground">Access your purchased snippets and subscription</p>
          </div>

          {/* Subscription Card */}
          <div className="mb-12 rounded-2xl border p-8">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h3 className="text-lg font-semibold">All-Access Pass</h3>
                <p className="text-sm text-muted-foreground">Unlock every snippet in the marketplace</p>
              </div>
              <div className="flex gap-3">
                <button className="inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                  $19/month
                </button>
                <button className="inline-flex h-10 items-center rounded-lg border px-6 text-sm font-medium transition-colors hover:bg-accent">
                  $149/year
                </button>
              </div>
            </div>
          </div>

          {mySnippets.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-1 text-lg font-semibold">No snippets yet</h3>
              <p className="mb-6 text-sm text-muted-foreground">Purchase snippets or subscribe to access them here</p>
              <Link to="/" className="inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                Browse Snippets
              </Link>
            </div>
          ) : (
            <div>
              <h2 className="mb-6 text-xl font-semibold">Purchased Snippets</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {mySnippets.map((s) => (
                  <ProductCard key={s.id} snippet={s} />
                ))}
              </div>
            </div>
          )}

          {/* Auth prompt */}
          <div className="mt-8 flex items-center gap-3 rounded-xl bg-secondary/50 p-4">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Sign in to save your purchases and manage your subscription.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
