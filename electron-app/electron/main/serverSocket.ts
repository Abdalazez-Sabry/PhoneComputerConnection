import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../../../shared/socket.ioTypes"
import clipboard from "clipboardy";
import { writeFile, appendFile, writeFileSync, appendFileSync, existsSync, promises } from "fs";
import path from "path"

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
                if (computerId != null) {
                    io.sockets.sockets.get(computerId)?.disconnect()
                }
                computerId = socket.id
            } else if (type === "phone") {
                if (phoneId != null) {
                    io.sockets.sockets.get(phoneId)?.disconnect()
                }
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

        socket.on("fileToPhone:init", (filename) => {
            console.log("creating file: ", filename)
            writeFileSync(`../filesharing/${filename}`, "");
        })

        const chunkQueue = []

        socket.on("fileToPhone:chunk", (chunk, filename) => {
            // console.log("appending a packet")
            // appendFileSync(`../filesharing/${filename}`, chunk as Buffer);
            packetSent += 1
            if (packetSent % 100 == 0) {
                console.log(`Sent ${packetSent} packets`)
            }
            writeQueue.push({ chunk: chunk as Buffer, filePath: `../filesharing/${filename}` }); // Add chunk to the write queue
            processWriteQueue();

        })

        socket.on("fileToPhone:end", (filename) => {
            console.log("file created, i think:", filename)
            console.log(`retries: ${retryN}, errors: ${errorN}`)
            console.log(`Sent ${packetSent} packets`)
        })

    });

    httpServer.listen(import.meta.env.VITE_PORT, () => {
        console.log(`Listening on port: ${import.meta.env.VITE_PORT}`)
    });
}

let writingInProgress = false
let writeQueue: { chunk: Buffer, filePath: string }[] = [];
let retryN = 0
let errorN = 0
let packetSent = 0

async function processWriteQueue() {
    // If a write operation is already in progress or the write queue is empty, do nothing
    if (writingInProgress || writeQueue.length === 0) {
        return;
    }

    writingInProgress = true; // Mark that a write operation is in progress

    const { chunk, filePath } = writeQueue[0]!; // Dequeue the next chunk to write

    // Retry logic
    let retries = 5; // Number of retries
    let success = false;

    // while (retries > 0 && !success) {
    try {
        // Append chunk to file
        await promises.appendFile(filePath, chunk);
        success = true; // Mark the operation as successful
    } catch (error) {
        console.warn(`Error appending chunk to file (${filePath}), retrying...`);
        retryN += 1
        retries--; // Decrement the number of retries
        // await new Promise(resolve => setTimeout(resolve, 100)); // Wait for a short time before retrying
    }
    // }

    if (success) {
        writeQueue.shift()
    } else {
        errorN += 1
    }

    writingInProgress = false; // Mark that the write operation is complete
    processWriteQueue(); // Process the next chunk in the write queue
}