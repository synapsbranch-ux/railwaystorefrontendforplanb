# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Bump Node memory for heavy Angular builds
ENV NODE_OPTIONS=--max-old-space-size=4096

# Install deps using only lockfile + manifest first (better cache)
COPY package.json package-lock.json* ./
# --ignore-scripts skips broken postinstall (ngcc removed in Angular 16+)
# --legacy-peer-deps works around outdated peer ranges
RUN npm ci --legacy-peer-deps --ignore-scripts

# Copy the rest of the sources
COPY . .

# Production build — uses default project from angular.json (ralbatech-website)
RUN npx ng build --configuration production

# ---------- Stage 2: Runtime (nginx static) ----------
FROM nginx:alpine

# nginx:alpine supports templated configs at /etc/nginx/templates/*.template
# which are envsubst'd into /etc/nginx/conf.d/*.conf at container start.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Copy the browser build output (SSR artifacts are ignored)
COPY --from=builder /app/dist/ralbatech-website/browser /usr/share/nginx/html

# Railway injects $PORT dynamically. Default to 8080 for local runs.
ENV PORT=8080
EXPOSE 8080

# Use the default nginx entrypoint (it runs envsubst on templates then nginx).
CMD ["nginx", "-g", "daemon off;"]
