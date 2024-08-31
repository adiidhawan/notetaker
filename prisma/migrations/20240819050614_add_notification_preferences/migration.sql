-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_MeetingToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_MeetingToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Meeting" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_MeetingToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Meeting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
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
    CONSTRAINT "Meeting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Meeting" ("aiNotes", "aiSummary", "audioRecording", "createdAt", "endTime", "id", "shareExpiration", "sharePassword", "shareToken", "startTime", "title", "transcript", "updatedAt", "url", "userId", "videoRecording") SELECT "aiNotes", "aiSummary", "audioRecording", "createdAt", "endTime", "id", "shareExpiration", "sharePassword", "shareToken", "startTime", "title", "transcript", "updatedAt", "url", "userId", "videoRecording" FROM "Meeting";
DROP TABLE "Meeting";
ALTER TABLE "new_Meeting" RENAME TO "Meeting";
CREATE UNIQUE INDEX "Meeting_shareToken_key" ON "Meeting"("shareToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_userId_key" ON "Tag"("name", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "_MeetingToTag_AB_unique" ON "_MeetingToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_MeetingToTag_B_index" ON "_MeetingToTag"("B");
