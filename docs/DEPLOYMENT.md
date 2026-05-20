# Own-Server Deployment Guide

This is the recommended production path for Qurbanir Haat: run the TanStack Start + Nitro Node
server on your own Linux server, keep Supabase as the database/auth/storage backend, and put a
reverse proxy in front for the public domain and SSL.

For Netlify, GitHub Pages, Render, Cloudflare Pages, and Docker notes, see `docs/alternatives.md`.

## Production Shape

```text
Visitor
  -> Domain DNS
  -> Nginx or Caddy on your server, ports 80/443
  -> Node app on 127.0.0.1:3000
  -> Supabase for database, auth, realtime, and media storage
```

The app build emits a Node server at:

```text
.output/server/index.mjs
```

Build the app on the same operating system and architecture that will run it. Do not copy a
Windows-built `.output` folder to a Linux server.

## Server Requirements

- Ubuntu 22.04/24.04 LTS or another modern Linux distribution.
- Node.js 22 LTS. Node 20.19+ is the minimum supported by the app.
- npm.
- git.
- Nginx or Caddy.
- A domain pointed to the server.
- Open firewall ports: `80`, `443`, and your SSH port.

The examples below use:

```text
App directory: /opt/qurbanir-haat
App user: qurbanir
App port: 3000
Systemd service: qurbanir-haat
```

Adjust names and paths if your server uses a different convention.

## 1. Create App User And Directory

```bash
sudo useradd --system --create-home --shell /usr/sbin/nologin qurbanir
sudo mkdir -p /opt/qurbanir-haat
sudo chown -R "$USER":"$USER" /opt/qurbanir-haat
```

Clone the repository:

```bash
git clone https://github.com/YOUR_ORG/YOUR_REPO.git /opt/qurbanir-haat
cd /opt/qurbanir-haat
```

If the repo is private, use a deploy key or another GitHub authentication method that only grants
access to this repository.

## 2. Configure Environment

Create the production env file:

```bash
cp .env.example .env
nano .env
```

Minimum production values:

```text
NODE_ENV=production
PORT=3000
LOG_FILE=/opt/qurbanir-haat/logs/qurbanir-haat.server.log

SUPABASE_URL=your-supabase-project-url
SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-or-publishable-key
```

Optional:

```text
VITE_SUPABASE_PROJECT_ID=your-project-id
```

Do not set `SUPABASE_SERVICE_ROLE_KEY` unless a trusted server-only route needs it. Never expose the
service role key as a `VITE_*` variable.

Lock down the env file:

```bash
chmod 600 .env
```

## 3. Install And Build

```bash
npm ci
npm run build
```

The build should generate `.output/server/index.mjs`.

## 4. Apply Supabase Migrations

Apply every SQL file in `supabase/migrations` to the production Supabase project before opening the
site to users. The migrations create:

- Admin roles and first-admin bootstrap.
- Cattle inventory.
- Public inquiries.
- Site settings.
- Public `cattle-media` storage bucket.
- Row-level security policies.

After deployment, the first user who signs up through `/admin` becomes the initial admin.

## 5. Create The Systemd Service

Find the Node path:

```bash
which node
```

Create the service:

```bash
sudo nano /etc/systemd/system/qurbanir-haat.service
```

Use this template. If `which node` returned a path other than `/usr/bin/node`, update `ExecStart`.

```ini
[Unit]
Description=Qurbanir Haat web app
After=network.target

[Service]
Type=simple
User=qurbanir
Group=qurbanir
WorkingDirectory=/opt/qurbanir-haat
EnvironmentFile=/opt/qurbanir-haat/.env
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/node .output/server/index.mjs
Restart=always
RestartSec=5
StandardOutput=append:/opt/qurbanir-haat/logs/qurbanir-haat.console.log
StandardError=append:/opt/qurbanir-haat/logs/qurbanir-haat.console-error.log

[Install]
WantedBy=multi-user.target
```

Give the runtime user ownership of the app directory:

