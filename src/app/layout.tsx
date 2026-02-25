"use client";
import "./globals.css";
import Providers from "./providers"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
<html lang="en">
  <head>
    <meta charSet="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Liquid Lab</title>
    <meta name="description" content="Liquid Lab — a small marketplace of snippets, themes, and utilities for modern storefronts." />
    <meta name="author" content="Yamatoeth" />

    <meta property="og:title" content="Liquid Lab" />
    <meta property="og:description" content="Discover and purchase curated snippets, components, and integrations for storefronts and web apps." />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="/favicon-32.png" />
    <meta name="theme-color" content="#0ea5a4" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@Yamatoeth" />
    <meta name="twitter:image" content="/favicon-32.png" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="icon" href="/favicon-32.png" sizes="32x32" />
  </head>

  <body>
    <Providers>{children}</Providers>
    
  </body>
</html>
);
}
