
-- AlterTable
ALTER TABLE "Wedding" ADD COLUMN     "rsvpToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Wedding_rsvpToken_key" ON "Wedding"("rsvpToken");

