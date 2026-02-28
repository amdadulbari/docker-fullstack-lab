# =============================================================================
# Stage 1 — deps
# Install production dependencies in an isolated layer so that the final
# image only ships node_modules that are actually needed at runtime.
# Using npm ci (rather than npm install) guarantees a reproducible install
# locked to package-lock.json.
# =============================================================================
FROM node:22-alpine AS deps

WORKDIR /app

# Copy manifest files first to exploit Docker layer caching:
# node_modules is only re-installed when package*.json changes.
COPY package*.json ./

RUN npm ci --only=production

# =============================================================================
# Stage 2 — production
# Copy only what is needed to run the server: the pre-built node_modules from
# the deps stage and the application source code.
# Running as the non-root "node" user follows the principle of least privilege.
# =============================================================================
FROM node:22-alpine AS production

WORKDIR /app

# Run as non-root for security best practice.
USER node

# Copy production dependencies from the deps stage.
COPY --from=deps --chown=node:node /app/node_modules ./node_modules

# Copy application source.
COPY --chown=node:node . .

EXPOSE 4000

CMD ["node", "server.js"]
