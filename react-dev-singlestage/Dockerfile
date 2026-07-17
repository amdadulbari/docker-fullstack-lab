# =============================================================================
# Single-stage Dockerfile — DEVELOPMENT mode
# -----------------------------------------------------------------------------
# Goal: run the Vite dev server inside a container with hot-reload (HMR) so a
# developer can edit source on the host and see changes instantly in the browser.
#
# This is a SINGLE-STAGE build: there is exactly one `FROM`. The image keeps the
# full Node.js toolchain and all dependencies because the dev server needs them
# at runtime. That makes the image large — which is fine for development, but is
# exactly why we use a MULTI-STAGE build for production (see the sibling project
# `react-nginx-multistage`).
# =============================================================================

# Start from an official Node image. `alpine` is a tiny Linux distro, so even
# our "large" dev image stays reasonable. The tag pins the major version (22)
# for reproducible builds.
FROM node:22-alpine

# Every following command runs inside this directory. Docker creates it for us.
WORKDIR /app

# --- Dependency layer (cached) ----------------------------------------------
# Copy ONLY the manifest files first, then install. Docker caches each layer and
# only rebuilds a layer when its inputs change. Because source code changes far
# more often than package.json, copying manifests separately means `npm install`
# is re-run only when dependencies actually change — not on every code edit.
COPY package*.json ./

# `npm install` (not `npm ci`) is used here: in a teaching/dev setup we want it
# to succeed even if package-lock.json is missing. It installs devDependencies
# too (Vite, the React plugin) — those ARE needed to run the dev server.
RUN npm install

# --- Source ------------------------------------------------------------------
# Copy the rest of the app. In practice a bind-mount from docker-compose.yml
# overlays this at runtime so edits on the host reach the container live; the
# COPY still lets `docker run` work standalone without compose.
COPY . .

# Document the port the dev server listens on. EXPOSE is informational only —
# you still publish the port with `-p` or compose's `ports:`.
EXPOSE 5173

# Start Vite's development server. `--host 0.0.0.0` (also set in vite.config.js)
# makes it listen on all interfaces so the mapped host port can reach it.
CMD ["npm", "run", "dev"]
