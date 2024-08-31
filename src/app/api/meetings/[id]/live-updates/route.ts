import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { checkMeetingStatus, BotStatus } from "@/lib/recall";
import { Meeting } from "@prisma/client";

const UPDATE_INTERVAL_MS = 2000; // Reduced from 5000 to 2000

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const meetingId = params.id;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId },
      });

      if (!meeting || meeting.userId !== session.user.id) {
        console.log("Meeting not found or user unauthorized");
        controller.close();
        return;
      }

      let isCompleted = false;
      let updateCount = 0;
      while (!isCompleted) {
        try {
          updateCount++;
          console.log(`Update iteration: ${updateCount}`);

          let updatedMeeting: Meeting | null = await prisma.meeting.findUnique({
            where: { id: meetingId },
          });

          if (updatedMeeting && updatedMeeting.recallBotId) {
            console.log(`Current Meeting Details (${updateCount}):`, updatedMeeting);

            try {
              const botStatus: BotStatus = await checkMeetingStatus(updatedMeeting.recallBotId);
              console.log(`Bot status from Recall API (${updateCount}):`, botStatus);

              const shouldUpdate = botStatus.status !== updatedMeeting.status ||
                                   botStatus.processingStatus !== updatedMeeting.processingStatus ||
                                   botStatus.videoUrl !== updatedMeeting.videoUrl ||
                                   botStatus.audioUrl !== updatedMeeting.audioUrl ||
                                   botStatus.transcriptUrl !== updatedMeeting.transcriptUrl ||
                                   botStatus.aiSummary !== updatedMeeting.aiSummary ||
                                   botStatus.aiNotes !== updatedMeeting.aiNotes;

              if (shouldUpdate) {
                updatedMeeting = await prisma.meeting.update({
                  where: { id: meetingId },
                  data: {
                    status: botStatus.status,
                    processingStatus: botStatus.processingStatus,
                    videoUrl: botStatus.videoUrl,
                    audioUrl: botStatus.audioUrl,
                    transcriptUrl: botStatus.transcriptUrl,
                    aiSummary: botStatus.aiSummary,
                    aiNotes: botStatus.aiNotes,
                    endTime: botStatus.status === 'ENDED' && !updatedMeeting.endTime ? new Date() : updatedMeeting.endTime,
                  },
                });

                console.log(`Updated Meeting Details (${updateCount}):`, updatedMeeting);

                if (controller.desiredSize !== null) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(updatedMeeting)}\n\n`));
                } else {
                  console.log("Stream closed. Stopping updates.");
                  break;
                }
              } else {
                console.log(`No updates needed (${updateCount})`);
              }

              isCompleted = botStatus.status === "ENDED" && botStatus.processingStatus === "COMPLETED";
            } catch (error) {
              console.error(`Error checking meeting status (${updateCount}):`, error);
            }
          }
        } catch (error) {
          console.error(`Error updating meeting status (${updateCount}):`, error);
        }

        if (!isCompleted) {
          await new Promise((resolve) => setTimeout(resolve, UPDATE_INTERVAL_MS));
        }
      }

      console.log("Live updates completed");
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}