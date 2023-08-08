/*
  Warnings:

  - Made the column `user_id` on table `debts` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "debts" DROP CONSTRAINT "debts_user_id_fkey";

-- AlterTable
ALTER TABLE "debts" ALTER COLUMN "user_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "debts" ADD CONSTRAINT "debts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
