import { Socket, io } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { ClientToServerEvents, ServerToClientEvents } from "../../../shared/socket.ioTypes"

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function connectToWebSocket(setIsConnected: Function) {
    const URL = `http://localhost:${import.meta.env.VITE_PORT}`
    socket = io(URL);

    socket.on("connect", () => {
        console.log(`Connected to the server, socket id: ${socket?.id}`)
        socket?.emit('message:deviceType', "computer")
        setIsConnected(true)
    })

    socket.on("message", (message) => {
        console.log(`Recevied this message: ${message}`)
    })
}

export async function copyClipboard() {
    if (socket === null) {
        console.log("Can't send the message")
        return;
    }

    const clipboard = await socket.emitWithAck("request:phoneClipboard")
    console.log('Received clipboard :', clipboard);
}

export function sendPing(message: string) {
    socket?.emit("message", message)
}