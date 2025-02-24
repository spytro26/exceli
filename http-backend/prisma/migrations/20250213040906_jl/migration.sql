/*
  Warnings:

  - You are about to drop the `chats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `userrooms` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "chats" DROP CONSTRAINT "chats_roomId_fkey";

-- DropForeignKey
ALTER TABLE "chats" DROP CONSTRAINT "chats_userId_fkey";

-- DropForeignKey
ALTER TABLE "userrooms" DROP CONSTRAINT "userrooms_roomId_fkey";

-- DropForeignKey
ALTER TABLE "userrooms" DROP CONSTRAINT "userrooms_userId_fkey";

-- DropIndex
DROP INDEX "room_slug_key";

-- AlterTable
ALTER TABLE "room" ADD COLUMN     "roomNO" INTEGER;

-- DropTable
DROP TABLE "chats";

-- DropTable
DROP TABLE "user";

-- DropTable
DROP TABLE "userrooms";

-- CreateTable
CREATE TABLE "chat" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "roomId" INTEGER NOT NULL,

    CONSTRAINT "chat_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "chat" ADD CONSTRAINT "chat_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
