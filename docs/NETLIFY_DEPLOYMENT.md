# Netlify Deployment Guide

This guide is for deploying Qurbanir Haat / Bhumi Bovine to Netlify from the Git repository.

The project is a TanStack Start app with server-rendered output. Use Netlify continuous deployment
from Git so Netlify can install dependencies, run the build, publish static assets, and deploy the
generated serverless function.

## Current Readiness

Ready for a Git-connected Netlify deployment after the production Supabase environment values are
entered in Netlify.

Verified locally on May 19, 2026:

- `npm run build` passes with the default Node server preset.
- `NITRO_PRESET=netlify npm run build` passes and emits Netlify function output under
  `.netlify/functions-internal`.
- `npm run lint` is expected to pass after generated `.netlify/` output is ignored.
- The repo now includes `netlify.toml` with the Netlify build command, publish directory, Node
  version, and Nitro preset.

## Why Not Raw Drag And Drop

Netlify Drag and Drop is useful for already-built site files. Netlify's deploy docs say that manual
deploys without continuous deployment do not run a build command, and the Drag and Drop example is
for a project folder containing site files such as `.html` files:

- https://docs.netlify.com/deploy/create-deploys/

This repo is not a single HTML folder. It needs Vite, TanStack Start, Nitro, TypeScript, and runtime
Supabase environment variables. A raw project-folder upload would not run `npm run build`, and the
current built `dist/` folder does not contain a root `index.html` because the app's HTML is produced
by the server function. Use Git deployment for the real production site.

## Netlify Settings

The repository contains these settings in `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"
  NITRO_PRESET = "netlify"
```

Netlify's file-based configuration docs confirm that `netlify.toml` belongs at the root of the
repository and can define the build command, publish directory, and build environment variables:

- https://docs.netlify.com/build/configure-builds/file-based-configuration/

Do not set `NODE_ENV=production` for the build. This project needs dev dependencies such as Vite,
TypeScript, and ESLint available during the build.

## Environment Variables

In Netlify, open the site and go to:

```text
Project configuration -> Environment variables
```

Add these production values:

```text
SUPABASE_URL=your-production-supabase-url
SUPABASE_PUBLISHABLE_KEY=your-production-supabase-publishable-key
```

Optional:

```text
VITE_SUPABASE_PROJECT_ID=your-production-project-id
```

Only add this if a trusted server-only route truly needs it:

```text
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Never expose the service role key as a `VITE_*` variable.

Netlify's environment variable docs note that environment variables are available during builds and
can be declared through the UI, CLI, API, or configuration:

- https://docs.netlify.com/build/configure-builds/environment-variables/

## First Deploy

1. Push this repository to GitHub.
2. In Netlify, choose `Add new project`.
3. Choose the GitHub repository.
4. Keep the root as the base directory.
5. Netlify should read `netlify.toml` automatically.
6. Confirm the settings:

```text
Build command: npm run build
Publish directory: dist
Node version: 22
NITRO_PRESET: netlify
```

7. Add the production Supabase environment variables.
8. Deploy the site.

Netlify's deploy docs say Git-connected deploys run the configured build command and deploy the
result whenever you push to the repository:

- https://docs.netlify.com/deploy/create-deploys/

## Domain Setup

After the first successful deploy:

1. Open the Netlify site dashboard.
2. Go to `Domain management`.
3. Select `Add a domain`.
4. Choose `Add a domain you already own`.
5. Enter the domain.
6. Choose either Netlify DNS or your external DNS provider.

Netlify's domain docs cover this flow:

- https://docs.netlify.com/manage/domains/manage-domains/assign-a-domain-to-your-site-app/

If using an external DNS provider:

- Add a CNAME for `www` pointing to your Netlify subdomain.
- For the apex domain, use ALIAS, ANAME, flattened CNAME, or Netlify's fallback A record as Netlify
  instructs in the dashboard.
- Wait for DNS propagation.

Reference:

- https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/

Netlify provides free HTTPS and automatically provisions certificates for custom domains:

- https://docs.netlify.com/manage/domains/secure-domains-with-https/https-ssl/

## Supabase Checklist

Before opening the site publicly:

1. Apply every SQL migration in `supabase/migrations` to the production Supabase project.
2. Confirm the `cattle-media` storage bucket exists.
3. Confirm public read policies and admin write policies are active.
4. Create the first admin account at `/admin`; the first signed-up user becomes the initial admin.
5. Set the production WhatsApp number and Meta Pixel ID from the admin settings page.

## Post-Deploy Smoke Test

After deployment:

1. Open the Netlify preview URL.
2. Confirm the home page renders without the fallback error page.
3. Confirm the catalog loads cattle from Supabase.
4. Test filters and the yield calculator.
5. Submit a test inquiry.
6. Open `/admin`, sign in, and update one harmless setting.
7. Upload a test image to confirm Supabase Storage works.
8. Add the custom domain and test both apex and `www`.
9. Confirm HTTPS is active.

## Current Netlify TanStack Start Docs Note

Netlify's current TanStack Start guide documents an official
`@netlify/vite-plugin-tanstack-start` adapter with `publish = "dist/client"`:

- https://docs.netlify.com/build/frameworks/framework-setup-guides/tanstack-start/

This repo is currently using Nitro's `netlify` preset, which was verified locally and does not
require adding a new adapter dependency. If the project later switches to the official Netlify
TanStack Start adapter, update `vite.config.ts`, install the adapter package, and change
`netlify.toml` to the `dist/client` publish directory from Netlify's TanStack Start guide. Do not
mix the two configurations.
