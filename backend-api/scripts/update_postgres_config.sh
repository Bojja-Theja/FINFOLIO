#!/bin/bash

# Script to update PostgreSQL configuration for password authentication

echo "Updating PostgreSQL configuration for password authentication..."

# Check if the pg_hba.conf file exists
PG_HBA_CONF="/etc/postgresql/*/main/pg_hba.conf"
if [ ! -f $PG_HBA_CONF ]; then
    echo "PostgreSQL configuration file not found. Please ensure PostgreSQL is installed."
    exit 1
fi

# Backup the original configuration file
echo "Backing up the original configuration file..."
sudo cp $PG_HBA_CONF ${PG_HBA_CONF}.bak

# Update the configuration to use password authentication for local connections
echo "Updating the configuration to use password authentication..."
sudo sed -i 's/^local\s\+all\s\+all\s\+peer/local\tall\tall\tmd5/' $PG_HBA_CONF

# Restart PostgreSQL to apply the changes
echo "Restarting PostgreSQL to apply the changes..."
sudo systemctl restart postgresql

echo "PostgreSQL configuration updated successfully!"