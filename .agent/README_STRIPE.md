Stripe test-mode integration (local dev)
======================================

Quick scaffold to run a local Stripe checkout + webhook server for development.

1) Install dependencies (in project root):

```bash
npm install express stripe
```

2) Add environment variables (see `.env.example`):

- `VITE_STRIPE_PUBLISHABLE_KEY` (client)
- `STRIPE_SECRET_KEY` (server)
- `STRIPE_WEBHOOK_SECRET` (server webhook signing secret)

3) Start the local server:

```bash
npm run start:webhook
```

4) Expose it to the internet (Stripe needs a public URL for webhooks) using `ngrok` or similar:

```bash
ngrok http 4242
```

5) In the Stripe Dashboard -> Webhooks, add the `https://.../webhook` URL from ngrok and copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

6) From the client use `startCheckout()` (see `src/lib/stripeClient.ts`) to create a Checkout session. The server will return a redirect `url` and the browser will navigate to Stripe Checkout.

7) On `checkout.session.completed` the webhook handler logs the session metadata. Replace the TODO in `server/index.js` with logic to write `purchases` and `user_snippet_access` to Supabase (use the Supabase admin key server-side).

Notes:
- Do NOT expose `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET` to the browser.
- For production, host webhook endpoints on a secure server and verify signatures.
