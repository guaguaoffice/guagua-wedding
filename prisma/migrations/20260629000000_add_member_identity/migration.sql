-- CreateEnum
CREATE TYPE "WeddingIdentity" AS ENUM ('GROOM', 'BRIDE', 'PARTNER', 'OTHER');

-- AlterTable
ALTER TABLE "WeddingMember" ADD COLUMN     "identity" "WeddingIdentity";

