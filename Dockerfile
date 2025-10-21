# docker build -t ff .
# docker run -p 3000:3000 -it ff
# Build stage
FROM node:22-slim AS builder

WORKDIR /gen3

# Copy package files and configs
COPY ./package.json ./package-lock.json ./next.config.js ./tsconfig.json ./tailwind.config.js ./postcss.config.js ./
COPY ./.env.development ./.env.production ./

# Copy config and source
COPY ./config ./config
COPY ./src ./src
COPY ./public ./public
COPY ./start.sh ./

# Install dependencies
RUN npm ci
RUN npm install @swc/core @napi-rs/magic-string

# Build the application
RUN npm run build

# Production stage
FROM node:22-slim AS runner

WORKDIR /gen3

# Create user and group
RUN addgroup --system --gid 1001 nextjs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /gen3/package.json ./
COPY --from=builder /gen3/node_modules ./node_modules
COPY --from=builder /gen3/config ./config
COPY --from=builder /gen3/.next ./.next
COPY --from=builder /gen3/public ./public
COPY --from=builder /gen3/start.sh ./start.sh
COPY --from=builder /gen3/.env.production ./

# Create cache directory and set permissions
RUN mkdir -p /gen3/.next/cache/images && \
    chmod -R 777 /gen3/.next/cache && \
    chown -R nextjs:nextjs /gen3

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_PUBLIC_GEN3_COMMONS_NAME=gen3
ENV NEXT_PUBLIC_GEN3_API=https://omix3.test.biocommons.org.au
ENV NEXT_PUBLIC_DATACOMMONS="commons_frontend_app"

USER nextjs:nextjs

CMD ["bash", "./start.sh"]
