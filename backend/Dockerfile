FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies first (cache layer)
COPY package*.json ./
RUN npm install --only=production

# Copy source
COPY src/ ./src/

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 5000
CMD ["node", "src/index.js"]
