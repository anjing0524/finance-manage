-- CreateEnum
CREATE TYPE "DebtType" AS ENUM ('BANK', 'PRIVATE_LOAN', 'ONLINE_LOAN');

-- CreateEnum
CREATE TYPE "RepaymentMode" AS ENUM ('EQUAL_PRINCIPAL', 'EQUAL_INSTALLMENT', 'INTEREST_FIRST');

-- CreateTable
CREATE TABLE "debts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DebtType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "borrow_date" TIMESTAMP(3) NOT NULL,
    "repayment_mode" "RepaymentMode" NOT NULL,

    CONSTRAINT "debts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repayments" (
    "id" TEXT NOT NULL,
    "repay_date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "debt_id" TEXT NOT NULL,

    CONSTRAINT "repayments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "repayments" ADD CONSTRAINT "repayments_debt_id_fkey" FOREIGN KEY ("debt_id") REFERENCES "debts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
