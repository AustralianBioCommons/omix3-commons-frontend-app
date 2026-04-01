# docker build -t ff .
# docker run -p 3000:3000 -it ff
# Build stage
FROM --platform=$BUILDPLATFORM node:24.13.0-trixie-slim AS builder

ARG TARGETPLATFORM
ARG BUILDPLATFORM

WORKDIR /gen3

# Copy dependency files first for better caching
COPY package.json package-lock.json ./
COPY ./jupyter-lite/requirements.txt ./jupyter-lite/requirements.txt

# Install Python for JupyterLite build
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Install ALL dependencies once (including dev deps for build)
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm ci && \
    npm cache clean --force

# Install JupyterLite build dependencies
RUN pip3 install --break-system-packages -r ./jupyter-lite/requirements.txt

# Copy necessary config files
COPY next.config.js tsconfig.json tailwind.config.js postcss.config.js ./
COPY .env.production ./

# Copy source files
COPY ./src ./src
COPY ./public ./public
COPY ./config ./config
COPY ./jupyter-lite ./jupyter-lite
COPY ./start.sh ./

# Build JupyterLite assets and Next.js app, then prune dev dependencies
RUN jupyter lite build --contents ./jupyter-lite/contents/files --lite-dir ./jupyter-lite/contents --output-dir ./public/jupyter && \
    ls -la /gen3/public && \
    ls -la /gen3/public/jupyter && \
    test -f /gen3/public/jupyter/index.html && \
    npm run build && \
    npm prune --omit=dev;

# Production stage
FROM node:24.13.0-trixie-slim AS runner

WORKDIR /gen3

RUN addgroup --system --gid 1001 nextjs && \
    adduser --system --uid 1001 nextjs

# Copy only production dependencies
COPY --from=builder --chown=nextjs:nextjs /gen3/package.json ./
COPY --from=builder --chown=nextjs:nextjs /gen3/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nextjs /gen3/config ./config
COPY --from=builder --chown=nextjs:nextjs /gen3/.next ./.next
COPY --from=builder --chown=nextjs:nextjs /gen3/public ./public
COPY --from=builder --chown=nextjs:nextjs /gen3/start.sh ./start.sh

RUN ls -la /gen3/public&& \
    ls -la /gen3/public/jupyter && \
    test -f /gen3/public/jupyter/index.html && \
    mkdir -p .next/cache/images && \
    chmod +x start.sh && \
    chown -R nextjs:nextjs .next/cache

USER nextjs:nextjs
ENV NODE_ENV=production \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1

CMD ["sh", "./start.sh"]
