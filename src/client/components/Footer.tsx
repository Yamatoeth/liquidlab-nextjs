"use client";
import { Code2 } from "lucide-react";
import { Link } from "@App/useRouter";

const Footer = () => {
  return (
    <footer className="border-t bg-secondary/50">
      <div className="container py-16">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              <span className="font-semibold">LiquidMktplace</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Premium Shopify Liquid snippets for developers and store owners.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Product</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Browse Snippets</Link>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">All-Access Pass</Link>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Resources</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Documentation</Link>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Installation Guide</Link>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Support</Link>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Company</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">About</Link>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Blog</Link>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} LiquidMktplace. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
