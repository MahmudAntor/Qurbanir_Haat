# Qurbanir Haat

Qurbanir Haat is a self-hosted TanStack Start marketplace for premium Qurbani cattle. The public
site presents a searchable cattle catalog, reservation calls to action, a meat-yield calculator,
package comparison content, and an inquiry form. A protected admin area manages cattle inventory,
media uploads, inbound inquiries, WhatsApp contact settings, and Meta Pixel tracking.

The app is branded in the UI as **Bhumi Bovine**.

## Features

- Public landing page for Eid-ul-Adha cattle reservations.
- Real-time cattle catalog backed by Supabase.
- Breed, weight, and price filters.
- Cattle cards with image, video, health, feed, price, and availability details.
- WhatsApp reservation links with configurable phone number.
- Inquiry form with client-side Zod validation and Supabase row-level security.
- Yield calculator for estimated meat yield and per-share pricing.
- Protected admin dashboard for cattle, inquiries, and site settings.
- Supabase Storage bucket for cattle photos and videos.
- Meta Pixel loader that can be enabled from admin settings.
- Branded SSR error fallback for catastrophic server render failures.

## Tech Stack

- React 19
- TanStack Start and TanStack Router
- TanStack Query
- Vite 7
- Nitro server output for Node.js hosting
- TypeScript
- Tailwind CSS 4
- shadcn/ui-style Radix components
- Supabase Auth, Postgres, Realtime, Row Level Security, and Storage

## Project Structure

```text
.
|-- assets/                # Static image assets imported by the app
|-- components/
|   |-- site/              # Public marketing/catalog sections
|   `-- ui/                # Reusable UI primitives
|-- hooks/                 # Shared React hooks
|-- integrations/          # Supabase clients and generated database types
|-- lib/                   # Shared helpers, site settings, and error handling
|-- routes/                # TanStack Router file routes
|-- supabase/
|   |-- config.toml
|   `-- migrations/        # Database, RLS, storage, and admin bootstrap migrations
|-- router.tsx             # Router factory and query client context
|-- routeTree.gen.ts       # Generated TanStack route tree
|-- server.ts              # SSR server wrapper and branded 500 handling
|-- start.ts               # TanStack Start instance and request middleware
|-- styles.css             # Global Tailwind theme and styles
|-- vite.config.ts         # TanStack Start, Nitro, React, Tailwind, and alias plugins
`-- Dockerfile             # Optional production container build
```

## Prerequisites

- Node.js 20.19 or newer. Node 22 LTS is recommended.
- npm, included with Node.js.
- A Supabase project.
- Supabase CLI if you want to apply migrations locally or from the command line.

## Environment Variables

Copy `.env.example` to `.env` for local development or configure the same values in your server
environment.

Required for the browser and SSR client:

```bash
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
```

The production server injects these two public values into the page at runtime, so you can configure
them in the server environment or `.env` before running `scripts/start.*`. `VITE_SUPABASE_URL` and
`VITE_SUPABASE_PUBLISHABLE_KEY` are supported as server/runtime aliases, but they are not baked into
the browser bundle.

Optional project metadata:

```bash
VITE_SUPABASE_PROJECT_ID=
```

Required only if you use the server-side admin Supabase client:

```bash
SUPABASE_SERVICE_ROLE_KEY=
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser code.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Start the production server from the Nitro output:

```bash
npm run start
```

By default, the production server listens on port `3000`. Set `PORT` in the server environment if
your process manager or hosting setup needs a different port.

You can also use the project start/stop scripts:

```bash
# Linux/macOS
sh scripts/start.sh
sh scripts/stop.sh

# Windows PowerShell
.\scripts\start.ps1
.\scripts\stop.ps1
```

The scripts read `.env` when it exists, keep the running process ID in `.run/`, and write runtime
diagnostics to `logs/`.

If you see the fallback page that says "This page didn't load", check the logs:

