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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const prisma = new client_1.PrismaClient();
app.post("/chats", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomId } = req.body;
    console.log("Request received for roomId:", roomId);
    if (!roomId) {
        console.log("no roomId error");
        return res.status(400).json({ error: "roomId is required" });
    }
    const ll = yield prisma.room.findFirst({
        //@ts-ignore
        where: { room: roomId }
    });
    try {
        const messages = yield prisma.chat.findMany({
            where: { roomId: ll === null || ll === void 0 ? void 0 : ll.id }
        });
        res.json({ messages }); // Send messages in JSON response
    }
    catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.listen(4040, () => console.log("Listening on port 4040"));
