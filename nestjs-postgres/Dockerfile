# =============================================================================
# Stage 1: Builder
# =============================================================================
# Use the official Node.js 22 Alpine image as the build base.
# Alpine is a minimal Linux distribution (~5MB) that keeps image sizes small.
# We install ALL dependencies (including devDependencies) here because we need
# the NestJS CLI and TypeScript compiler to build the application.
FROM node:22-alpine AS builder

# Set the working directory inside the container.
# All subsequent commands run relative to this path.
WORKDIR /app

# Copy package files first — before copying source code.
# This is a Docker layer caching optimization: if package.json and
# package-lock.json haven't changed, Docker reuses the cached npm install
# layer and skips re-downloading dependencies on every build.
COPY package*.json ./

# Install ALL dependencies including devDependencies.
# We need devDeps (TypeScript, @nestjs/cli) to compile the source.
RUN npm install

# Copy the rest of the source code into the builder stage.
COPY . .

# Compile TypeScript to JavaScript.
# Output goes to ./dist/ as configured in tsconfig.json.
RUN npm run build

# =============================================================================
# Stage 2: Production
# =============================================================================
# Start fresh with a clean Alpine image for the final production image.
# This "multi-stage" approach ensures the production image does NOT contain:
# - Source TypeScript files
# - TypeScript compiler
# - NestJS CLI
# - Any devDependencies
# Result: a much smaller, more secure production image.
FROM node:22-alpine AS production

WORKDIR /app

# Copy only package files — we'll install production deps only.
COPY package*.json ./

# npm ci --only=production:
# - ci   → clean install (faster, more deterministic than npm install)
# - --only=production → skips all devDependencies
RUN npm ci --only=production

# Copy the compiled JavaScript output from the builder stage.
# Only the dist/ folder is needed — no TypeScript source files.
COPY --from=builder /app/dist ./dist

# Switch to the non-root "node" user provided by the official Node.js image.
# Running as root inside a container is a security risk — if an attacker
# exploits the app, they'd have root access to the container filesystem.
USER node

# Expose port 3000 to the Docker network.
# This is documentation — it doesn't actually publish the port.
# The actual port mapping is defined in docker-compose.yml.
EXPOSE 3000

# Start the compiled application.
# Using the JSON array form (exec form) is preferred over shell form because:
# - It runs node directly (PID 1), receiving OS signals like SIGTERM cleanly
# - Shell form runs via /bin/sh -c, which may not forward signals properly
CMD ["node", "dist/main"]