```bash
# Linux/macOS
tail -n 120 logs/qurbanir-haat.server.log
tail -n 120 logs/qurbanir-haat.console.log
test -f logs/qurbanir-haat.health.html && sed -n '1,160p' logs/qurbanir-haat.health.html

# Windows PowerShell
Get-Content .\logs\qurbanir-haat.server.log -Tail 120
Get-Content .\logs\qurbanir-haat.console.log -Tail 120
Get-Content .\logs\qurbanir-haat.console-error.log -Tail 120 -ErrorAction SilentlyContinue
Get-Content .\logs\qurbanir-haat.health.html -TotalCount 160 -ErrorAction SilentlyContinue
```

The app also writes SSR errors to that file directly, including the request URL and stack trace when
available. Raw process output goes to `logs/qurbanir-haat.console.log`; the Windows script also
writes stderr to `logs/qurbanir-haat.console-error.log`. If a start-script health check renders the
fallback page, the returned HTML is saved to `logs/qurbanir-haat.health.html`. When browsing from
`localhost`, the fallback page also shows local-only error details directly on screen.

Lint, type-check, and format:

```bash
npm run lint
npm run typecheck
npm run format
```

## Supabase Setup

Apply the migrations in `supabase/migrations` to create:

- `user_roles` with an `admin` role enum.
- `cattle` inventory table with public reads and admin-only writes.
- `inquiries` table with public inserts and admin-only reads/deletes.
- `site_settings` single-row table for WhatsApp and Meta Pixel settings.
- `cattle-media` public storage bucket.
- Storage policies for public reads and admin media management.
- `bootstrap_first_admin()` trigger that gives the first created user the admin role.

The first user who signs up through `/admin` becomes the initial admin. After that, admin access is
controlled through rows in `public.user_roles`.

If admin text edits save but photo/video uploads fail with `Bucket not found`, the app is connected
to a Supabase project where the Storage bucket was not created. Run the latest migration in
`supabase/migrations` or create a public Storage bucket named `cattle-media` with the matching
storage policies.

## Admin Workflow

1. Visit `/admin`.
2. Sign up to create the first admin account.
3. Manage inventory from the Cattle tab.
4. Upload cattle photos or videos to the `cattle-media` bucket.
5. Review customer submissions in the Inquiries tab.
6. Update the WhatsApp number and Meta Pixel ID in Settings.

Inventory changes are written directly to Supabase and become visible on the public catalog.

## Public Site Flow

The main route (`/`) renders:

1. Header and hero section.
2. Cattle catalog with live Supabase data and filters.
3. Process, packages, and comparison sections.
4. Yield calculator.
5. Inquiry form.
6. Footer and floating WhatsApp action.

The catalog subscribes to Supabase Realtime updates on the `cattle` table, so public inventory can
refresh as admin changes land.

## Production Deployment

For the own-server production runbook, see [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md). For the
Netlify runbook, see [`docs/NETLIFY_DEPLOYMENT.md`](docs/NETLIFY_DEPLOYMENT.md). For GitHub Pages,
Render, Cloudflare Pages, and other hosted options, see [`docs/alternatives.md`](docs/alternatives.md).

This project is no longer tied to Lovable or Cloudflare Workers. Production builds use the official
TanStack Start Vite plugin with Nitro output for a normal Node.js server.

### Windows Development, Linux Production

Developing on Windows is fine, but do not copy a Windows-built `.output` folder to a Linux server.
Commit or upload the source code plus `package-lock.json`, then run `npm ci` and `npm run build` on
the Linux server. Docker also works well because the build and runtime both happen in Linux.

Manual server flow:

```bash
npm ci
npm run build
sh scripts/start.sh
```

Put the Node process behind your reverse proxy of choice, such as Nginx or Caddy, and forward traffic
to the configured `PORT`.

Build the app on the same OS/architecture that will run it, or build inside Docker, so Nitro traces
the correct production dependencies.

Docker flow:

```bash
docker build -t qurbanir-haat .
docker run --env-file .env -p 3000:3000 qurbanir-haat
```

For production, configure environment variables in your hosting platform or process manager instead
of committing real `.env` files.

## Codebase Notes

- `routeTree.gen.ts` is generated by TanStack Router and should not be edited by hand.
- Supabase integration files and `integrations/supabase/types.ts` are generated/scaffolded and
  should stay in sync with the database schema.
- There are no dedicated unit or integration tests yet. Current verification is `npm run lint`,
  `npm run typecheck`, and `npm run build`.
