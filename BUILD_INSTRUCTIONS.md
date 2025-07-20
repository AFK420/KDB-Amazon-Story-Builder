# Building Novel Creator Studio as Executable

## Method 1: PKG (Node.js Executable) - Recommended

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Steps
1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Build the application:**
   \`\`\`bash
   npm run build
   \`\`\`

3. **Create executable:**
   \`\`\`bash
   npm run build-exe
   \`\`\`

4. **Run the executable:**
   - Windows: `dist/novel-creator-studio-win.exe`
   - macOS: `dist/novel-creator-studio-macos`
   - Linux: `dist/novel-creator-studio-linux`

### Quick Build (Windows)
Double-click `build-exe.bat`

### Quick Build (macOS/Linux)
\`\`\`bash
chmod +x build-exe.sh
./build-exe.sh
\`\`\`

## Method 2: Electron (Desktop App)

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Steps
1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Build Electron app:**
   \`\`\`bash
   npm run build-electron
   \`\`\`

3. **Find installer in:**
   - Windows: `dist-electron/Novel Creator Studio Setup.exe`
   - macOS: `dist-electron/Novel Creator Studio.dmg`
   - Linux: `dist-electron/Novel Creator Studio.AppImage`

## Method 3: Tauri (Rust-based, smallest size)

### Prerequisites
- Node.js 18+ installed
- Rust installed (https://rustup.rs/)

### Steps
1. **Install Tauri CLI:**
   \`\`\`bash
   npm install -g @tauri-apps/cli
   \`\`\`

2. **Build Tauri app:**
   \`\`\`bash
   npm run build-tauri
   \`\`\`

## Method 4: Docker (Cross-platform)

### Prerequisites
- Docker installed

### Steps
1. **Build Docker image:**
   \`\`\`bash
   docker build -t novel-creator-studio .
   \`\`\`

2. **Run with Docker Compose:**
   \`\`\`bash
   docker-compose up
   \`\`\`

3. **Access at:** http://localhost:3000

## Method 5: Simple Server (No build required)

### Steps
1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Run directly:**
   \`\`\`bash
   node server.js
   \`\`\`

3. **Or use batch file (Windows):**
   Double-click `run-app.bat`

## Recommended Approach

For **easiest distribution**: Use **PKG method** - creates a single executable file that users can run without installing Node.js.

For **best user experience**: Use **Electron method** - creates a proper desktop application with installer.

For **smallest file size**: Use **Tauri method** - creates the most efficient executable.

For **server deployment**: Use **Docker method** - easiest to deploy on servers.

## File Sizes (Approximate)
- PKG executable: ~50-80 MB
- Electron app: ~150-200 MB
- Tauri app: ~15-30 MB
- Docker image: ~100-150 MB

## Distribution
After building, you can distribute:
- The single executable file (PKG)
- The installer (Electron)
- The portable app (Tauri)
- The Docker image (Docker)

Users can run your application without needing to install Node.js or any dependencies.
