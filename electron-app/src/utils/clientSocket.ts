import { Socket, io } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "../../../shared/socket.ioTypes"
import { AlertContext, IAlertContext, useAlertContext } from "@/components/AlertSystem";

const URL = `http://localhost:${import.meta.env.VITE_PORT}`

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
let alertContext: IAlertContext | null;

export function connectToWebSocket(setIsConnected: Function, alertContx: IAlertContext) {
    socket = io(URL);
    alertContext = alertContx

    socket.on("connect", () => {
        console.log(`Connected to the server, socket id: ${socket?.id}`)
        socket?.emit('message:deviceType', "computer")
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
}

export async function copyClipboard() {
    if (socket === null) {
        console.log("Can't send the message")
        return;
    }

    try {
        const clipboard = await socket.emitWithAck("request:phoneClipboard")
        console.log('Received clipboard :', clipboard);
        alertContext?.add({
            title: "Copied clipboard",
            description: `Clipboard: ${clipboard}`
        })
    } catch (err) {
        console.log("Coudn't copy phone's clipboard");
        alertContext?.add({
            title: "Error on copy clipboard",
            description: "Coudn't copy phone's clipboard"
        })

    }

}

export async function sendFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const status = await fetch(`${URL}/upload`, {
        body: formData,
        method: "POST",
    })
    if (status.ok) {
        alertContext?.add({
            "title": "File sent successfully"
        })
    } else {
        alertContext?.add({
            "title": "An error occurred trying to send file "
        })
    }
}

export function sendPing(message: string) {
    socket?.emit("message", message)
    alertContext?.add({
        title: "Sent message to the socket server",
        description: `message: ${message}`
    })
}