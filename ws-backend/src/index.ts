import { WebSocketServer, WebSocket } from "ws";      
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ws = new WebSocketServer({ port: 8080 });

interface UserRoom {
    roomId: string;
    socket: WebSocket;
}   

const socketArr: UserRoom[] = [];

ws.on("connection", (socket: WebSocket) => {                                            
    console.log("Client connected");

    socket.on("close", () => {
        console.log("Client disconnected");

        // Remove the disconnected socket from the array
        const index = socketArr.findIndex(user => user.socket === socket);
        if (index !== -1) {
            console.log(`Removing client from room: ${socketArr[index].roomId}`);
            socketArr.splice(index, 1);
        }

        console.log(`Total remaining clients: ${socketArr.length}`);
    });

    socket.on("message", async (data) => {
        try {
            const realData = data.toString();
            console.log("Raw message received:", realData);
            const message = JSON.parse(realData);

            if (message.type === 'join') {                  
                socketArr.push({
                    socket,
                    roomId: message.roomId,
                });

                const existingRoom = await prisma.room.findFirst({
                    where: { room: message.roomId }
                });

                if (!existingRoom) {
                    try {
                        await prisma.room.create({
                            data: { room: message.roomId }
                        });
                        console.log(`Room ${message.roomId} created successfully`);
                    } catch (e) {
                        console.log("Error while creating room:", e);
                    }
                }
            }
            else if (message.type === 'erase') {
                // Find the room for the current socket
                let room: string | undefined;
                for (let user of socketArr) {
                    if (user.socket === socket) {
                        room = user.roomId;
                        break;
                    }
                }
                if (!room) {
                    socket.send("You are not part of any room");
                    console.log("Room not found for the user");
                    return;
                }

                console.log(`Broadcasting erase event to room: ${room}`);
                // Broadcast the erase event to other clients in the same room
                for (let user of socketArr) {
                    if (user.roomId === room && user.socket !== socket) {
                        user.socket.send(
                            JSON.stringify({
                                type: "erase",
                                shapeId: message.shapeId
                            })
                        );
                    }
                }

                const roomRecord = await prisma.room.findFirst({
                    where: { room }
                });

                if (roomRecord) {
                    // Assuming that the chat table stores the shape as a JSON string,
                    // we use a string filter to find the record with the matching shape id.
                    const deleted = await prisma.chat.deleteMany({
                        where: {
                            roomId: roomRecord.id,
                            message: {
                                contains: `"id":"${message.shapeId}"`
                            }
                        }
                    });
                    console.log("Deleted shape from database", deleted);
                }
            
            }


           else if (message.type === 'chat') {  
                let room: string | undefined; 
                
                for (let user of socketArr) {
                    if (user.socket === socket) {
                        room = user.roomId;
                        break;
                    }
                }

                if (!room) {
                    socket.send("You are not part of any room");
                    console.log("Room not found for the user");
                    return; 
                }

                console.log(`Broadcasting message to room: ${room}`);
                for (let user of socketArr) {
                    if (user.roomId === room && user.socket !== socket) {
                        user.socket.send(
                            JSON.stringify({
                                type: "chat",
                                message: message.message
                            })
                        );
                    }
                }

                const roomRecord = await prisma.room.findFirst({
                    where: { room: message.roomId }
                });

                if (roomRecord) {
                    await prisma.chat.create({
                        data: {
                            message: message.message,
                            roomId: roomRecord.id
                        }
                    });
                    console.log("Chat message saved to database");
                }
            }

        } catch (error) {
            console.error("Error processing message:", error);
        }
    });
});