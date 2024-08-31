import { NextRequest, NextResponse } from 'next/server';
import { joinMeeting } from '@/lib/recall';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { AxiosError } from 'axios';
import { Prisma } from '@prisma/client';

function isValidMeetingUrl(url: string): boolean {
  const validDomains = ['meet.google.com', 'zoom.us', 'teams.microsoft.com', 'webex.com'];
  try {
    const parsedUrl = new URL(url);
    return validDomains.some(domain => parsedUrl.hostname.includes(domain));
  } catch (_) {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { meetingUrl, title } = await request.json();

    if (!meetingUrl) {
      return NextResponse.json({ error: 'Meeting URL is required' }, { status: 400 });
    }

    if (!isValidMeetingUrl(meetingUrl)) {
      return NextResponse.json({ error: 'Invalid meeting URL. Please use a supported platform (Google Meet, Zoom, Microsoft Teams, or Webex)' }, { status: 400 });
    }

    console.log(`Received request to join meeting. URL: ${meetingUrl}, User ID: ${session.user.id}`);

    const joinStartTime = Date.now();
    let botData;
    try {
      botData = await joinMeeting(meetingUrl, session.user.id);
      const joinDuration = Date.now() - joinStartTime;
      console.log(`Bot joined meeting in ${joinDuration}ms. Bot data:`, botData);
    } catch (error) {
      console.error('Error joining meeting:', error);
      return NextResponse.json({ error: 'Failed to join meeting' }, { status: 500 });
    }

    const now = new Date();
    const meeting = await prisma.meeting.create({
      data: {
        userId: session.user.id,
        url: meetingUrl,
        startTime: now,
        title: title || `Meeting on ${now.toLocaleString()}`,
        status: 'SCHEDULED',
        recallBotId: botData.id,
      },
    });

    console.log('Meeting created in database:', meeting);

    return NextResponse.json({ meeting });
  } catch (error: unknown) {
    console.error('Error in POST /api/meetings/join:', error);
    if (error instanceof AxiosError) {
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        return NextResponse.json({ error: error.response.data.message || 'An error occurred while joining the meeting' }, { status: error.response.status });
      } else if (error.request) {
        console.error('No response received:', error.request);
        return NextResponse.json({ error: 'No response received from the server' }, { status: 500 });
      } else {
        console.error('Error message:', error.message);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
      }
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma error:', error);
      return NextResponse.json({ error: `Database error occurred: ${error.message}` }, { status: 500 });
    } else {
      console.error('Unexpected error:', error);
      return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
  }
}