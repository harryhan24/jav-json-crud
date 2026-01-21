# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code (excluding data directory)
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Set NODE_ENV
ENV NODE_ENV=production

# Copy package files
COPY --from=builder /app/package*.json ./

# Install production dependencies only
RUN npm ci --production

# Copy built files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Copy lib and app directories (needed for API routes)
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/app ./app
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Create data directory (will be mounted or use DATA_DIR env variable)
RUN mkdir -p /app/data

# Expose port
EXPOSE 3000

# Start the application
CMD ["sh", "-c", "echo 'Starting Next.js application on port 3000...' && npm start"]
