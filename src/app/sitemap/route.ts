import { NextRequest } from 'next/server';
import siteConfig from '@/config/seo';
import { snippets } from '@/client/data/snippets';
import { animations3D } from '@/data/animations';

function url(loc: string) {
  return `${siteConfig.siteUrl.replace(/\/$/, '')}${loc.startsWith('/') ? loc : `/${loc}`}`;
}

export async function GET(_request: NextRequest) {
  const staticRoutes = ['/', '/profile', '/subscribe', '/dashboard', '/signup', '/signin'];

  const pages = [
    ...staticRoutes.map((r) => url(r)),
    // snippets
    ...snippets.map((s) => url(`/snippets/${s.id}`)),
    // animations
    ...animations3D.map((a) => url(`/animations/${a.id}`)),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${pages
      .map(
        (p) => `<url><loc>${p}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`
      )
      .join('\n')}
  </urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
