# docker build -t ff .
# docker run -p 3000:3000 -it ff

# -----------------------------
# Build stage
# -----------------------------
FROM  820242927126.dkr.ecr.ap-southeast-2.amazonaws.com/omix3/commons-frontend:node24.14.0 AS builder
#FROM node:24.14.0-trixie-slim AS builder

WORKDIR /gen3

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

# Install Python for JupyterLite build
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        python3 python3-pip python3-venv build-essential && \
    ln -sf /usr/bin/python3 /usr/bin/python && \
    rm -rf /var/lib/apt/lists/*

# Use a venv instead of removing EXTERNALLY-MANAGED
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy dependency files first for caching
COPY package.json package-lock.json ./
COPY next.config.js tsconfig.json tailwind.config.js postcss.config.js start.sh ./
COPY jupyter-lite/requirements.txt ./jupyter-lite/requirements.txt

# Install Node dependencies
RUN npm ci
RUN npm install @swc/core @napi-rs/magic-string

# Install Python dependencies for JupyterLite build
RUN pip install --no-cache-dir -r ./jupyter-lite/requirements.txt

# Copy source
COPY src ./src
COPY public ./public
COPY config ./config
COPY jupyter-lite ./jupyter-lite

# Build JupyterLite into safe folder outside public/config
RUN mkdir -p /gen3/debug-artifacts/jupyterlite && \
    jupyter lite build \
      --lite-dir ./jupyter-lite/contents \
      --contents ./jupyter-lite/contents/files \
      --output-dir /gen3/debug-artifacts/jupyterlite

# Optional marker file for verification
RUN echo "from-builder-random" > /gen3/debug-artifacts/random-marker.txt

# Build Next.js
RUN npm run build

# -----------------------------
# Production stage
# -----------------------------
FROM 820242927126.dkr.ecr.ap-southeast-2.amazonaws.com/omix3/commons-frontend:node24.14.0 AS runner
#FROM node:24.14.0-trixie-slim AS runner

WORKDIR /gen3

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd -g 1001 nodejs && \
    useradd -u 1001 -g nodejs -m nextjs

# Copy runtime files
COPY --from=builder --chown=nextjs:nodejs /gen3/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /gen3/public ./public
COPY --from=builder --chown=nextjs:nodejs /gen3/config ./config
COPY --from=builder --chown=nextjs:nodejs /gen3/debug-artifacts ./debug-artifacts
COPY --from=builder --chown=nextjs:nodejs /gen3/start.sh ./start.sh
COPY --from=builder --chown=nextjs:nodejs /gen3/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /gen3/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /gen3/.next/static ./.next/static

RUN chmod +x /gen3/start.sh

USER nextjs

EXPOSE 3000

CMD ["sh", "./start.sh"]
