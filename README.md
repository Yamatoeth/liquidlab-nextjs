# LiquidLab

LiquidLab is a Next.js application for browsing, previewing, and selling premium Liquid snippets and interactive animation assets. It combines a static fallback catalog with Supabase-backed animation data, authentication, favorites, and protected animation delivery.

## Tech Stack

- Next.js 15 with the App Router
- React 19 and TypeScript
- Tailwind CSS with Radix UI primitives
- Three.js / React Three Fiber for 3D previews
- Supabase for auth, profiles, favorites, and animation records
- Vitest for tests
- Puppeteer for generating animation preview screenshots

## Requirements

- Node.js `>=22.12.0`
- npm
- Supabase project credentials for auth and remote animation data

Puppeteer 25 requires Node `>=22.12.0`. If the deployment target is Vercel, set the project Node version accordingly.

## Getting Started

Install dependencies:

```bash
npm ci
```

If you do not need Puppeteer's browser download locally, use:

```bash
PUPPETEER_SKIP_DOWNLOAD=true npm ci
```

Create a local environment file:

```bash
cp .env.example .env.local
```

If `.env.example` does not exist yet, create `.env.local` manually using the variables below.

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Environment Variables

Required for full Supabase-backed functionality:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Variable usage:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL used by the browser client and server helpers.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: public anon key used by browser-side auth and reads.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only service role key used by admin routes and seed scripts.
- `NEXT_PUBLIC_SITE_URL`: fallback origin for OAuth redirect URLs outside the browser.

The app can build without public Supabase variables, but auth and remote data features will not work correctly until they are configured.

## Scripts

```bash
npm run dev
```

Starts the Next.js development server.

```bash
npm run build
```

Creates a production Next.js build.

```bash
npm start
```

Starts the production Next.js server after a build.

```bash
npm test
```

Runs the Vitest test suite.

```bash
npm run lint
