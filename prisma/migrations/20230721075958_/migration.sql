-- AlterTable
ALTER TABLE "debts" ADD COLUMN     "installment" INTEGER;

-- AlterTable
ALTER TABLE "repayments" ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false;
