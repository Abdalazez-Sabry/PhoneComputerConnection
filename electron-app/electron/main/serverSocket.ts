import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../../../shared/socket.ioTypes"
import clipboard from "clipboardy";

export function createSocketServer() {
    let phoneId: string | null = null;
    let computerId: string | null = null;

    const httpServer = createServer();
    const io = new Server<
        ClientToServerEvents,
        ServerToClientEvents
    >(httpServer, {
        // const io = new Server(httpServer, {
        cors: {
            origin: "*"
        }
    });

    io.on("connection", (socket) => {
        console.log(`A new connection ${socket.handshake.address}, socket id: ${socket.id} `)

        socket.on("message:deviceType", (type) => {
            if (type === "computer") {
                computerId = socket.id
            } else if (type === "phone") {
                phoneId = socket.id
            }
            console.log(`A ${type} connection`)
        })

        socket.on("disconnect", () => {
            console.log(`{A client has disconnected with socket id: ${socket.id}}`)
        })

        socket.on("message", (message) => {
            console.log(`Recevied this message: ${message}`)
            socket.broadcast.emit("message", message)
        })

        socket.on("request:phoneClipboard", async (response) => {
            if (phoneId === null) {
                console.log("Phone not conneected");
                return
            }

            const clipboardRes = await io.to(phoneId).timeout(5000).emitWithAck("request:phoneClipboard")

            if (clipboardRes.length == 0) {
                response("ERROR")
                return
            }

            console.log(`Coppied' ${clipboardRes[0]}' tp computer`)

            clipboard.write(clipboardRes[0])

            response(clipboardRes[0])
        })
        socket.on("request:computerClipboard", async (response) => {
            const clipboardRes = await clipboard.read();
            console.log(`Sending clipboard: '${clipboardRes}' `)

            response(clipboardRes)
        })

    });

    httpServer.listen(import.meta.env.VITE_PORT, () => {
        console.log(`Listening on port: ${import.meta.env.VITE_PORT}`)
    });
}