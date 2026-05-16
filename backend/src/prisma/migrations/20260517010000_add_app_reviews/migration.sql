CREATE TABLE "app_reviews" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_reviews_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "app_reviews_userId_key" ON "app_reviews"("userId");

CREATE INDEX "app_reviews_createdAt_idx" ON "app_reviews"("createdAt");

ALTER TABLE "app_reviews" ADD CONSTRAINT "app_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
