import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();

    const totalMeetings = await prisma.meeting.count({
      where: { userId },
    });

    const ongoingMeetings = await prisma.meeting.count({
      where: { 
        userId, 
        startTime: { lte: now },
        endTime: { gt: now }
      },
    });

    const meetings = await prisma.meeting.findMany({
      where: {
        userId,
        endTime: { lte: now }, // Only include completed meetings
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    let totalDuration = 0;
for (const meeting of meetings) {
  if (meeting.endTime) {
    totalDuration += meeting.endTime.getTime() - meeting.startTime.getTime();
  }
}

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
    console.error("Error fetching meeting analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch meeting analytics" },
      { status: 500 },
    );
  }
}