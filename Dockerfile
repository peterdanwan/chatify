# ============================================
# Monolithic Dockerfile
# Builds frontend and serves it from backend
# ============================================

# ============================================
# Stage 1: Build Frontend
# ============================================
FROM node:24.11.1-alpine AS frontend-build
WORKDIR /app/frontend

# Copy frontend package files
# We copy these first to leverage Docker's layer caching
# If the package*.json files don't change, Docker reuses the cached layer
COPY frontend/package*.json ./

# Install frontend dependencies
# NOTE: unlike the backend, we actually require the vite devDependency to run "npm run build"
#       that is why we can't add the "--omit=dev" flag to "npm ci".
RUN npm ci

# Copy frontend source code
COPY frontend/ ./

# Build the frontend (creates dist folder using the "vite" devDependency)
RUN npm run build

# ============================================
# Stage 2: Backend Production Dependencies
# ============================================
FROM node:24.11.1-alpine AS backend-prod-deps
WORKDIR /app

# Copy backend package files for dependency installation
# We copy these first to leverage Docker's layer caching
# If the package*.json files don't change, Docker reuses the cached layer
COPY backend/package*.json ./

# Install ONLY production dependencies
# None of the devDependencies (e.g., pino-pretty, prettier, nodemon, husky, eslint etc.) are necessary to BUILD our backend.
# However, our frontend uses a build tool, "Vite" which is listed as a devDependency.
RUN npm ci --omit=dev

# ============================================
# Stage 3: Production - Final Image
# ============================================
FROM node:24.11.1-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copy backend production dependencies to /app/backend/node_modules
COPY --from=backend-prod-deps --chown=nodejs:nodejs /app/node_modules ./backend/node_modules

# Copy backend source code to /app/backend/
COPY --chown=nodejs:nodejs backend/src ./backend/src
COPY --chown=nodejs:nodejs backend/package*.json ./backend/

# Copy built frontend to /app/frontend/dist
# Now ../../frontend/dist from /app/backend/src will work!
COPY --from=frontend-build --chown=nodejs:nodejs /app/frontend/dist ./frontend/dist

# Switch to non-root user
USER nodejs

# Change working directory to backend
WORKDIR /app/backend

# Expose the port your server listens on
EXPOSE 3000

# Health check (optional but recommended)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server
CMD ["node", "src/server.js"]