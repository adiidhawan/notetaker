-- CreateTable
CREATE TABLE "NotificationPreferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "meetingReminders" BOOLEAN NOT NULL DEFAULT true,
    "meetingStart" BOOLEAN NOT NULL DEFAULT true,
    "meetingEnd" BOOLEAN NOT NULL DEFAULT true,
    "transcriptReady" BOOLEAN NOT NULL DEFAULT true,
    "summaryReady" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "NotificationPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreferences_userId_key" ON "NotificationPreferences"("userId");
