-- CreateTable
CREATE TABLE "WeddingInvite" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'COLLABORATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeddingInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WeddingInvite_token_key" ON "WeddingInvite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "WeddingInvite_weddingId_role_key" ON "WeddingInvite"("weddingId", "role");

-- AddForeignKey
ALTER TABLE "WeddingInvite" ADD CONSTRAINT "WeddingInvite_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
