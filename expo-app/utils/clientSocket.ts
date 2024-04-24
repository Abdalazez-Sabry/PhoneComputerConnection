import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "../../shared/socket.ioTypes"
import * as Clipboard from 'expo-clipboard';
import { IAlertContext } from "~/components/AlertSystem";

const PORT = "9500"

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
let alertContext: IAlertContext | null = null


export function connectToWebSocket(setIsConnected: Function, alertContx: IAlertContext) {
    const URL = `http://192.168.1.12:${PORT}`
    socket = io(URL)
    alertContext = alertContx

    socket.on("connect", () => {
        console.log(`Connected to the server, socket id: ${socket?.id}`)
        socket?.emit('message:deviceType', "phone")
        setIsConnected(true)
        alertContext?.add({
            title: "Connected successfully",
            description: ``
        })
    })
    socket.on("message", (message) => {
        console.log(`Recevied this message: ${message}`)
        alertContext?.add({
            title: "Recived Message",
            description: `message: ${message}`
        })
    })

    socket.on("request:phoneClipboard", async (response) => {
        const clipboard = await Clipboard.getStringAsync()
        console.log(`Sending '${clipboard}' to the server`)
        response(clipboard)
    })
}

export async function copyClipboard() {
    if (socket === null) {
        console.log("Can't send the message")
        return;
    }

    const clipboard = await socket.timeout(5000).emitWithAck("request:computerClipboard")
    Clipboard.setStringAsync(clipboard)
    console.log(`Coppied '${clipboard}' `)
    alertContext?.add({
        title: "Copied clipboard",
        description: `Clipboard: ${clipboard}`
    })
}

export function sendPing(message: string) {
    console.log("gonna send this ", message)
    socket?.emit("message", message)
    alertContext?.add({
        title: "Sent message to the socket server",
        description: `message: ${message}`
    })
}
