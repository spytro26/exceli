-- CreateTable
CREATE TABLE "room" (
    "id" SERIAL NOT NULL,
    "room" TEXT,
    "slug" TEXT,

    CONSTRAINT "room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "roomId" INTEGER NOT NULL,

    CONSTRAINT "chat_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "chat" ADD CONSTRAINT "chat_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
