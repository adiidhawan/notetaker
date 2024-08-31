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
  const { action, password, expirationDays } = await request.json();

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

    if (action === "revoke") {
      const updatedMeeting = await prisma.meeting.update({
        where: { id: meetingId },
        data: { shareRevoked: true },
      });
      return NextResponse.json({ message: "Share link revoked successfully" });
    } else if (action === "regenerate") {
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
          shareRevoked: false,
        },
      });

      return NextResponse.json({
        shareToken: updatedMeeting.shareToken,
        shareExpiration: updatedMeeting.shareExpiration,
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error managing share link:", error);
    return NextResponse.json(
      { error: "Failed to manage share link" },
      { status: 500 },
    );
  }
}
