import "./globals.css";
import Providers from "./providers";
import { siteConfig } from "@/config/seo";

export const metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.siteUrl,
    images: [siteConfig.openGraphImage],
  },
  twitter: {
    card: siteConfig.twitter.card ?? siteConfig.twitter.card,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="app-shell">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
