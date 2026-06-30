# Deployment runbook — dtmf.studio VPS (Kamal, behind existing nginx)

Deploys both apps to the VPS at **`2.57.91.91`**, which already runs **nginx** on
ports 80/443 for another system. So:

- A Docker **registry** and **PostgreSQL** run as accessories on the VPS.
- **kamal-proxy** runs HTTP-only on **custom ports** (`8080`/`8443`) — it does NOT
  touch 80/443.
- The existing **nginx terminates TLS** for `api.dtmf.studio` (backend) and
  `app.dtmf.studio` (frontend) and forwards to kamal-proxy on `127.0.0.1:8080`,
  which routes by hostname to the right app.

```
            ┌────────── VPS 2.57.91.91 ──────────┐
internet → nginx :443 (TLS, existing)            │
            │   api.dtmf.studio ┐                 │
            │   app.dtmf.studio ┴→ 127.0.0.1:8080 → kamal-proxy → backend / frontend containers
            │                              postgres + registry (accessories) │
            └────────────────────────────────────┘
```

> Run every command from **your machine** (it drives the VPS over SSH), except the
> nginx vhost edits which you make **on the VPS**. Secrets are shell env vars — never commit raw values.

---

## 0. Prerequisites

- DNS **A records** (you confirmed you can add these):
  - `api.dtmf.studio` → `2.57.91.91`
  - `app.dtmf.studio` → `2.57.91.91`
- VPS: root SSH access via key. nginx + certbot already present (for the other system).
  **You do NOT need to free ports 80/443** — nginx keeps them; kamal-proxy uses 8080/8443.
- Local tools: Docker, Ruby, Kamal — `gem install kamal` (or use `backend/bin/kamal`).

## 1. Choose secrets (export in the shell you run kamal from)

```bash
export DEPLOY_SERVER_IP=2.57.91.91
export DB_PASSWORD='<a-strong-db-password>'
export REGISTRY_PASSWORD='<a-strong-registry-password>'
```
`RAILS_MASTER_KEY` is read automatically from `backend/config/master.key`.

## 2. Bootstrap Docker + point kamal-proxy at custom ports

```bash
cd backend
kamal server bootstrap
# Make the shared kamal-proxy listen on 8080/8443 instead of 80/443:
kamal proxy boot_config set --http-port 8080 --https-port 8443
```

## 3. Local registry auth file (once)

```bash
mkdir -p backend/.kamal/registry
docker run --rm --entrypoint htpasswd httpd:2 -Bbn deploy "$REGISTRY_PASSWORD" \
  > backend/.kamal/registry/htpasswd
```

## 4. Boot the registry + Postgres accessories

```bash
cd backend
kamal accessory boot registry
kamal accessory boot db
```

## 5. Deploy the backend

```bash
cd backend
export APP_HOST=api.dtmf.studio
export ALLOWED_ORIGINS=https://app.dtmf.studio
kamal deploy
kamal prepare-db                     # create + migrate primary/cache/queue/cable
kamal app exec "bin/rails db:seed"   # optional demo data + admin/clerk/instructor
```

## 6. Deploy the frontend

```bash
cd Client
export DEPLOY_SERVER_IP=2.57.91.91
export FRONTEND_HOST=app.dtmf.studio
export API_URL=https://api.dtmf.studio   # baked into the client bundle at build
export REGISTRY_PASSWORD='<same-as-step-1>'
kamal deploy
```

## 7. Add nginx vhosts on the VPS (then certbot for TLS)

On the VPS, create `/etc/nginx/sites-available/dtmf-apps.conf`:

```nginx
# Backend API
server {
    server_name api.dtmf.studio;
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;   # Rails assume_ssl/force_ssl
        proxy_http_version 1.1;
    }
    listen 80;   # certbot will add the 443 + cert lines
}

# Frontend
server {
    server_name app.dtmf.studio;
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_http_version 1.1;
    }
    listen 80;
}
```

```bash
ln -s /etc/nginx/sites-available/dtmf-apps.conf /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d api.dtmf.studio -d app.dtmf.studio
```

> Both vhosts forward to the same `127.0.0.1:8080`; kamal-proxy routes by the
> `Host` header to the backend vs frontend container. Optionally firewall 8080/8443
> from the public internet (only nginx, on localhost, needs them).

## 8. Verify

```bash
curl https://api.dtmf.studio/up        # => 200
# open https://app.dtmf.studio  and log in (admin@drivingschool.et / Password123!)
```

---

## Day-2 operations

```bash
cd backend && kamal logs | kamal console | kamal rollback
cd backend && kamal app exec "bin/rails db:migrate"   # after new migrations
cd Client  && kamal logs
```

## Notes / follow-ups
- **Security:** `config/master.key` is committed (pre-existing). Rotate it and
  remove from git history, then source `RAILS_MASTER_KEY` from a password manager.
- **Backups:** back up the Postgres `data` volume (or set `BACKUP_S3_BUCKET` for the
  `bin/post-deploy` pg_dump hook).
- **Email:** SMTP is unset (mailer sends are best-effort/non-fatal) until you add
  creds via `bin/rails credentials:edit`.
- **Simpler registry alternative:** swap both `registry:` blocks to ghcr.io
  (`username: <gh-user>`, `KAMAL_REGISTRY_PASSWORD` = GitHub PAT) and drop the
  registry accessory + htpasswd step.
