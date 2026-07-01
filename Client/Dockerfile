# syntax=docker/dockerfile:1
# Production image for the Next.js client (standalone output).
# NEXT_PUBLIC_API_URL is a PUBLIC value inlined at build time, so it must be
# passed as a build arg (e.g. https://api.yourdomain.com) — see Client/config/deploy.yml.
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app

# --- deps: install from the lockfile ---
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# --- build: compile the standalone server ---
FROM base AS build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- runner: minimal runtime ---
FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -g 1001 nodejs && adduser -u 1001 -G nodejs -S nextjs
COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
