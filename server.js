const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = process.env.PORT || 3000

// Create Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error("Error occurred handling", req.url, err)
      res.statusCode = 500
      res.end("internal server error")
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Novel Creator Studio ready on http://${hostname}:${port}`)

    // Auto-open browser in production
    if (!dev) {
      const { exec } = require("child_process")
      const url = `http://${hostname}:${port}`

      // Cross-platform browser opening
      const start = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open"

      exec(`${start} ${url}`)
    }
  })
})
