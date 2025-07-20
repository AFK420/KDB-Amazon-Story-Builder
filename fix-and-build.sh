#!/bin/bash
echo "Fixing dependencies and building Novel Creator Studio..."

echo "Step 1: Clearing npm cache..."
npm cache clean --force

echo "Step 2: Removing node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

echo "Step 3: Installing dependencies with legacy peer deps..."
npm install --legacy-peer-deps

echo "Step 4: Building Next.js application..."
npm run build

echo "Step 5: Creating executable with PKG..."
npm run build-exe

echo ""
echo "Build complete!"
echo "Executable files are in the 'dist' folder."
