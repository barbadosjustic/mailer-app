FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy backend
COPY backend ./backend

# Copy frontend build
COPY frontend/dist ./frontend/dist

# Install backend dependencies
WORKDIR /app/backend
RUN npm install --production

# Expose app port
EXPOSE 4000

# Start server
CMD ["node", "server.js"]

