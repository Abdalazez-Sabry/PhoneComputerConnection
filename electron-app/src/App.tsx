import { ThemeProvider } from "@/components/ThemeProvider"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import {
  connectToWebSocket,
  copyClipboard,
  sendPing,
} from "@/utils/clientSocket"
import { Socket } from "socket.io"
import { DefaultEventsMap } from "socket.io/dist/typed-events"

function App() {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    setIsConnecting(false)
  }, [isConnected])

  function handleConnect() {
    setIsConnecting(true)
    connectToWebSocket(setIsConnected)
  }

  function handleCopy() {
    console.log("handle copy")
    copyClipboard()
  }
  function handlePingMessage() {
    sendPing("Hello")
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex flex-col items-center w-screen h-screen">
        {isConnected ? (
          <>
            <div className="w-full bg-popover flex justify-center p-5">
              <h1>Here will be the phone stats</h1>
            </div>
            <div className="h-full flex flex-col items-center justify-center ">
              <div className=" flex gap-4 items-center justify-center ">
                <Button variant="outline">Send File</Button>
                <Button variant="outline" onClick={handleCopy}>
                  Copy Phone's cliboard
                </Button>
              </div>
              <div className=" flex gap-4 items-center justify-center">
                <Button variant="outline">Get Phone's Notifications</Button>
                <Button variant="outline" onClick={handlePingMessage}>
                  {" "}
                  Send Ping Message{" "}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Button
              disabled={isConnecting}
              onClick={handleConnect}
              size="lg"
              variant="outline"
              className="text-2xl p-10"
            >
              Connect
            </Button>
          </div>
        )}
      </div>
    </ThemeProvider>
  )
}

export default App
