import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";
import bcrypt from "bcrypt";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const meetingId = params.id;
  const { password, expirationDays } = await request.json();

  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    if (meeting.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shareToken = crypto.randomBytes(32).toString("hex");
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const shareExpiration = expirationDays
      ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000)
      : null;

    const updatedMeeting = await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        shareToken,
        sharePassword: hashedPassword,
        shareExpiration,
      },
    });

    return NextResponse.json({
      shareToken: updatedMeeting.shareToken,
      shareExpiration: updatedMeeting.shareExpiration,
    });
  } catch (error) {
    console.error("Error generating share token:", error);
    return NextResponse.json(
      { error: "Failed to generate share token" },
      { status: 500 },
    );
  }
}
