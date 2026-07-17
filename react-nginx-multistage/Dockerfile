# =============================================================================
# Multi-stage Dockerfile — PRODUCTION build
# -----------------------------------------------------------------------------
# A React app doesn't need Node.js to *run* in production — it compiles down to
# plain static HTML/CSS/JS. So we use TWO stages:
#
#   Stage 1 (builder): a full Node image compiles the app into a `dist/` folder.
#   Stage 2 (runtime): a tiny nginx image serves that `dist/` — and Node, npm,
#                      node_modules and the source code are all LEFT BEHIND.
#
# Only the final stage becomes the image. Everything in the builder stage is
# discarded, so the shipped image is small (just nginx + static files) and has a
# smaller attack surface (no build toolchain inside it).
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1 — builder
# -----------------------------------------------------------------------------
# Naming the stage (`AS builder`) lets the next stage copy files from it.
FROM node:22-alpine AS builder

WORKDIR /app

# Copy manifests first and install — cached until dependencies change.
COPY package*.json ./

# `npm ci` gives clean, reproducible installs from package-lock.json. It falls
# back to `npm install` here so the project also builds without a committed lock.
RUN npm ci || npm install

# Copy the source and produce the optimised, minified static build in dist/.
COPY . .
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2 — runtime (this is the final image)
# -----------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# Replace nginx's default site config with our SPA-aware one (see nginx.conf).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy ONLY the compiled assets from the builder stage. Note `--from=builder`:
# nothing else from stage 1 (node_modules, source, npm) comes across.
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx serves on port 80 inside the container.
EXPOSE 80

# The official nginx image already defines a correct CMD, but we state it
# explicitly for clarity. `daemon off;` keeps nginx in the foreground so the
# container stays alive (a container exits when its main process exits).
CMD ["nginx", "-g", "daemon off;"]
