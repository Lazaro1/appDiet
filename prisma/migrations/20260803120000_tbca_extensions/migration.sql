-- Enable PostgreSQL extensions for lexical food search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Extend TBACFood for MVP nutritional pipeline
ALTER TABLE "TBACFood" ADD COLUMN IF NOT EXISTS "externalCode" TEXT;
ALTER TABLE "TBACFood" ADD COLUMN IF NOT EXISTS "normalizedName" TEXT;
ALTER TABLE "TBACFood" ADD COLUMN IF NOT EXISTS "nutritionalRole" TEXT;
ALTER TABLE "TBACFood" ADD COLUMN IF NOT EXISTS "preparationMethod" TEXT;
ALTER TABLE "TBACFood" ADD COLUMN IF NOT EXISTS "portionMinGrams" DOUBLE PRECISION;
ALTER TABLE "TBACFood" ADD COLUMN IF NOT EXISTS "portionMaxGrams" DOUBLE PRECISION;
ALTER TABLE "TBACFood" ADD COLUMN IF NOT EXISTS "portionStepGrams" DOUBLE PRECISION DEFAULT 5;
ALTER TABLE "TBACFood" ADD COLUMN IF NOT EXISTS "synonyms" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "TBACFood" ADD COLUMN IF NOT EXISTS "containsGluten" BOOLEAN;
ALTER TABLE "TBACFood" ADD COLUMN IF NOT EXISTS "containsLactose" BOOLEAN;
ALTER TABLE "TBACFood" ADD COLUMN IF NOT EXISTS "containsAnimal" BOOLEAN;
ALTER TABLE "TBACFood" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;

CREATE UNIQUE INDEX IF NOT EXISTS "TBACFood_externalCode_key" ON "TBACFood"("externalCode");
CREATE INDEX IF NOT EXISTS "TBACFood_normalizedName_idx" ON "TBACFood"("normalizedName");
CREATE INDEX IF NOT EXISTS "TBACFood_category_idx" ON "TBACFood"("category");
CREATE INDEX IF NOT EXISTS "TBACFood_nutritionalRole_idx" ON "TBACFood"("nutritionalRole");
CREATE INDEX IF NOT EXISTS "TBACFood_active_idx" ON "TBACFood"("active");

-- Trigram index for similarity search
CREATE INDEX IF NOT EXISTS "TBACFood_normalizedName_trgm_idx"
  ON "TBACFood" USING gin ("normalizedName" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "TBACFood_name_trgm_idx"
  ON "TBACFood" USING gin ("name" gin_trgm_ops);
