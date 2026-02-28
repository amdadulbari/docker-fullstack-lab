# ============================================================
# Stage 1 — builder: install deps and compile the Vue app
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci

COPY . .

# Vite outputs the production bundle to /app/dist
RUN npm run build

# ============================================================
# Stage 2 — production: serve the static bundle with nginx
# ============================================================
FROM nginx:alpine AS production

# Remove the default nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy the compiled Vue SPA from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Write a custom nginx config with:
#   - SPA routing support (try_files → index.html)
#   - Reverse proxy for /api and /health → Express backend
# hadolint ignore=SC2016
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    # SPA routing — serve index.html for all non-file routes\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
\n\
    # Proxy API calls to Express backend\n\
    location /api {\n\
        proxy_pass http://backend:5000;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
    }\n\
\n\
    location /health {\n\
        proxy_pass http://backend:5000;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
