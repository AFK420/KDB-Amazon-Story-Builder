Write-Host "Fixing dependencies and building Novel Creator Studio..." -ForegroundColor Green
Write-Host ""

Write-Host "Step 1: Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

Write-Host "Step 2: Removing node_modules and package-lock.json..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "Removing node_modules folder..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force "node_modules"
}
if (Test-Path "package-lock.json") {
    Write-Host "Removing package-lock.json..." -ForegroundColor Cyan
    Remove-Item -Force "package-lock.json"
}

Write-Host "Step 3: Installing dependencies with legacy peer deps..." -ForegroundColor Yellow
npm install --legacy-peer-deps

Write-Host "Step 4: Building Next.js application..." -ForegroundColor Yellow
npm run build

Write-Host "Step 5: Creating executable with PKG..." -ForegroundColor Yellow
npm run build-exe

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "Build complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "Executable files are in the 'dist' folder:" -ForegroundColor White
Write-Host "- novel-creator-studio-win.exe (Windows)" -ForegroundColor Cyan
Write-Host "- novel-creator-studio-macos (macOS)" -ForegroundColor Cyan
Write-Host "- novel-creator-studio-linux (Linux)" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now distribute the .exe file!" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to continue"
