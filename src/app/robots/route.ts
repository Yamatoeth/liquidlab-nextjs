import { NextRequest } from 'next/server';
import siteConfig from '@/config/seo';

export async function GET(_request: NextRequest) {
  const txt = `User-agent: *
Disallow:
Sitemap: ${siteConfig.siteUrl.replace(/\/$/, '')}/sitemap.xml
`;

  return new Response(txt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
