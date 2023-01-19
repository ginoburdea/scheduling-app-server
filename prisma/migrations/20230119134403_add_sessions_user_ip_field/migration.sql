/*
  Warnings:

  - Added the required column `publicId` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "publicId" TEXT NOT NULL,
ADD COLUMN     "userIp" TEXT NOT NULL DEFAULT 'default';
