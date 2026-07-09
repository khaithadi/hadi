-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('maintenance', 'utilities', 'cleaning', 'supplies', 'fees', 'other');

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "propertyId" TEXT,
    "category" "ExpenseCategory" NOT NULL,
    "amount" INTEGER NOT NULL,
    "note" TEXT,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Expense_hostId_idx" ON "Expense"("hostId");

-- CreateIndex
CREATE INDEX "Expense_propertyId_idx" ON "Expense"("propertyId");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;
