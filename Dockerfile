# =============================================================================
# xavyo-web — Production Docker Image
# =============================================================================
# Multi-stage build: deps → build → runtime
#
# Build:  docker build -t xavyo-web .
# Run:    docker run -p 3000:3000 -e API_BASE_URL=http://idp:8080 xavyo-web

# ---------------------------------------------------------------------------
# Stage 1: Install dependencies
# ---------------------------------------------------------------------------
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# ---------------------------------------------------------------------------
# Stage 2: Build the SvelteKit app
# ---------------------------------------------------------------------------
FROM node:22-slim AS builder
ARG APP_VERSION=dev
ENV APP_VERSION=${APP_VERSION}
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 3: Minimal runtime
# ---------------------------------------------------------------------------
FROM node:22-slim AS runtime

LABEL org.opencontainers.image.source="https://github.com/xavyo/xavyo-web"
LABEL org.opencontainers.image.title="xavyo-web"
LABEL org.opencontainers.image.description="Xavyo Identity Platform Web UI"

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    tini curl \
    && rm -rf /var/lib/apt/lists/* \
    && useradd -r -u 1001 -m -s /usr/sbin/nologin xavyo \
    && find / -perm /6000 -type f -exec chmod a-s {} + 2>/dev/null || true

WORKDIR /app
COPY --from=builder --chown=xavyo:xavyo /app/build ./build
COPY --from=builder --chown=xavyo:xavyo /app/package.json ./
COPY --from=deps --chown=xavyo:xavyo /app/node_modules ./node_modules

ARG APP_VERSION=dev
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    APP_VERSION=${APP_VERSION}
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=15s \
    CMD curl -sf http://localhost:3000/ || exit 1

USER xavyo
ENTRYPOINT ["tini", "--"]
CMD ["node", "build/index.js"]
