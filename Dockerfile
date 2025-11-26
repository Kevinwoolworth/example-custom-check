# Use Node.js 20 to match the preference from your dependencies
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy the rest of the source code
COPY . .

# Build the TypeScript code into JavaScript
RUN npm run build

# Expose the port Cloud Run will use
EXPOSE 8080

# Run the new "start" script from package.json
CMD [ "npm", "start" ]
