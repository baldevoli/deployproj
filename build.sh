#!/bin/bash

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install and build frontend
echo "Installing frontend dependencies..."
cd frontend
npm install
npm run build
cd ..

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

echo "Build completed successfully!" 