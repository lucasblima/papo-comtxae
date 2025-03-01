Write-Host "Stopping all Node.js processes..." -ForegroundColor Cyan
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "Node processes terminated." -ForegroundColor Green

Write-Host "Clearing Next.js cache..." -ForegroundColor Cyan
if (Test-Path -Path ".next") {
    Remove-Item -Recurse -Force ".next"
}

Write-Host "Restarting backend server..." -ForegroundColor Cyan
Push-Location -Path "src\backend"
Start-Process -FilePath "uvicorn" -ArgumentList "main:app", "--reload" -WindowStyle Normal
Pop-Location

Write-Host "Reinstalling frontend dependencies..." -ForegroundColor Cyan
try {
    npm install
} catch {
    Write-Host "npm install failed, trying yarn..." -ForegroundColor Yellow
    yarn
}

Write-Host "Starting Next.js development server..." -ForegroundColor Cyan
try {
    npm run dev
} catch {
    Write-Host "npm run dev failed, trying yarn dev..." -ForegroundColor Yellow
    yarn dev
}

Write-Host "Development environment restarted!" -ForegroundColor Green
Write-Host "If you still don't see your changes, try a hard refresh (Ctrl+F5)" -ForegroundColor Yellow
