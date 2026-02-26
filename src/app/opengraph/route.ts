import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Liquid Lab';

  const safeTitle = title.replaceAll('&', '&amp;').replaceAll('<', '&lt;');

  const svg = `<?xml version="1.0" encoding="utf-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#04263a"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)" />
    <text x="60" y="320" font-family="Inter, Arial, sans-serif" font-weight="700" font-size="56" fill="#fff">${safeTitle}</text>
    <text x="60" y="380" font-family="Inter, Arial, sans-serif" font-weight="400" font-size="28" fill="#cbd5e1">Interactive liquid animations & generative experiments</text>
  </svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
