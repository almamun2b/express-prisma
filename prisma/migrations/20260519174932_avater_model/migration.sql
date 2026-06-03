/*
  Warnings:

  - You are about to drop the column `avatar` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `otps` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[avatarId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "otps" DROP CONSTRAINT "otps_userId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatar",
ADD COLUMN     "avatarId" TEXT;

-- DropTable
DROP TABLE "otps";

-- DropEnum
DROP TYPE "OtpPurpose";

-- CreateTable
CREATE TABLE "avatars" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "version" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "format" TEXT,
    "resourceType" TEXT,
    "type" TEXT,
    "url" TEXT NOT NULL,
    "contentType" TEXT,
    "size" INTEGER,
    "metadata" JSONB,
    "colors" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avatars_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_avatarId_key" ON "users"("avatarId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "avatars"("id") ON DELETE SET NULL ON UPDATE CASCADE;
