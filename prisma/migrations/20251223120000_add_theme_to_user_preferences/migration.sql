-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- AlterTable
ALTER TABLE "user_preferences" ADD COLUMN "theme" "Theme" NOT NULL DEFAULT 'SYSTEM';
