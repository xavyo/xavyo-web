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
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 3: Minimal runtime
# ---------------------------------------------------------------------------
FROM node:22-slim AS runtime
WORKDIR /app

RUN useradd -r -u 1001 -m xavyo
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=deps /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
EXPOSE 3000

USER xavyo
CMD ["node", "build/index.js"]
