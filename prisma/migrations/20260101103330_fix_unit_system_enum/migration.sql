/*
  Warnings:

  - The values [KG,LBS] on the enum `UnitSystem` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UnitSystem_new" AS ENUM ('METRIC', 'IMPERIAL');
ALTER TABLE "public"."user_preferences" ALTER COLUMN "unitSystem" DROP DEFAULT;
ALTER TABLE "user_preferences" ALTER COLUMN "unitSystem" TYPE "UnitSystem_new" USING ("unitSystem"::text::"UnitSystem_new");
ALTER TYPE "UnitSystem" RENAME TO "UnitSystem_old";
ALTER TYPE "UnitSystem_new" RENAME TO "UnitSystem";
DROP TYPE "public"."UnitSystem_old";
ALTER TABLE "user_preferences" ALTER COLUMN "unitSystem" SET DEFAULT 'METRIC';
COMMIT;

-- AlterTable
ALTER TABLE "user_preferences" ALTER COLUMN "unitSystem" SET DEFAULT 'METRIC';
