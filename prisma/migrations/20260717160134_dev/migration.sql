-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED', 'DELETED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "AuthProviderName" AS ENUM ('CREDENTIAL', 'GOOGLE', 'FACEBOOK', 'GITHUB');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "firstName" TEXT,
    "lastName" TEXT,
    "gender" "Gender",
    "phone" TEXT,
    "bio" TEXT,
    "address" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "timezone" TEXT DEFAULT 'UTC',
    "locale" TEXT DEFAULT 'en',
    "lastLoginAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "avatarId" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "auth_providers" (
    "id" TEXT NOT NULL,
    "provider" "AuthProviderName" NOT NULL DEFAULT 'CREDENTIAL',
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_providers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_avatarId_key" ON "users"("avatarId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "auth_providers_provider_providerId_key" ON "auth_providers"("provider", "providerId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "avatars"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_providers" ADD CONSTRAINT "auth_providers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
