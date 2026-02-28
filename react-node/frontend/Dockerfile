# =============================================================================
# Stage 1 — builder
# Install all dependencies (including devDependencies needed for the build)
# and compile the React app into a static dist/ directory.
# =============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy manifest files first — Docker caches this layer until package*.json changes.
COPY package*.json ./

RUN npm ci

# Copy the rest of the source and run the Vite production build.
# Produces a dist/ directory with minified HTML, JS, and CSS.
COPY . .

# VITE_API_URL must be set at build time because Vite inlines env vars into
# the JavaScript bundle.  The value '/api/v1' means the browser will hit
# the nginx reverse proxy which forwards /api requests to the backend.
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# =============================================================================
# Stage 2 — production
# Serve the static build output with nginx.  The final image is tiny because
# it contains only nginx and the compiled assets — no Node.js runtime.
# =============================================================================
FROM nginx:alpine AS production

# Write our SPA-aware config, overwriting the default.
# hadolint ignore=SC2016
RUN printf 'server {\n\
  listen 80;\n\
\n\
  # Serve the React SPA from the build output directory.\n\
  location / {\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    # SPA routing: any path that does not match a real file falls back to\n\
    # index.html so React Router can handle client-side navigation.\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
\n\
  # Proxy API requests to the Express backend.\n\
  # "backend" is resolved by Docker Compose internal DNS.\n\
  location /api {\n\
    proxy_pass http://backend:4000;\n\
    proxy_set_header Host $host;\n\
    proxy_set_header X-Real-IP $remote_addr;\n\
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
  }\n\
\n\
  # Proxy the health endpoint to the backend as well.\n\
  location /health {\n\
    proxy_pass http://backend:4000;\n\
    proxy_set_header Host $host;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

# Copy the compiled React app from the builder stage.
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
