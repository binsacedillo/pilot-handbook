-- CreateEnum
CREATE TYPE "SafetySnapshotType" AS ENUM ('DENSITY_ALTITUDE', 'WEIGHT_BALANCE', 'FUEL');

-- CreateEnum
CREATE TYPE "SafetyStatus" AS ENUM ('NORMAL', 'CAUTION', 'WARNING', 'INVALID');

-- Guard against silently casting unsupported historical data.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "SafetySnapshot"
    WHERE "type" NOT IN ('DENSITY_ALTITUDE', 'WEIGHT_BALANCE', 'FUEL')
  ) THEN
    RAISE EXCEPTION 'Cannot migrate SafetySnapshot.type: unsupported values exist';
  END IF;

  IF EXISTS (
    SELECT 1 FROM "SafetySnapshot"
    WHERE "status" NOT IN ('NORMAL', 'CAUTION', 'WARNING', 'INVALID')
  ) THEN
    RAISE EXCEPTION 'Cannot migrate SafetySnapshot.status: unsupported values exist';
  END IF;
END $$;

-- AlterTable
ALTER TABLE "SafetySnapshot"
  ALTER COLUMN "type" TYPE "SafetySnapshotType" USING "type"::"SafetySnapshotType",
  ALTER COLUMN "status" TYPE "SafetyStatus" USING "status"::"SafetyStatus";
