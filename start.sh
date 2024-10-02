#!/bin/bash

# Start Docker services
docker-compose up -d

echo "Application is starting..."
echo "Backend will be available at http://localhost:5000"
echo "Frontend will be available at http://localhost:3000"