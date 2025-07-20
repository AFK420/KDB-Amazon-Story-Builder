@echo off
echo Fixing dependencies and building Novel Creator Studio...
echo.

echo Step 1: Clearing npm cache...
npm cache clean --force

echo Step 2: Removing node_modules and package-lock.json...
if exist node_modules (
    echo Removing node_modules folder...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo Removing package-lock.json...
    del package-lock.json
)

echo Step 3: Installing dependencies with legacy peer deps...
npm install --legacy-peer-deps

echo Step 4: Building Next.js application...
npm run build

echo Step 5: Creating executable with PKG...
npm run build-exe

echo.
echo ================================
echo Build complete!
echo ================================
echo Executable files are in the 'dist' folder:
echo - novel-creator-studio-win.exe (Windows)
echo - novel-creator-studio-macos (macOS)  
echo - novel-creator-studio-linux (Linux)
echo.
echo You can now distribute the .exe file!
echo.
pause
