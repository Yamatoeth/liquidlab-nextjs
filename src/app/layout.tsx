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
      <head>
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        {/* Bubble-style display font for branding */}
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="app-shell">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
