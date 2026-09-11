#!/bin/bash

# Comprehensive script to set up PostgreSQL and start the backend server

echo "🚀 Setting up FINFOLIO environment..."

# Check if PostgreSQL is running
echo "🔍 Checking if PostgreSQL is running..."
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL and try again."
    exit 1
fi

# Create the PostgreSQL user and database
echo "🔧 Creating PostgreSQL user and database..."
sudo -u postgres psql -c "CREATE ROLE \"user\" WITH LOGIN PASSWORD 'password';"
sudo -u postgres psql -c "CREATE DATABASE finfolio OWNER \"user\";"

# Update PostgreSQL configuration for password authentication
echo "📝 Updating PostgreSQL configuration for password authentication..."
PG_HBA_CONF="/etc/postgresql/*/main/pg_hba.conf"
if [ -f $PG_HBA_CONF ]; then
    sudo cp $PG_HBA_CONF ${PG_HBA_CONF}.bak
    sudo sed -i 's/^local\s\+all\s\+all\s\+peer/local\tall\tall\tmd5/' $PG_HBA_CONF
    echo "✅ PostgreSQL configuration updated successfully!"
else
    echo "⚠️ PostgreSQL configuration file not found. Skipping configuration update."
fi

# Restart PostgreSQL to apply the changes
echo "🔄 Restarting PostgreSQL to apply the changes..."
sudo systemctl restart postgresql

# Start the backend server
echo "🚀 Starting the backend server..."
cd backend-api && npm run dev &

# Wait for the backend server to start
sleep 5

echo "✅ FINFOLIO environment setup complete!"
echo "🌐 Frontend is running at http://localhost:3000"
echo "🌐 Backend is running at http://localhost:3001"
