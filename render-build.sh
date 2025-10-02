#!/bin/bash
set -e

echo "=== Render Build Script ==="
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

echo "Installing dependencies..."
npm ci

echo "Running build:render script..."
npm run build:render

echo "Build completed successfully!"