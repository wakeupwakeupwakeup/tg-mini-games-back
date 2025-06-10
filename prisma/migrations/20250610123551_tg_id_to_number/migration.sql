/*
  Warnings:

  - Changed the type of `tgId` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "tgId",
ADD COLUMN     "tgId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_tgId_key" ON "users"("tgId");
