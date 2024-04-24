import { ThemeProvider } from "@/components/ThemeProvider"
import { Button } from "@/components/ui/button"
import { ChangeEvent, LegacyRef, useEffect, useRef, useState } from "react"
import {
  connectToWebSocket,
  copyClipboard,
  sendFile,
  sendPing,
} from "@/utils/clientSocket"
import { AlertContext, useAlertContext } from "./components/AlertSystem"

function App() {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const alertContext = useAlertContext()

  useEffect(() => {
    setIsConnecting(false)
  }, [isConnected])

  function handleConnect() {
    setIsConnecting(true)
    connectToWebSocket(setIsConnected, alertContext)
  }

  function handleCopy() {
    copyClipboard()
  }
  function handlePingMessage() {
    sendPing("Hello")
  }

  function handleSendFileButton() {
    fileInputRef.current?.click()
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.item(0)
    if (!file) {
      return
    }

    console.log("change", file.name)
    sendFile(file)
  }

  return (
    <div className="flex flex-col items-center w-screen h-screen">
      {isConnected ? (
        <>
          <div className="w-full bg-popover flex justify-center p-5">
            <h1>Here will be the phone stats</h1>
          </div>
          <div className="h-full flex flex-col items-center justify-center ">
            <div className=" flex gap-4 items-center justify-center ">
              <Button variant="outline" onClick={handleSendFileButton}>
                Send File
              </Button>
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
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        multiple={false}
      />
    </div>
  )
}

export default App
