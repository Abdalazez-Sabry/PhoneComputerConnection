import { Socket, io } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "../../../shared/socket.ioTypes"
import { AlertContext, IAlertContext, useAlertContext } from "@/components/AlertSystem";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
let alertContext: IAlertContext | null;

export function connectToWebSocket(setIsConnected: Function, alertContx: IAlertContext) {
    const URL = `http://localhost:${import.meta.env.VITE_PORT}`
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
    const CHUNK_SIZE = 100000
    const MAX_CONCURRENT_CHUNKS = 5

    if (socket === null) {
        console.log("can't send file")
        return;
    }

    const fileBuffer = await file.arrayBuffer()
    const length = fileBuffer.byteLength

    socket.emit("fileToPhone:init", file.name)

    let offset = 0

    // for (offset = 0; offset < length; offset += CHUNK_SIZE) {
    //     socket.emit("fileToPhone:chunk", fileBuffer.slice(offset, offset + CHUNK_SIZE), file.name)
    // }

    let numChunksSent = 0;
    const sendNextChunk = async () => {
        if (offset < length) {
            const chunk = fileBuffer.slice(offset, offset + CHUNK_SIZE);
            socket?.emit("fileToPhone:chunk", chunk, file.name);
            offset += CHUNK_SIZE;
            numChunksSent++;

            // Check if we've reached the maximum concurrent chunks
            if (numChunksSent < MAX_CONCURRENT_CHUNKS) {
                sendNextChunk(); // Send next chunk immediately
            } else {
                // Wait for the next event loop iteration to send another chunk
                setTimeout(sendNextChunk, 0);
            }
        } else {
            socket?.emit("fileToPhone:end", file.name);
        }
    };

    sendNextChunk();
}

export function sendPing(message: string) {
    socket?.emit("message", message)
    alertContext?.add({
        title: "Sent message to the socket server",
        description: `message: ${message}`
    })
}