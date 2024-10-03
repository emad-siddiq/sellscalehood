#!/bin/bash
cd "$(dirname "$0")/.."  # Change to project root directory
export FRONTEND_TARGET=production
export FRONTEND_PORT=80
export FLASK_ENV=production
docker-compose up --build