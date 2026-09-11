#!/bin/bash

# Script to set up PostgreSQL user and database for CAPSTACK

echo "Setting up PostgreSQL for CAPSTACK..."

# Check if PostgreSQL is running
echo "Checking if PostgreSQL is running..."
if ! pg_isready -q; then
    echo "PostgreSQL is not running. Please start PostgreSQL and try again."
    exit 1
fi

# Create the PostgreSQL user and database
echo "Creating PostgreSQL user and database..."
sudo -u postgres psql -c "CREATE ROLE \"user\" WITH LOGIN PASSWORD 'password';"
sudo -u postgres psql -c "CREATE DATABASE capstack OWNER \"user\";"

echo "PostgreSQL user and database setup complete!"