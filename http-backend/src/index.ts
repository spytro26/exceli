import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const prisma = new PrismaClient();

app.post("/chats", async (req, res) : Promise<any> => {
    const { roomId } = req.body; 

    console.log("Request received for roomId:", roomId);

    if (!roomId) {
        console.log("no roomId error")
        return res.status(400).json({ error: "roomId is required" });
        
    }

    const ll = await prisma.room.findFirst({
        //@ts-ignore
        where : {room : roomId}
    })

    try {
        const messages = await prisma.chat.findMany({
            where: { roomId: ll?.id }
        });

        res.json({ messages });  // Send messages in JSON response
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(4040, () => console.log("Listening on port 4040"));
