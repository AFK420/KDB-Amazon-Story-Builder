@echo off
title Novel Creator Studio - Quick Fix
color 0A

echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║                    NOVEL CREATOR STUDIO                      ║
echo  ║                      Dependency Fix                          ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.

echo [1/5] Clearing npm cache...
npm cache clean --force >nul 2>&1

echo [2/5] Removing old files...
if exist node_modules rmdir /s /q node_modules >nul 2>&1
if exist package-lock.json del package-lock.json >nul 2>&1

echo [3/5] Installing dependencies (this may take a few minutes)...
npm install --legacy-peer-deps

if %errorlevel% neq 0 (
    echo.
    echo ❌ Installation failed. Trying alternative method...
    npm install --force
)

echo [4/5] Building application...
npm run build

echo [5/5] Creating executable...
npm run build-exe

echo.
if exist "dist\novel-creator-studio-win.exe" (
    echo ✅ SUCCESS! Executable created successfully!
    echo.
    echo 📁 Location: dist\novel-creator-studio-win.exe
    echo 📏 Size: 
    for %%A in ("dist\novel-creator-studio-win.exe") do echo    %%~zA bytes
    echo.
    echo 🚀 You can now run: dist\novel-creator-studio-win.exe
    echo.
) else (
    echo ❌ Build failed. Check the errors above.
)

pause
