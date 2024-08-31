import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } },
) {
  const { password } = await request.json();
  const shareToken = params.token;

  try {
    const meeting = await prisma.meeting.findUnique({
      where: { shareToken },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    if (
      meeting.shareExpiration &&
      new Date() > new Date(meeting.shareExpiration)
    ) {
      return NextResponse.json(
        { error: "Share link has expired" },
        { status: 410 },
      );
    }

    if (meeting.sharePassword) {
      if (!password) {
        return NextResponse.json(
          { error: "Password required" },
          { status: 401 },
        );
      }

      const passwordMatch = await bcrypt.compare(
        password,
        meeting.sharePassword,
      );
      if (!passwordMatch) {
        return NextResponse.json(
          { error: "Incorrect password" },
          { status: 401 },
        );
      }
    }

    // Remove sensitive information before sending the meeting data
    const { sharePassword, shareExpiration, ...sharedMeeting } = meeting;
    return NextResponse.json(sharedMeeting);
  } catch (error) {
    console.error("Error fetching shared meeting:", error);
    return NextResponse.json(
      { error: "Failed to fetch meeting" },
      { status: 500 },
    );
  }
}
