import { Link, router } from "expo-router"
import * as React from "react"
import { View } from "react-native"
import { AlertContext, useAlertContext } from "~/components/AlertSystem"
import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"
import { connectToWebSocket } from "~/utils/clientSocket"

export default function Screen() {
  const [isConnected, setIsConnected] = React.useState(false)
  const [isConnecting, setIsConnecting] = React.useState(false)
  const alertContext = useAlertContext()

  React.useEffect(() => {
    if (isConnecting) {
      setIsConnecting(false)
      router.navigate("/connected")
    }
  }, [isConnected])

  function handleConnect() {
    setIsConnecting(true)
    connectToWebSocket(setIsConnected, alertContext)
  }

  return (
    <View className="flex-1 justify-center items-center gap-5 p-6 bg-secondary/40">
      <Button
        disabled={isConnecting}
        variant="outline"
        className="bg-secondary/10"
        onPress={handleConnect}
      >
        <Text>Connect</Text>
      </Button>
    </View>
  )
}
