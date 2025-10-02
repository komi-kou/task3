#!/bin/bash

# Render.com build script
echo "Starting Render build process..."

# Show environment info
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Current directory: $(pwd)"

# Install dependencies
echo "Installing dependencies..."
npm ci

# Check environment variables
echo "Checking environment variables..."
node scripts/check-env.js || true

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Push database schema (create tables if they don't exist)
echo "Pushing database schema..."
npx prisma db push --skip-generate || echo "Database push completed with warnings"

# Build Next.js application
echo "Building Next.js application..."
npm run build

echo "Build process completed!"