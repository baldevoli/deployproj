# PowerShell script to start the Retriever Essentials application
# This script will start both the backend and frontend servers

Write-Host "Starting Retriever Essentials app..." -ForegroundColor Green

# Check if required directories exist
if (-not (Test-Path ".\cmsc-447proj-main\cmsc-447proj-main\backend")) {
    Write-Host "Error: Backend directory not found!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path ".\cmsc-447proj-main\cmsc-447proj-main\frontend")) {
    Write-Host "Error: Frontend directory not found!" -ForegroundColor Red
    exit 1
}

# Define functions for starting servers
function Start-BackendServer {
    Write-Host "Starting backend server..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd .\cmsc-447proj-main\cmsc-447proj-main\backend; node server.js"
}

function Start-FrontendServer {
    Write-Host "Starting frontend development server..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd .\cmsc-447proj-main\cmsc-447proj-main\frontend; npm run dev"
}

# Main execution
Start-BackendServer
Start-Sleep -Seconds 2  # Give the backend a moment to start
Start-FrontendServer

Write-Host "Both servers have been started!" -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Note: You can close the application by closing both PowerShell windows." -ForegroundColor Gray 