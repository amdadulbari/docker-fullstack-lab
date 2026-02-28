# Dockerfile - Multi-stage build for the Express + MongoDB API
#
# Why multi-stage?
# The "deps" stage installs npm packages. The final "production" stage copies
# only the installed packages and application source — no build tools, no
# npm cache, no dev files. This keeps the final image lean and secure.

# =============================================================================
# Stage 1: deps — install production dependencies
# =============================================================================
FROM node:22-alpine AS deps

# Set a working directory inside the container
WORKDIR /app

# Copy package manifests first.
# Docker caches each layer. By copying package files BEFORE copying source code,
# npm ci only re-runs when package.json or package-lock.json actually changes —
# not on every source code edit. This dramatically speeds up iterative builds.
COPY package*.json ./

# npm ci installs exact versions from package-lock.json (reproducible builds).
# --only=production omits devDependencies (nodemon, etc.) from the final image.
RUN npm ci --only=production

# =============================================================================
# Stage 2: production — the final, slim runtime image
# =============================================================================
FROM node:22-alpine AS production

# Set working directory
WORKDIR /app

# Copy the installed node_modules from the deps stage.
# We never run npm install here — that keeps the image clean.
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY src/ ./src/
COPY server.js ./
COPY package.json ./

# Switch to the non-root 'node' user that is built into node:alpine images.
# Running as root inside a container is a security risk — USER node prevents
# a compromised process from having write access to the filesystem.
USER node

# Document which port the application listens on (informational; does not
# actually publish the port — that is done in docker-compose.yml or docker run).
EXPOSE 3000

# The command to run when the container starts.
# Using the array form (exec form) avoids spawning a shell process,
# so signals like SIGTERM are delivered directly to the Node process.
CMD ["node", "server.js"]
