# ====================================================================
# Dockerfile
# Builds the frontend using Vite and serves it from backend using Node
# ====================================================================

# ============================================
# Stage 1: Build Frontend
# ============================================
FROM node:24.12.1-alpine AS frontend-build
WORKDIR /app/frontend

# Copy frontend folder's package files
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
FROM node:24.12.1-alpine AS backend-prod-deps
WORKDIR /app

# Copy our backend folder's package files
# Again, we copy these first to leverage Docker's layer caching
# If the package*.json files don't change, Docker reuses the cached layer
COPY backend/package*.json ./

# Install ONLY the production dependencies and none of the devDependencies from our backend's package.json.
# None of the devDependencies in our backend's package.json (e.g., pino-pretty, prettier, nodemon, husky, eslint etc.) are necessary to BUILD our backend.
# In contrast, our frontend uses a build tool, "Vite" which is listed as a devDependency.
RUN npm ci --omit=dev

# ============================================
# Stage 3: Production - Final Image
# ============================================
FROM node:24.12.0-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copy the installed backend production dependencies to /app/backend/node_modules
COPY --from=backend-prod-deps --chown=nodejs:nodejs /app/node_modules ./backend/node_modules

# Copy the backend source code to /app/backend/
COPY --chown=nodejs:nodejs backend/src ./backend/src
COPY --chown=nodejs:nodejs backend/package*.json ./backend/

# Copy the built frontend to /app/frontend/dist
COPY --from=frontend-build --chown=nodejs:nodejs /app/frontend/dist ./frontend/dist

# Switch to a non-root user
USER nodejs

# Change the working directory to /app/backend
WORKDIR /app/backend

# Expose the port your server listens on
# This step is just metadata and is not necessary to connect our host machine's port to the container's port.
EXPOSE 3000

# Health check (optional but recommended)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server
CMD ["node", "./src/server.js"]