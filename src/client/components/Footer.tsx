"use client";
import { Code2 } from "lucide-react";
import { Link } from "@App/useRouter";

const Footer = () => {
  return (
    <footer className="border-t bg-secondary/30">
      <div className="container py-16">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              <span className="font-semibold">LiquidMarketplace</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Une bibliothèque premium d&apos;animations 3D et d&apos;interactions visuelles prêtes à intégrer.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Produit</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Catalogue</Link>
              <Link to="/subscribe" className="text-sm text-muted-foreground hover:text-foreground">Abonnements</Link>
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Ma bibliothèque</Link>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Ressources</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Documentation</Link>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Guide d&apos;intégration</Link>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Support</Link>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Entreprise</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">À propos</Link>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Partenariats</Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} LiquidMarketplace. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
