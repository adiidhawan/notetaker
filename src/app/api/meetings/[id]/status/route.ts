import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { checkMeetingStatus, BotStatus } from "@/lib/recall";
import { Meeting } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const meetingId = params.id;

  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting || meeting.userId !== session.user.id) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    if (meeting.recallBotId) {
      const botStatus: BotStatus = await checkMeetingStatus(meeting.recallBotId);
      
      const audioUrl = botStatus.audioUrl || meeting.audioUrl;
      const videoUrl = botStatus.videoUrl || meeting.videoUrl;
      const transcriptUrl = botStatus.transcriptUrl || meeting.transcriptUrl;
      const aiSummary = botStatus.aiSummary || meeting.aiSummary;
      const aiNotes = botStatus.aiNotes || meeting.aiNotes;

      const hasEnded = botStatus.status === 'ENDED';

      if (hasEnded || botStatus.status !== meeting.status ||
          audioUrl !== meeting.audioUrl || videoUrl !== meeting.videoUrl || 
          transcriptUrl !== meeting.transcriptUrl ||
          aiSummary !== meeting.aiSummary || aiNotes !== meeting.aiNotes) {
        
        const updatedMeeting = await prisma.meeting.update({
          where: { id: meetingId },
          data: {
            status: botStatus.status,
            endTime: hasEnded && !meeting.endTime ? new Date() : meeting.endTime,
            duration: hasEnded && meeting.startTime
              ? Math.round((new Date().getTime() - meeting.startTime.getTime()) / 1000)
              : meeting.duration,
            audioUrl,
            videoUrl,
            transcriptUrl,
            aiSummary,
            aiNotes,
          }
        });
        
        return NextResponse.json(updatedMeeting);
      }
    }

    return NextResponse.json(meeting);
  } catch (error) {
    console.error("Error checking meeting status:", error);
    return NextResponse.json({ error: "Failed to check meeting status" }, { status: 500 });
  }
}