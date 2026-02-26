"use client";
import { Code2 } from "lucide-react";
import { Link } from "@App/useRouter";

const Footer = () => {
  return (
    <footer className="border-t border-[rgba(216,178,110,0.2)] bg-[rgba(10,14,20,0.84)]">
      <div className="container py-16">
        <div className="panel p-8 md:p-10">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" />
                <span className="font-display text-xl font-semibold">LiquidMarketplace</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                A premium library of ready-to-integrate 3D animations and visual interactions.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-display text-lg font-semibold">Product</h4>
              <div className="flex flex-col gap-2">
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                  Catalog
                </Link>
                <Link to="/subscribe" className="text-sm text-muted-foreground hover:text-foreground">
                  Subscriptions
                </Link>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                  My library
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-display text-lg font-semibold">Resources</h4>
              <div className="flex flex-col gap-2">
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                  Documentation
                </Link>
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                  Integration guide
                </Link>
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                  Support
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-display text-lg font-semibold">Company</h4>
              <div className="flex flex-col gap-2">
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                  About
                </Link>
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                  Partnerships
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-[rgba(216,178,110,0.2)] pt-6">
            <p className="text-center text-xs tracking-wide text-muted-foreground">
              © {new Date().getFullYear()} LiquidMarketplace. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
