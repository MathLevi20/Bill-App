# Use Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies required for Prisma
RUN apk add --no-cache openssl libc6-compat

# Copy package files
COPY package*.json yarn.lock ./

# Install dependencies using yarn
RUN yarn install --frozen-lockfile

# Copy Prisma schema and generate Prisma Client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy application source code
COPY . .

# Build the application
RUN yarn build

# Expose the application port
EXPOSE 4000

# Start the application
CMD ["yarn", "start:prod"]
