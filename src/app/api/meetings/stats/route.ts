import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    const totalMeetings = await prisma.meeting.count({
      where: { userId },
    });

    const ongoingMeetings = await prisma.meeting.count({
      where: {
        userId,
        OR: [
          { endTime: null },
          { endTime: undefined }
        ]
      },
    });

    const meetingsWithDuration = await prisma.meeting.findMany({
      where: {
        userId,
        endTime: {
          not: null
        }
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    const totalDuration = meetingsWithDuration.reduce((sum, meeting) => {
      if (meeting.endTime) {
        return sum + (meeting.endTime.getTime() - meeting.startTime.getTime());
      }
      return sum;
    }, 0);

    const recentMeetings = await prisma.meeting.findMany({
      where: { userId },
      orderBy: { startTime: "desc" },
      take: 5,
      select: { title: true, startTime: true, endTime: true },
    });

    return NextResponse.json({
      totalMeetings,
      ongoingMeetings,
      totalDuration: Math.floor(totalDuration / 1000), // Convert to seconds
      recentMeetings,
    });
  } catch (error) {
    console.error("Error fetching meeting statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch meeting statistics" },
      { status: 500 },
    );
  }
}