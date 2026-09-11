#!/bin/bash

# Script to clean Next.js cache and restart the frontend server

echo "🧹 Cleaning Next.js cache and restarting the frontend server..."

# Stop the frontend server if it is running
pkill -f "next dev"

# Remove the .next directory
rm -rf .next

# Remove the node_modules/.cache directory
rm -rf node_modules/.cache

# Restart the frontend server
echo "🚀 Restarting the frontend server..."
npm run dev

echo "✅ Frontend server restarted successfully!"
