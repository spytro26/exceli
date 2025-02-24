/*
  Warnings:

  - You are about to drop the column `roomNO` on the `room` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "room" DROP COLUMN "roomNO",
ADD COLUMN     "room" TEXT;
