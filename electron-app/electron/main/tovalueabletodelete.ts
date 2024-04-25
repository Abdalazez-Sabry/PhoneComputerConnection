// @ts-nocheck

// SERVER

socket.on("fileToPhone:init", (filename) => {
    console.log("creating file: ", filename)
    writeFileSync(`../filesharing/${filename}`, "");
})

socket.on("fileToPhone:chunk", (chunk, filename, callback) => {
    try {
        appendFileSync(`../filesharing/${filename}`, chunk as Buffer)
        callback("success")
        packetSent += 1
        if (packetSent % 100 == 0) {
            console.log(`Sent ${packetSent} packets`)
        }
    } catch (err) {
        console.log(err)
        console.log("asking for the packet one more time")
        callback("failed")
    }

})

socket.on("fileToPhone:end", (filename) => {
    console.log("file created, i think:", filename)
    console.log(`retries: ${retryN}, errors: ${errorN}`)
    console.log(`Sent ${packetSent} packets`)
})

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


// CLIENT

export async function sendFile(file: File) {
    let reader: FileReader = new FileReader
    const CHUNK_SIZE = 100000
    let offset = 0;
    let end = Math.min(offset + CHUNK_SIZE, file.size);

    socket?.emit("fileToPhone:init", file.name)

    reader.onload = async (event) => {
        const chunk = event.target?.result

        console.log()

        if (!chunk) {
            return
        }

        let status: "failed" | "success" = "failed"
        // let status: "failed" | "success" = "success"
        try {

            status = await socket?.timeout(500).emitWithAck("fileToPhone:chunk", chunk as ArrayBuffer, file.name)

        } catch (err) {
            console.log(err)
            status = "failed"
        }
        if (status == "failed") {
            console.log("Resening the packet")
            offset -= CHUNK_SIZE
        }


        if (offset < file.size) {
            readNextChunk();
        } else {
            console.log("File reading complete.");
            socket?.emit("fileToPhone:end", file.name);
        }
    }

    function readNextChunk() {
        end = Math.min(offset + CHUNK_SIZE, file.size);

        reader.readAsArrayBuffer(file.slice(offset, end));
        offset = end;
    }

    readNextChunk()
}



// export async function sendFile(file: File) {
//     const CHUNK_SIZE = 100000
//     const MAX_CONCURRENT_CHUNKS = 5

//     if (socket === null) {
//         console.log("can't send file")
//         return;
//     }

//     const fileBuffer = await file.arrayBuffer()
//     const length = fileBuffer.byteLength

//     socket.emit("fileToPhone:init", file.name)

//     let offset = 0

//     // for (offset = 0; offset < length; offset += CHUNK_SIZE) {
//     //     socket.emit("fileToPhone:chunk", fileBuffer.slice(offset, offset + CHUNK_SIZE), file.name)
//     // }

//     let numChunksSent = 0;
//     const sendNextChunk = async () => {
//         if (offset < length) {
//             const chunk = fileBuffer.slice(offset, offset + CHUNK_SIZE);
//             socket?.emit("fileToPhone:chunk", chunk, file.name);
//             offset += CHUNK_SIZE;
//             numChunksSent++;

//             // Check if we've reached the maximum concurrent chunks
//             if (numChunksSent < MAX_CONCURRENT_CHUNKS) {
//                 sendNextChunk(); // Send next chunk immediately
//             } else {
//                 // Wait for the next event loop iteration to send another chunk
//                 setTimeout(sendNextChunk, 0);
//             }
//         } else {
//             socket?.emit("fileToPhone:end", file.name);
//         }
//     };

//     sendNextChunk();
// }

// export async function sendFile2(file: File) {
//     const CHUNK_SIZE = 1000

//     if (socket === null) {
//         console.log("can't send file")
//         return;
//     }

//     const fileBuffer = await file.arrayBuffer()
//     const length = fileBuffer.byteLength

//     socket.emit("fileToPhone:init", file.name)

//     let offset = 0

//     for (offset = 0; offset < length; offset += CHUNK_SIZE) {
//         let status: "failed" | "success" = "failed"
//         try {

//             // status = await socket.timeout(500).emitWithAck("fileToPhone:chunk", fileBuffer.slice(offset, offset + CHUNK_SIZE), file.name)
//             // status = await socket.timeout(500).emitWithAck("fileToPhone:chunk", fileBuffer.slice(offset, offset + CHUNK_SIZE), file.name)

//         } catch (err) {
//             console.log(err)
//             status = "failed"
//         }
//         if (status == "failed") {
//             console.log("Resening the packet")
//             offset -= CHUNK_SIZE
//         }
//     }

//     socket.emit("fileToPhone:end", file.name);

// }
