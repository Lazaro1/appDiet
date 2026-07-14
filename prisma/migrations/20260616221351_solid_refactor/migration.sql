/*
  Warnings:

  - The `status` column on the `DietPlanReview` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `MealLog` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `portionUnit` column on the `TBACFood` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `sex` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `activityLevel` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `goal` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `preferences` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `role` on the `ChatMessage` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `unit` on the `MealItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('sedentary', 'light', 'moderate', 'active', 'very_active');

-- CreateEnum
CREATE TYPE "Goal" AS ENUM ('lose', 'gain', 'maintain');

-- CreateEnum
CREATE TYPE "DietPlanReviewStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "MealLogStatus" AS ENUM ('eaten', 'skipped', 'out_of_window');

-- CreateEnum
CREATE TYPE "ChatRole" AS ENUM ('user', 'assistant');

-- CreateEnum
CREATE TYPE "PortionUnit" AS ENUM ('g', 'ml', 'unidade');

-- DropForeignKey
ALTER TABLE "DietPlanReview" DROP CONSTRAINT "DietPlanReview_dietPlanId_fkey";

-- DropForeignKey
ALTER TABLE "Meal" DROP CONSTRAINT "Meal_dietPlanId_fkey";

-- DropForeignKey
ALTER TABLE "MealItem" DROP CONSTRAINT "MealItem_mealId_fkey";

-- DropIndex
DROP INDEX "ChatMessage_sessionId_idx";

-- DropIndex
DROP INDEX "ChatMessage_userId_idx";

-- DropIndex
DROP INDEX "DietPlan_isActive_idx";

-- DropIndex
DROP INDEX "DietPlan_userId_idx";

-- DropIndex
DROP INDEX "Meal_dietPlanId_idx";

-- DropIndex
DROP INDEX "MealLog_date_idx";

-- DropIndex
DROP INDEX "MealLog_userId_idx";

-- DropIndex
DROP INDEX "User_clerkId_idx";

-- DropIndex
DROP INDEX "User_email_idx";

-- DropIndex
DROP INDEX "WeightLog_date_idx";

-- DropIndex
DROP INDEX "WeightLog_userId_idx";

-- AlterTable
ALTER TABLE "ChatMessage" DROP COLUMN "role",
ADD COLUMN     "role" "ChatRole" NOT NULL;

-- AlterTable
ALTER TABLE "DietPlanReview" DROP COLUMN "status",
ADD COLUMN     "status" "DietPlanReviewStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "MealItem" DROP COLUMN "unit",
ADD COLUMN     "unit" "PortionUnit" NOT NULL;

-- AlterTable
ALTER TABLE "MealLog" DROP COLUMN "status",
ADD COLUMN     "status" "MealLogStatus" NOT NULL DEFAULT 'eaten';

-- AlterTable
ALTER TABLE "TBACFood" DROP COLUMN "portionUnit",
ADD COLUMN     "portionUnit" "PortionUnit";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "sex",
ADD COLUMN     "sex" "Sex",
DROP COLUMN "activityLevel",
ADD COLUMN     "activityLevel" "ActivityLevel",
DROP COLUMN "goal",
ADD COLUMN     "goal" "Goal",
DROP COLUMN "preferences",
ADD COLUMN     "preferences" JSONB;

-- CreateIndex
CREATE INDEX "ChatMessage_userId_sessionId_createdAt_idx" ON "ChatMessage"("userId", "sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "DietPlan_userId_isActive_idx" ON "DietPlan"("userId", "isActive");

-- CreateIndex
CREATE INDEX "Meal_dietPlanId_order_idx" ON "Meal"("dietPlanId", "order");

-- CreateIndex
CREATE INDEX "MealLog_userId_date_idx" ON "MealLog"("userId", "date");

-- CreateIndex
CREATE INDEX "WeightLog_userId_date_idx" ON "WeightLog"("userId", "date");

-- AddForeignKey
ALTER TABLE "DietPlanReview" ADD CONSTRAINT "DietPlanReview_dietPlanId_fkey" FOREIGN KEY ("dietPlanId") REFERENCES "DietPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_dietPlanId_fkey" FOREIGN KEY ("dietPlanId") REFERENCES "DietPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealItem" ADD CONSTRAINT "MealItem_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealItem" ADD CONSTRAINT "MealItem_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "TBACFood"("id") ON DELETE SET NULL ON UPDATE CASCADE;
