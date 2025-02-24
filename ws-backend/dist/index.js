"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const ws = new ws_1.WebSocketServer({ port: 8080 });
const socketArr = [];
ws.on("connection", (socket) => {
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
    socket.on("message", (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const realData = data.toString();
            console.log("Raw message received:", realData);
            const message = JSON.parse(realData);
            if (message.type === 'join') {
                socketArr.push({
                    socket,
                    roomId: message.roomId,
                });
                const existingRoom = yield prisma.room.findFirst({
                    where: { room: message.roomId }
                });
                if (!existingRoom) {
                    try {
                        yield prisma.room.create({
                            data: { room: message.roomId }
                        });
                        console.log(`Room ${message.roomId} created successfully`);
                    }
                    catch (e) {
                        console.log("Error while creating room:", e);
                    }
                }
            }
            if (message.type === 'chat') {
                let room;
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
                        user.socket.send(JSON.stringify({
                            type: "chat",
                            message: message.message
                        }));
                    }
                }
                const roomRecord = yield prisma.room.findFirst({
                    where: { room: message.roomId }
                });
                if (roomRecord) {
                    yield prisma.chat.create({
                        data: {
                            message: message.message,
                            roomId: roomRecord.id
                        }
                    });
                    console.log("Chat message saved to database");
                }
            }
        }
        catch (error) {
            console.error("Error processing message:", error);
        }
    }));
});
