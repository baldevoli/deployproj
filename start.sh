#!/bin/bash

echo -e "\033[0;32mStarting Retriever Essentials app...\033[0m"

# Check if required directories exist
if [ ! -d "./backend" ]; then
  echo -e "\033[0;31mError: Backend directory not found!\033[0m"
  exit 1
fi

if [ ! -d "./frontend" ]; then
  echo -e "\033[0;31mError: Frontend directory not found!\033[0m"
  exit 1
fi

# Start backend in a new Terminal tab
echo -e "\033[0;33mStarting backend server...\033[0m"
osascript <<EOF
tell application "Terminal"
    do script "cd \"$(pwd)/backend\"; npm start"
end tell
EOF

# Wait briefly to let the backend start
sleep 2

# Start frontend in a new Terminal tab
echo -e "\033[0;33mStarting frontend development server...\033[0m"
osascript <<EOF
tell application "Terminal"
    do script "cd \"$(pwd)/frontend\"; npm run dev"
end tell
EOF

echo -e "\033[0;32mBoth servers have been started!\033[0m"
echo -e "\033[0;36mBackend: http://localhost:5000\033[0m"
echo -e "\033[0;36mFrontend: http://localhost:3000\033[0m"
echo -e "\033[0;90mNote: You can close the application by closing both Terminal tabs.\033[0m"
