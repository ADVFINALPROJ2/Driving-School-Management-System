# Deployment runbook — dtmf.studio on a clean VPS (Docker Compose + nginx)

Deploys to a **clean VPS at `72.60.81.161`** using Docker Compose, fronted by nginx +
certbot. Containers run with `restart: always` (the Docker equivalent of PM2 — they
come back on crash/reboot).

- Postgres + backend (Rails) + frontend (Next.js) run as containers, bound to
  **localhost** ports (`127.0.0.1:3001` backend, `127.0.0.1:3000` frontend).
- **nginx** terminates TLS for `api.dtmf.studio` → `:3001` and `app.dtmf.studio` → `:3000`.

```
internet → nginx :443 (certbot TLS)
             api.dtmf.studio → 127.0.0.1:3001 → backend container (Rails/Thruster)
             app.dtmf.studio → 127.0.0.1:3000 → frontend container (Next.js)
                                                 postgres container (internal only)
```

> I cannot SSH in or enter your password — run these **on the VPS** over your own SSH
> session, and paste me any errors. Don't commit `.env.prod`.

---

## 0. DNS (do this first — propagation takes time)
Point both A records at the VPS:
- `api.dtmf.studio` → `72.60.81.161`
- `app.dtmf.studio` → `72.60.81.161`

## 1. Install Docker, nginx, certbot on the VPS
```bash
# Docker engine + compose plugin
curl -fsSL https://get.docker.com | sh
# nginx + certbot
apt-get update && apt-get install -y nginx certbot python3-certbot-nginx git
```

## 2. Clone the repo into ~/driving
```bash
cd ~
git clone https://github.com/ADVFINALPROJ2/Driving-School-Management-System.git driving
cd driving
git checkout oliyad-vps-deploy   # until #84 is merged to main
```

## 3. Create .env.prod
```bash
cp .env.prod.example .env.prod
nano .env.prod    # set RAILS_MASTER_KEY (= contents of backend/config/master.key)
                  # and BACKEND_DATABASE_PASSWORD (choose a strong one)
```
Get the master key value:
```bash
cat backend/config/master.key
```

## 4. Build + start the stack
```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

## 5. Create + migrate the databases (and optional demo data)
```bash
docker compose -f docker-compose.prod.yml exec backend bin/rails db:prepare
docker compose -f docker-compose.prod.yml exec backend bin/rails db:seed   # optional
```
Quick check (inside the VPS): `curl http://127.0.0.1:3001/up` → `200`.

## 6. nginx vhosts + TLS
Create `/etc/nginx/sites-available/dtmf.conf`:
```nginx
server {
    server_name api.dtmf.studio;
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;   # Rails assume_ssl/force_ssl
        proxy_http_version 1.1;
        client_max_body_size 25m;                    # file uploads
    }
    listen 80;
}
server {
    server_name app.dtmf.studio;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_http_version 1.1;
    }
    listen 80;
}
```
```bash
ln -s /etc/nginx/sites-available/dtmf.conf /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d api.dtmf.studio -d app.dtmf.studio    # provisions + wires TLS
```

## 7. Verify
```bash
curl https://api.dtmf.studio/up        # => 200
# open https://app.dtmf.studio  → log in (admin@drivingschool.et / Password123! if seeded)
```

---

## Updating later
```bash
cd ~/driving && git pull
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
docker compose -f docker-compose.prod.yml exec backend bin/rails db:migrate   # if new migrations
```

## Day-2
```bash
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml restart backend
docker compose -f docker-compose.prod.yml exec backend bin/rails console
```

## Notes / follow-ups
- **Security:** the root SSH password was shared in chat — change it and prefer SSH keys.
  Also `config/master.key` is committed (pre-existing) — rotate it and remove from git history.
- **Backups:** back up the `postgres_data` and `backend_storage` Docker volumes.
- **Email:** SMTP is unset (mailer is best-effort) until you add creds via `bin/rails credentials:edit`.
- **Kamal alternative:** `backend/config/deploy.yml` + `Client/config/deploy.yml` provide a
  Kamal-based deploy instead, if you ever want zero-downtime releases / rollbacks.
