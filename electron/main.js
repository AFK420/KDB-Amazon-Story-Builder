const { app, BrowserWindow, Menu } = require("electron")
const { spawn } = require("child_process")
const path = require("path")
const isDev = process.env.NODE_ENV === "development"

let mainWindow
let serverProcess

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, "../public/icon.png"),
    title: "Novel Creator Studio",
    show: false,
  })

  // Start the Next.js server
  if (!isDev) {
    serverProcess = spawn("node", [path.join(__dirname, "../server.js")], {
      cwd: path.join(__dirname, ".."),
      stdio: "inherit",
    })
  }

  // Load the app
  const startUrl = isDev ? "http://localhost:3000" : "http://localhost:3000"

  // Wait a moment for server to start, then load
  setTimeout(
    () => {
      mainWindow.loadURL(startUrl)
      mainWindow.show()
    },
    isDev ? 1000 : 3000,
  )

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null
    if (serverProcess) {
      serverProcess.kill()
    }
  })
}

// App event handlers
app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    if (serverProcess) {
      serverProcess.kill()
    }
    app.quit()
  }
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Create application menu
const template = [
  {
    label: "File",
    submenu: [
      {
        label: "New Story",
        accelerator: "CmdOrCtrl+N",
        click: () => {
          mainWindow.webContents.send("new-story")
        },
      },
      {
        label: "Save Story",
        accelerator: "CmdOrCtrl+S",
        click: () => {
          mainWindow.webContents.send("save-story")
        },
      },
      { type: "separator" },
      {
        label: "Exit",
        accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
        click: () => {
          app.quit()
        },
      },
    ],
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
    ],
  },
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      { role: "toggleDevTools" },
      { type: "separator" },
      { role: "resetZoom" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { type: "separator" },
      { role: "togglefullscreen" },
    ],
  },
  {
    label: "Help",
    submenu: [
      {
        label: "About Novel Creator Studio",
        click: () => {
          // Show about dialog
        },
      },
    ],
  },
]

Menu.setApplicationMenu(Menu.buildFromTemplate(template))
