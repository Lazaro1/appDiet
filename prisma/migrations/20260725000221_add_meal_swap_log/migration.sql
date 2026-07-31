-- CreateTable
CREATE TABLE "MealSwapLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "mealItemId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "originalItemName" TEXT NOT NULL,
    "originalKcal" DOUBLE PRECISION,
    "originalProtein" DOUBLE PRECISION,
    "chosenName" TEXT NOT NULL,
    "chosenKcal" DOUBLE PRECISION NOT NULL,
    "chosenProtein" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealSwapLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MealSwapLog_userId_date_idx" ON "MealSwapLog"("userId", "date");

-- CreateIndex
CREATE INDEX "MealSwapLog_mealId_idx" ON "MealSwapLog"("mealId");

-- AddForeignKey
ALTER TABLE "MealSwapLog" ADD CONSTRAINT "MealSwapLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealSwapLog" ADD CONSTRAINT "MealSwapLog_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
