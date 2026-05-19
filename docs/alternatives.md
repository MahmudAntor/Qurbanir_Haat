# Deployment Alternatives

The recommended production path is an owned server. See `docs/DEPLOYMENT.md` for that runbook.
This file keeps the hosted-platform options for future reference.

## Netlify Free

Netlify can be useful for a quick public test run. It supports custom domains, SSL, functions, and a
free plan with a hard monthly credit limit. The app has been checked with the Nitro Netlify preset
locally.

For the full current runbook, see `docs/NETLIFY_DEPLOYMENT.md`.

### Netlify Project Settings

Connect the GitHub repository to Netlify, then use:

```text
Build command: npm run build
Publish directory: dist
```

Set these environment variables in Netlify:

```text
NITRO_PRESET=netlify
NODE_VERSION=22
SUPABASE_URL=your-supabase-project-url
SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-or-publishable-key
```

Optional:

```text
VITE_SUPABASE_PROJECT_ID=your-project-id
```

Do not add `SUPABASE_SERVICE_ROLE_KEY` unless a trusted server-only route needs it. Never use a
service role key in a `VITE_*` variable.

Do not drag and drop the raw project folder for production. Manual deploys do not run the build
command, and this app needs Netlify to build the server function output.

### Netlify Free Credit Planning

Netlify Free currently gives 300 credits per month with a hard limit. When credits are exhausted,
the site is paused instead of charging extra.

Useful conversions:

- Production deploys: 15 credits each.
- Web bandwidth: 20 credits per GB.
- Web requests: 2 credits per 10,000 requests.
- Compute/functions: 10 credits per GB-hour.

Practical expectations for this app:

- 1 production deploy per week uses about 60 credits/month.
- 10 production deploys/month use about 150 credits.
- With few deploys, the remaining credits should be enough for a light early test run.
- Most cattle photos and videos are served from Supabase Storage, so Netlify mainly serves HTML,
  JavaScript, CSS, and the local hero image.

Cost-control checklist:

- Keep auto recharge disabled.
- Avoid repeated production deploys while experimenting.
- Watch Netlify's usage dashboard after launch.
- Keep large media files in Supabase Storage, not in the repo.

## GitHub Pages

GitHub Pages is not a good fit for the current app.

Reasons:

- GitHub Pages only serves static files and cannot run the generated Nitro Node server.
- A test build with the `github_pages` Nitro preset failed during prerendering.
- GitHub Pages is not intended for online business or e-commerce hosting.

The repository can still live on GitHub. Use GitHub as the source repo and deploy from it to an
owned server, Netlify, Render, or another Node-capable host.

## Render Free

Render can run the app as a normal Node web service. It is simple, but the free service can sleep,
so first visits after inactivity may be slow.

Use:

```text
Build command: npm ci && npm run build
Start command: node .output/server/index.mjs
```

Environment variables:

```text
NITRO_PRESET=render_com
NODE_VERSION=22
SUPABASE_URL=your-supabase-project-url
SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-or-publishable-key
```

## Cloudflare Pages

Cloudflare Pages can be a strong free static or edge-hosting target, but this app should get a
separate static or edge-runtime compatibility pass before choosing it. The current production build
is a Node/Nitro server, and parts of the app use Node-specific server behavior.

## Docker On Any Host

The included `Dockerfile` builds and runs the app on Node 22:

```bash
docker build -t qurbanir-haat .
docker run --env-file .env -p 3000:3000 qurbanir-haat
```

Docker is a good option on a VPS if you prefer container deployment over a systemd-managed Node
process.
