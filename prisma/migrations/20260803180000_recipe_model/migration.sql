-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT,
    "synonyms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "servingGrams" DOUBLE PRECISION NOT NULL,
    "kcalPer100g" DOUBLE PRECISION NOT NULL,
    "proteinPer100g" DOUBLE PRECISION NOT NULL,
    "carbsPer100g" DOUBLE PRECISION NOT NULL,
    "fatPer100g" DOUBLE PRECISION NOT NULL,
    "fiberPer100g" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Recipe_normalizedName_idx" ON "Recipe"("normalizedName");
CREATE INDEX "Recipe_active_idx" ON "Recipe"("active");
