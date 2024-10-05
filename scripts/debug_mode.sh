#!/bin/bash
cd "$(dirname "$0")/.."  # Change to project root directory
export FRONTEND_TARGET=development
export FRONTEND_PORT=3000
export FLASK_ENV=development
docker-compose up