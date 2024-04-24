import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"

import "./index.css"

import "./demos/ipc"
import { ThemeProvider } from "./components/ThemeProvider"
import { AlertProvider } from "./components/AlertSystem"
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AlertProvider>
        <App />
      </AlertProvider>
    </ThemeProvider>
  </React.StrictMode>
)

postMessage({ payload: "removeLoading" }, "*")
