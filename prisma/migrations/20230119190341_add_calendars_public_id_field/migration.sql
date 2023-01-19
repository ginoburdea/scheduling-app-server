/*
  Warnings:

  - The required column `publicId` was added to the `calendars` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "calendars" ADD COLUMN     "publicId" TEXT NOT NULL;
