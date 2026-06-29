-- AlterTable
ALTER TABLE "WeddingMember" ADD COLUMN     "tableId" TEXT;

-- AddForeignKey
ALTER TABLE "WeddingMember" ADD CONSTRAINT "WeddingMember_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

