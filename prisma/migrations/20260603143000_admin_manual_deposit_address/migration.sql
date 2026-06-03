DO $$ BEGIN
  CREATE TYPE "DepositAddressSourceType" AS ENUM ('AUTO_GENERATED', 'ADMIN_ASSIGNED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "DepositAddressStatus" AS ENUM ('ACTIVE', 'DISABLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DROP INDEX IF EXISTS "UserDepositAddress_userId_asset_network_key";

ALTER TABLE "UserDepositAddress"
  ADD COLUMN IF NOT EXISTS "label" TEXT,
  ADD COLUMN IF NOT EXISTS "sourceType" "DepositAddressSourceType" NOT NULL DEFAULT 'ADMIN_ASSIGNED',
  ADD COLUMN IF NOT EXISTS "status" "DepositAddressStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS "assignedByAdminId" TEXT,
  ADD COLUMN IF NOT EXISTS "assignedAt" TIMESTAMP(3);

DO $$ BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'UserDepositAddress'
      AND column_name = 'isActive'
  ) THEN
    EXECUTE 'UPDATE "UserDepositAddress"
      SET "status" = CASE
        WHEN "isActive" = false THEN ''DISABLED''::"DepositAddressStatus"
        ELSE ''ACTIVE''::"DepositAddressStatus"
      END';
  END IF;
END $$;

ALTER TABLE "UserDepositAddress" DROP COLUMN IF EXISTS "isActive";

CREATE INDEX IF NOT EXISTS "UserDepositAddress_userId_asset_network_status_idx" ON "UserDepositAddress"("userId", "asset", "network", "status");
CREATE INDEX IF NOT EXISTS "UserDepositAddress_assignedByAdminId_idx" ON "UserDepositAddress"("assignedByAdminId");

DO $$ BEGIN
  ALTER TABLE "UserDepositAddress"
    ADD CONSTRAINT "UserDepositAddress_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "UserDepositAddress"
    ADD CONSTRAINT "UserDepositAddress_assignedByAdminId_fkey"
    FOREIGN KEY ("assignedByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "WithdrawalAddress"
    ADD CONSTRAINT "WithdrawalAddress_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
