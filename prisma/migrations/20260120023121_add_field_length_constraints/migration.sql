/*
  Warnings:

  - You are about to alter the column `make` on the `Aircraft` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `model` on the `Aircraft` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `registration` on the `Aircraft` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `entityType` on the `AuditLog` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `changes` on the `AuditLog` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `ipAddress` on the `AuditLog` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(45)`.
  - You are about to alter the column `userAgent` on the `AuditLog` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `departureCode` on the `Flight` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(4)`.
  - You are about to alter the column `arrivalCode` on the `Flight` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(4)`.
  - You are about to alter the column `remarks` on the `Flight` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `firstName` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `lastName` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `license` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.

*/
-- AlterTable
ALTER TABLE "Aircraft" ALTER COLUMN "make" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "model" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "registration" SET DATA TYPE VARCHAR(20);

-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "entityType" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "changes" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "ipAddress" SET DATA TYPE VARCHAR(45),
ALTER COLUMN "userAgent" SET DATA TYPE VARCHAR(500);

-- AlterTable
ALTER TABLE "Flight" ALTER COLUMN "departureCode" SET DATA TYPE VARCHAR(4),
ALTER COLUMN "arrivalCode" SET DATA TYPE VARCHAR(4),
ALTER COLUMN "remarks" SET DATA TYPE VARCHAR(500);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "firstName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "lastName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "license" SET DATA TYPE VARCHAR(50);
