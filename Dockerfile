# --- Stage 1: The Builder ---
# In this stage, we install ALL dependencies (including dev) and build the code.
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies, including devDependencies needed for the build
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the TypeScript code into JavaScript
RUN npm run build

# --- Stage 2: The Production Image ---
# This stage creates the final, lean image with only what's needed to run.
FROM node:20-alpine
WORKDIR /app

# Copy package files again
COPY package*.json ./

# Install ONLY production dependencies
RUN npm install --omit=dev

# Copy the compiled code from the 'builder' stage
COPY --from=builder /app/dist ./dist

# Expose the port the server will listen on
EXPOSE 8080

# The command to start the web server
CMD [ "npm", "start" ]