```bash
sudo chown -R qurbanir:qurbanir /opt/qurbanir-haat
sudo mkdir -p /opt/qurbanir-haat/logs
sudo chown -R qurbanir:qurbanir /opt/qurbanir-haat/logs
```

Start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable qurbanir-haat
sudo systemctl start qurbanir-haat
sudo systemctl status qurbanir-haat --no-pager
```

Check the local app:

```bash
curl -I http://127.0.0.1:3000/
```

## 6. Configure Reverse Proxy

Use either Caddy or Nginx. Caddy is simpler because it manages SSL certificates automatically.

### Option A: Caddy

Create a Caddy site config:

```bash
sudo nano /etc/caddy/Caddyfile
```

```text
your-domain.com {
  reverse_proxy 127.0.0.1:3000
}

www.your-domain.com {
  redir https://your-domain.com{uri}
}
```

Reload Caddy:

```bash
sudo systemctl reload caddy
```

### Option B: Nginx

Create an Nginx site:

```bash
sudo nano /etc/nginx/sites-available/qurbanir-haat
```

```nginx
server {
  listen 80;
  server_name your-domain.com www.your-domain.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

Enable and test:

```bash
sudo ln -s /etc/nginx/sites-available/qurbanir-haat /etc/nginx/sites-enabled/qurbanir-haat
sudo nginx -t
sudo systemctl reload nginx
```

Install SSL with Certbot or your preferred certificate manager:

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 7. Deploy Updates

Run this on the server:

```bash
cd /opt/qurbanir-haat
sudo systemctl stop qurbanir-haat
sudo chown -R "$USER":"$USER" /opt/qurbanir-haat
git pull --ff-only
npm ci
npm run build
sudo chown -R qurbanir:qurbanir /opt/qurbanir-haat
sudo systemctl start qurbanir-haat
sudo systemctl status qurbanir-haat --no-pager
```

For low traffic, this simple stop-build-start flow is fine. If the site grows, use a release
directory strategy so builds happen beside the live app and downtime stays near zero.

## 8. Production Smoke Test

After first deployment and after important updates:

1. Open the home page and confirm the hero and catalog render.
2. Confirm cattle filters update the count and cards.
3. Open `/admin` and sign in.
4. Update one harmless setting, then verify it appears on the public site.
5. Click a WhatsApp reservation link and confirm the message includes the right cattle code.
6. Check server logs for errors.

## Useful Commands

```bash
sudo systemctl status qurbanir-haat --no-pager
sudo systemctl restart qurbanir-haat
sudo journalctl -u qurbanir-haat -n 120 --no-pager
tail -n 120 /opt/qurbanir-haat/logs/qurbanir-haat.server.log
tail -n 120 /opt/qurbanir-haat/logs/qurbanir-haat.console.log
```

## Troubleshooting

Missing Supabase config:

- Confirm `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` are present in `/opt/qurbanir-haat/.env`.
- Run `sudo systemctl restart qurbanir-haat` after editing `.env`.

The app works on `127.0.0.1:3000` but not on the domain:

- Check DNS points to the server IP.
- Check firewall ports `80` and `443`.
- Run `sudo nginx -t` or `sudo systemctl status caddy --no-pager`.
- Confirm the reverse proxy points to `127.0.0.1:3000`.

Fallback page says "This page didn't load":

- Inspect `/opt/qurbanir-haat/logs/qurbanir-haat.server.log`.
- Inspect `/opt/qurbanir-haat/logs/qurbanir-haat.console.log`.
- Confirm the production server was built on Linux, not copied from Windows.

Admin sign-up does not grant admin:

- Confirm all migrations were applied to the production Supabase project.
- The first signed-up user gets the initial admin role through the bootstrap trigger.

Images or videos do not load:

- Confirm the `cattle-media` bucket exists.
- Confirm public read policies are present.
- Confirm uploaded media URLs point to the production Supabase project.

Port `3000` is already in use:

- Change `PORT` in `.env` and in the reverse proxy target.
- Restart the service and reload the proxy.
