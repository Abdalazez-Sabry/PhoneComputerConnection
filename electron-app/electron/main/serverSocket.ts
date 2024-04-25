import { Server, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../../../shared/socket.ioTypes"
import clipboard from "clipboardy";
import express from "express"
import http from "http"
import fileUpload from 'express-fileupload'
import cors from "cors"


export function createSocketServer() {
    let phoneId: string | null = null;
    let computerId: string | null = null;

    const expressServer = express()
    const httpServer = http.createServer(expressServer);

    initHttp(expressServer)

    const io = new Server<
        ClientToServerEvents,
        ServerToClientEvents
    >(httpServer, {
        cors: {
            origin: "*"
        },
        maxHttpBufferSize: 1e12
    });

    io.on("connection", (socket) => {
        console.log(`A new connection ${socket.handshake.address}, socket id: ${socket.id} `)

        socket.on("message:deviceType", (type) => {
            if (type === "computer") {
                if (computerId != null) {
                    io.sockets.sockets.get(computerId)?.disconnect()
                }
                computerId = socket.id
                if (phoneId) {
                    io.sockets.sockets.get(phoneId)?.emit("request:phoneBatteryLevel", (batteryLevel) => {
                        if (computerId) {
                            socket.emit("response:phoneBatteryLevel", batteryLevel)
                        }
                    })
                }
            } else if (type === "phone") {
                if (phoneId != null) {
                    io.sockets.sockets.get(phoneId)?.disconnect()
                }
                phoneId = socket.id
                socket.emit("request:phoneBatteryLevel", (batteryLevel) => {
                    if (computerId) {
                        io.sockets.sockets.get(computerId)?.emit("response:phoneBatteryLevel", batteryLevel)
                    }
                })
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

function initHttp(expressServer: express.Express) {
    expressServer.use(fileUpload());
    expressServer.use(cors());

    expressServer.get("/", (req, res) => {
        console.log("the server is working")
        return res.send("every thing is ok")
    })

    expressServer.post('/upload', function (req, res) {
        let file: fileUpload.UploadedFile;
        let uploadPath;
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }

        file = req.files.file as fileUpload.UploadedFile;
        if (!file) {
            console.log("doesn't exsist")
            return;
        }
        uploadPath = `../filesharing/${file.name}`;

        file.mv(uploadPath, function (err: Error) {
            if (err) {
                return res.status(500).send(err);
            }

            res.send('File uploaded!');
        });
    });
}