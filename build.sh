#!/bin/bash

# Install root dependencies
echo "Installing root dependencies..."
npm install --no-package-lock

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install --no-package-lock
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install --no-package-lock
cd ..

echo "Build completed successfully!" 