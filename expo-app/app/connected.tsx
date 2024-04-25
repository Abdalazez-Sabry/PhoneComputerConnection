import { StatusBar } from "expo-status-bar"
import * as React from "react"
import { Alert, View } from "react-native"
import { AlertProvider, useAlertContext } from "~/components/AlertSystem"
import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"
import { copyClipboard, sendPing, sendFile } from "~/utils/clientSocket"
import * as DocumentPicker from "expo-document-picker"

export default function Connected() {
  function handleCopy() {
    copyClipboard()
  }

  function handlePing() {
    sendPing("sending hello from phone ")
  }

  async function handleSendFile() {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
    })

    const assets = result.assets
    if (!assets) {
      return
    }

    for (let file of assets) {
      await sendFile(file)
    }
  }

  return (
    <View className="flex-1 justify-center items-center gap-5 p-6 bg-secondary/40">
      <Button
        variant="outline"
        onPress={handleSendFile}
        className="bg-secondary/10"
      >
        <Text>Send File</Text>
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
