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

            if (message.type === 'chat') {  
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
