# Stage 1: Build static assets with Node
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files and build static bundle
COPY . .
RUN npm run build

# Stage 2: Serve static files with lightweight Nginx
FROM nginx:alpine

# Copy built assets from builder stage into Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]