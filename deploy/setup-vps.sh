#!/usr/bin/env bash
# One-shot production setup for the Driving School app on a clean Ubuntu/Debian VPS.
# Run from inside the cloned repo:
#     cd ~/driving && bash deploy/setup-vps.sh
#
# It installs Docker + nginx + certbot, writes .env.prod, builds & starts the
# Docker Compose stack, prepares the database, and configures the nginx vhosts.
# TLS (certbot) is printed as the final step for you to run once DNS resolves.
set -euo pipefail

API_HOST="${API_HOST:-api.dtmf.studio}"
APP_HOST_FRONT="${APP_HOST_FRONT:-app.dtmf.studio}"
COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.prod"

echo "==> 1/6 Installing Docker, nginx, certbot, git ..."
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
apt-get update -qq
apt-get install -y -qq nginx certbot python3-certbot-nginx git >/dev/null

echo "==> 2/6 Writing .env.prod (if missing) ..."
if [ ! -f .env.prod ]; then
  MASTER_KEY="$(cat backend/config/master.key)"
  DB_PASS="$(openssl rand -hex 24)"
  cat > .env.prod <<EOF
RAILS_MASTER_KEY=${MASTER_KEY}
BACKEND_DATABASE_PASSWORD=${DB_PASS}
APP_HOST=${API_HOST}
ALLOWED_ORIGINS=https://${APP_HOST_FRONT}
API_URL=https://${API_HOST}
EOF
  echo "    .env.prod created (generated DB password)."
else
  echo "    .env.prod already exists — leaving it as-is."
fi

echo "==> 3/6 Building & starting containers (this can take several minutes) ..."
$COMPOSE up -d --build

echo "==> 4/6 Waiting for the backend, then preparing the database ..."
for i in $(seq 1 30); do
  if $COMPOSE exec -T backend curl -sf http://127.0.0.1:80/up >/dev/null 2>&1; then break; fi
  sleep 3
done
$COMPOSE exec -T backend bin/rails db:prepare
$COMPOSE exec -T backend bin/rails db:seed || echo "    (seed skipped/failed — non-fatal)"

echo "==> 5/6 Configuring nginx vhosts ..."
cat > /etc/nginx/sites-available/dtmf.conf <<EOF
server {
    server_name ${API_HOST};
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_http_version 1.1;
        client_max_body_size 25m;
    }
    listen 80;
}
server {
    server_name ${APP_HOST_FRONT};
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_http_version 1.1;
    }
    listen 80;
}
EOF
ln -sf /etc/nginx/sites-available/dtmf.conf /etc/nginx/sites-enabled/dtmf.conf
nginx -t && systemctl reload nginx

echo "==> 6/6 Done. Containers:"
$COMPOSE ps

cat <<EOF

============================================================
Stack is up behind nginx (HTTP). Final step — provision TLS
once ${API_HOST} and ${APP_HOST_FRONT} resolve to this server:

    certbot --nginx -d ${API_HOST} -d ${APP_HOST_FRONT}

Then verify:
    curl https://${API_HOST}/up        # expect 200
    open  https://${APP_HOST_FRONT}
============================================================
EOF
