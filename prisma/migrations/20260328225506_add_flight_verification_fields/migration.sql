-- AlterTable
ALTER TABLE "Flight" ADD COLUMN     "instructorName" VARCHAR(100),
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "signatureData" TEXT;
