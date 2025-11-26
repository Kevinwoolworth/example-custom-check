# Use Node LTS
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --only=production

# Copy source
COPY . .

# Build (if TypeScript)
RUN npm run build

# Use a simple command to run the built code
CMD ["node", "dist/index.js"]
