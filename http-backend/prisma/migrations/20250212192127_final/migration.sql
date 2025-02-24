/*
  Warnings:

  - You are about to drop the `Chat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Room` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_roomId_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_userId_fkey";

-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_adminId_fkey";

-- DropTable
DROP TABLE "Chat";

-- DropTable
DROP TABLE "Room";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room" (
    "id" SERIAL NOT NULL,
    "slug" TEXT,

    CONSTRAINT "room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chats" (
    "id" SERIAL NOT NULL,
    "chat" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userrooms" (
    "roomId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "userrooms_pkey" PRIMARY KEY ("roomId","userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "room_slug_key" ON "room"("slug");

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userrooms" ADD CONSTRAINT "userrooms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userrooms" ADD CONSTRAINT "userrooms_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
