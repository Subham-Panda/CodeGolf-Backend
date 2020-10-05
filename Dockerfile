FROM node:lts-alpine

# Working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --silent

# Copy source
COPY . .

# Start server
CMD ["npm", "start"]
