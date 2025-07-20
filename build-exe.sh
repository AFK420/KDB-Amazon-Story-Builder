#!/bin/bash
echo "Building Novel Creator Studio..."

echo "Step 1: Installing dependencies..."
npm install

echo "Step 2: Building Next.js application..."
npm run build

echo "Step 3: Creating executable with PKG..."
npm run build-exe

echo "Step 4: Build complete!"
echo "Executable files are in the 'dist' folder."
echo ""
echo "Available executables:"
echo "- novel-creator-studio-win.exe (Windows)"
echo "- novel-creator-studio-macos (macOS)"
echo "- novel-creator-studio-linux (Linux)"
