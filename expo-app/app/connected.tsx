import * as React from "react"
import { View } from "react-native"
import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"
import { copyClipboard, sendPing } from "~/utils/clientSocket"

export default function Screen() {
  function handleCopy() {
    copyClipboard()
  }

  function handlePing() {
    sendPing("sending hello from phone ")
  }

  return (
    <View className="flex-1 justify-center items-center gap-5 p-6 bg-secondary/40">
      <Button variant="outline" className="bg-secondary/10">
        <Text>Upload a File</Text>
      </Button>

      <Button
        onPress={handleCopy}
        variant="outline"
        className="bg-secondary/10"
      >
        <Text>Copy Cliboard From PC</Text>
      </Button>
      <Button
        onPress={handlePing}
        variant="outline"
        className="bg-secondary/10"
      >
        <Text>Send Ping Message</Text>
      </Button>
    </View>
  )
}
