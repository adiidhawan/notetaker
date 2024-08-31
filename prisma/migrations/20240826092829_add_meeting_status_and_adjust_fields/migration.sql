/*
  Warnings:

  - Made the column `endTime` on table `Meeting` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Meeting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "url" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "duration" INTEGER,
    "audioRecording" TEXT,
    "videoRecording" TEXT,
    "transcript" TEXT,
    "aiSummary" TEXT,
    "aiNotes" TEXT,
    "shareToken" TEXT,
    "sharePassword" TEXT,
    "shareExpiration" DATETIME,
    "shareRevoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "recallBotId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    CONSTRAINT "Meeting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Meeting" ("aiNotes", "aiSummary", "audioRecording", "createdAt", "duration", "endTime", "id", "recallBotId", "shareExpiration", "sharePassword", "shareRevoked", "shareToken", "startTime", "status", "title", "transcript", "updatedAt", "url", "userId", "videoRecording") SELECT "aiNotes", "aiSummary", "audioRecording", "createdAt", "duration", "endTime", "id", "recallBotId", "shareExpiration", "sharePassword", "shareRevoked", "shareToken", "startTime", "status", "title", "transcript", "updatedAt", "url", "userId", "videoRecording" FROM "Meeting";
DROP TABLE "Meeting";
ALTER TABLE "new_Meeting" RENAME TO "Meeting";
CREATE UNIQUE INDEX "Meeting_shareToken_key" ON "Meeting"("shareToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
