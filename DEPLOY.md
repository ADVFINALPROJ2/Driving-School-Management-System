# Deployment runbook — single self-hosted VPS (Kamal)

Deploys both apps to **one VPS** (`DEPLOY_SERVER_IP = 2.57.91.91`), fully self-contained:
a Docker **registry** and **PostgreSQL** both run on the VPS, the backend serves
`api.<yourdomain>` and the frontend serves `app.<yourdomain>`, each with its own
Let's Encrypt cert via kamal-proxy.

> Replace `<yourdomain>` everywhere with your real domain. You run every command
> below from **your machine** (it drives the VPS over SSH). Secrets are passed as
> shell env vars — never commit raw values.

---

## 0. Prerequisites

- A domain you control. Create two DNS **A records**:
  - `api.<yourdomain>` → `2.57.91.91`
  - `app.<yourdomain>` → `2.57.91.91`
- VPS: clean Ubuntu/Debian, **root SSH access via key**. Open firewall ports **22, 80, 443**
  (port 80 is required for Let's Encrypt; the probe showed it closed and 443 already in use —
  make sure nothing else is bound to 80/443, e.g. a pre-installed nginx).
- Local tools: Docker, Ruby, and Kamal — `gem install kamal` (or use `backend/bin/kamal`).

## 1. Choose secrets (export in the shell you run kamal from)

```bash
export DEPLOY_SERVER_IP=2.57.91.91
export DB_PASSWORD='<a-strong-db-password>'
export REGISTRY_PASSWORD='<a-strong-registry-password>'
```
`RAILS_MASTER_KEY` is read automatically from `backend/config/master.key`.

## 2. Bootstrap the VPS (installs Docker)

```bash
cd backend
kamal server bootstrap
```

## 3. Create the local registry's auth file (once)

```bash
mkdir -p backend/.kamal/registry
docker run --rm --entrypoint htpasswd httpd:2 -Bbn deploy "$REGISTRY_PASSWORD" \
  > backend/.kamal/registry/htpasswd
```
(Git-ignored. Kamal uploads it to the registry container.)

## 4. Boot the registry + Postgres accessories (before the first deploy)

```bash
cd backend
kamal accessory boot registry
kamal accessory boot db
```

## 5. Deploy the backend

```bash
cd backend
export APP_HOST=api.<yourdomain>
export ALLOWED_ORIGINS=https://app.<yourdomain>   # CORS allow-list for the frontend
kamal deploy
```
Then create + migrate the databases (primary/cache/queue/cable) and seed:
```bash
kamal prepare-db                     # alias for: bin/rails db:prepare
kamal app exec "bin/rails db:seed"   # optional: demo data + admin/clerk/instructor
```
Verify: `curl https://api.<yourdomain>/up` → `200`.

## 6. Deploy the frontend

```bash
cd Client
export DEPLOY_SERVER_IP=2.57.91.91
export FRONTEND_HOST=app.<yourdomain>
export API_URL=https://api.<yourdomain>     # baked into the client bundle at build
export REGISTRY_PASSWORD='<same-as-step-1>'
kamal deploy
```
Visit `https://app.<yourdomain>` and log in (`admin@drivingschool.et` / `Password123!`
if you seeded).

---

## Day-2 operations

```bash
cd backend && kamal logs           # backend logs
cd backend && kamal console        # rails console
cd backend && kamal app exec "bin/rails db:migrate"   # after new migrations
cd Client  && kamal logs           # frontend logs
cd backend && kamal rollback       # roll back to the previous release
```

## Notes / follow-ups

- **Security:** `config/master.key` is currently committed to the repo. Rotate it
  and remove it from git history; afterwards set `RAILS_MASTER_KEY` from your
  password manager instead of reading the file.
- **Backups:** the `backend/bin/post-deploy` hook can `pg_dump` to S3 when
  `BACKUP_S3_BUCKET` is set; otherwise back up the Postgres `data` volume yourself.
- **Email:** SMTP is unset, so mailer sends are best-effort (non-fatal). Add SMTP
  creds via `bin/rails credentials:edit` when you want real email.
- **Simpler registry alternative:** if the on-VPS registry is fiddly, switch both
  `registry:` blocks to GitHub Container Registry (`ghcr.io`, `username: <gh-user>`,
  `KAMAL_REGISTRY_PASSWORD` = a GitHub PAT with `write:packages`) and drop the
  `registry` accessory + htpasswd step.
