#!/bin/bash

# Comprehensive script to set up and host the FINFOLIO environment

echo "🚀 Setting up and hosting the FINFOLIO environment..."

# Step 1: Set up the backend
echo "🔧 Setting up the backend..."
sudo ./backend-api/scripts/setup_all.sh

# Step 2: Clean and restart the frontend
echo "🧹 Cleaning and restarting the frontend..."
./frontend/scripts/clean_and_restart.sh

echo "✅ FINFOLIO environment setup and hosting complete!"
echo "🌐 Frontend is running at http://localhost:3000"
echo "🌐 Backend is running at http://localhost:3001"
