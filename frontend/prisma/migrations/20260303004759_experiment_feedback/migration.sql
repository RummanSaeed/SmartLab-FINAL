-- CreateTable
CREATE TABLE "ExperimentFeedback" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "userId" TEXT,
    "practicalId" TEXT NOT NULL,
    "practicalTitle" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExperimentFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExperimentFeedback_practicalId_updatedAt_idx" ON "ExperimentFeedback"("practicalId", "updatedAt");

-- CreateIndex
CREATE INDEX "ExperimentFeedback_userId_updatedAt_idx" ON "ExperimentFeedback"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ExperimentFeedback_authorId_practicalId_key" ON "ExperimentFeedback"("authorId", "practicalId");

-- AddForeignKey
ALTER TABLE "ExperimentFeedback" ADD CONSTRAINT "ExperimentFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
