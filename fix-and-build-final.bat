@echo off
title Novel Creator Studio - Final Build
color 0A

echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║                    NOVEL CREATOR STUDIO                      ║
echo  ║                    Final Build Process                       ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.

echo [1/6] Clearing npm cache and old files...
npm cache clean --force >nul 2>&1
if exist node_modules rmdir /s /q node_modules >nul 2>&1
if exist package-lock.json del package-lock.json >nul 2>&1
if exist .next rmdir /s /q .next >nul 2>&1

echo [2/6] Installing dependencies...
npm install --legacy-peer-deps

if %errorlevel% neq 0 (
    echo ❌ Installation failed. Trying with --force...
    npm install --force
)

echo [3/6] Creating favicon and assets...
if not exist "public" mkdir public

echo [4/6] Building Next.js application...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed. Check the errors above.
    pause
    exit /b 1
)

echo [5/6] Creating executable with PKG...
npm run build-exe

echo [6/6] Verifying build...
if exist "dist\novel-creator-studio-win.exe" (
    echo.
    echo ✅ SUCCESS! Executable created successfully!
    echo.
    echo 📁 Location: dist\novel-creator-studio-win.exe
    echo 📏 Size: 
    for %%A in ("dist\novel-creator-studio-win.exe") do echo    %%~zA bytes
    echo.
    echo 🚀 To run: Double-click dist\novel-creator-studio-win.exe
    echo 🌐 The app will open in your browser automatically
    echo.
    echo ✨ Your Novel Creator Studio is ready to distribute!
    echo.
) else (
    echo ❌ Build failed. The executable was not created.
    echo Check the errors above for more information.
)

pause
