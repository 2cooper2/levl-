import fs from "fs"
import path from "path"
import { DEFAULT_SERVICE_WORKER_CONTENT } from "../app/service-worker-robust"

const SW_PATH = path.join(process.cwd(), "public", "sw.js")

function generateServiceWorker() {
  try {
    // Create the public directory if it doesn't exist
    const publicDir = path.dirname(SW_PATH)
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true })
    }

    // Write the service worker file
    fs.writeFileSync(SW_PATH, DEFAULT_SERVICE_WORKER_CONTENT)
    console.log("Service worker generated at", SW_PATH)
  } catch (error) {
    console.error("Error generating service worker:", error)
  }
}

generateServiceWorker()
