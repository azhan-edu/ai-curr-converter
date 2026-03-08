-- CreateTable
CREATE TABLE "conversion_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromCurrency" TEXT NOT NULL,
    "toCurrency" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "result" REAL NOT NULL,
    "rate" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "conversion_history_timestamp_idx" ON "conversion_history"("timestamp");
