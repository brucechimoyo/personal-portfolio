# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies if any
RUN npm install --only=production 2>/dev/null || true

# Production stage with nginx
FROM nginx:alpine

# Install certbot for Let's Encrypt SSL
RUN apk add --no-cache certbot openssl

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static files
WORKDIR /usr/share/nginx/html
COPY --from=builder /app ./ 2>/dev/null || true
COPY . .

# Create directory for SSL certificates
RUN mkdir -p /etc/letsencrypt/live

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
