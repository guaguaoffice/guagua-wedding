-- CreateEnum
CREATE TYPE "CandidateAvailability" AS ENUM ('OK', 'WAIT', 'CONFLICT');

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "availability" "CandidateAvailability",
ADD COLUMN     "tag" TEXT;

-- AlterTable
ALTER TABLE "DecisionItem" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "suggestedDecideBy" TIMESTAMP(3);
