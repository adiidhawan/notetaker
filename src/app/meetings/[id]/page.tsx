"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MeetingDetails from '@/components/MeetingDetails';
import { Meeting } from '@prisma/client';

export default function MeetingPage() {
  const params = useParams();
  const id = params?.id;
  const meetingId = Array.isArray(id) ? id[0] : id;
  
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeeting = async () => {
      if (!meetingId) {
        setError('Meeting ID is missing');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/meetings/${meetingId}`);
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        const data = await response.json();
        setMeeting(data);
      } catch (err) {
        setError('Failed to load meeting details');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeeting();
  }, [meetingId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!meeting) {
    return <div>Meeting not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Meeting Details</h1>
      <MeetingDetails initialMeeting={meeting} />
    </div>
  );
}