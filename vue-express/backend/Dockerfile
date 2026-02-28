# ============================================================
# Stage 1 — deps: install only production dependencies
# ============================================================
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* ./

# Install only production deps — keeps the final image lean
RUN npm ci --only=production

# ============================================================
# Stage 2 — production image
# ============================================================
FROM node:20-alpine AS production

WORKDIR /app

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Drop root privileges — run as the built-in 'node' user
USER node

EXPOSE 5000

CMD ["node", "server.js"]
