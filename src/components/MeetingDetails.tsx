"use client";

import { useState, useEffect, useRef } from "react";
import { Meeting } from "@prisma/client";
import ShareMeeting from "./ShareMeeting";

type Props = {
  initialMeeting: Meeting;
  isShared?: boolean;
};

export default function MeetingDetails({ initialMeeting, isShared = false }: Props) {
  const [meeting, setMeeting] = useState(initialMeeting);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const checkMeetingStatus = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/meetings/${meeting.id}/status`, {
          method: 'GET',
        });
        if (response.ok) {
          const updatedMeeting = await response.json();
          setMeeting(updatedMeeting);
        } else {
          throw new Error('Failed to fetch meeting status');
        }
      } catch (error) {
        console.error('Error checking meeting status:', error);
        setError('Failed to fetch meeting status. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (meeting.status !== "ENDED") {
      checkMeetingStatus();
    }
  }, [meeting.id, meeting.status]);

  useEffect(() => {
    if (meeting.status === "ENDED" && meeting.processingStatus === "COMPLETED") return;

    let eventSource: EventSource;
    let retryTimeout: NodeJS.Timeout;

    const setupEventSource = () => {
      eventSource = new EventSource(`/api/meetings/${meeting.id}/live-updates`);

      eventSource.onmessage = (event) => {
        const updatedMeeting = JSON.parse(event.data);
        setMeeting(updatedMeeting);
      };

      eventSource.onerror = (error) => {
        console.error("EventSource failed:", error);
        eventSource.close();
        retryTimeout = setTimeout(setupEventSource, 5000); // Retry after 5 seconds
      };
    };

    setupEventSource();

    return () => {
      if (eventSource) eventSource.close();
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [meeting.id, meeting.status, meeting.processingStatus]);

  useEffect(() => {
    if (videoRef.current && meeting.videoUrl) {
      videoRef.current.src = meeting.videoUrl;
    }
  }, [meeting.videoUrl]);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString();
  };

  const handleVideoError = () => {
    console.error("Video playback error");
    setError("Error playing video. Please try again later.");
  };

  return (
    <div className="mt-4 p-4 border rounded shadow">
      {isLoading && <p className="text-blue-600">Loading latest meeting information...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <h2 className="text-xl font-bold">{meeting.title}</h2>
      <p className="mt-2">
        Start Time: {formatDate(meeting.startTime)}
      </p>
      <p>
        End Time: {meeting.endTime ? formatDate(meeting.endTime) : "Ongoing"}
      </p>
      <p className="mt-2">
        Status: <span className="font-semibold">{meeting.status}</span>
      </p>
      <p>
        Processing Status: <span className="font-semibold">{meeting.processingStatus}</span>
      </p>
      {meeting.videoUrl && (
        <div className="mt-2">
          <h3 className="text-lg font-semibold">Video Recording:</h3>
          <video 
            ref={videoRef}
            controls 
            className="mt-2 w-full"
            onError={handleVideoError}
          >
            Your browser does not support the video tag.
          </video>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      )}
      {meeting.audioUrl && (
        <div className="mt-2">
          <h3 className="text-lg font-semibold">Audio Recording:</h3>
          <audio src={meeting.audioUrl} controls className="mt-2 w-full"></audio>
        </div>
      )}
      {meeting.transcriptUrl && (
        <div className="mt-2">
          <h3 className="text-lg font-semibold">Transcript:</h3>
          <a href={meeting.transcriptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            View Transcript
          </a>
        </div>
      )}
      {meeting.aiSummary && (
        <div className="mt-2">
          <h3 className="text-lg font-semibold">AI Summary:</h3>
          <p>{meeting.aiSummary}</p>
        </div>
      )}
      {meeting.aiNotes && (
        <div className="mt-2">
          <h3 className="text-lg font-semibold">AI Notes:</h3>
          <p>{meeting.aiNotes}</p>
        </div>
      )}
      {!isShared && meeting.status === "ENDED" && meeting.processingStatus === "COMPLETED" && (
        <p className="mt-2 text-green-600">This meeting has ended and all processing is complete.</p>
      )}
      {!isShared && meeting.status !== "ENDED" && (
        <p className="mt-2 text-blue-600">
          This meeting is ongoing. Updates will appear in real-time.
        </p>
      )}
      {!isShared && meeting.status === "ENDED" && meeting.processingStatus !== "COMPLETED" && (
        <p className="mt-2 text-yellow-600">
          This meeting has ended. Processing of recordings and transcripts is still in progress.
        </p>
      )}
      {!isShared && (
        <ShareMeeting
          meetingId={meeting.id}
          initialShareToken={meeting.shareToken || undefined}
        />
      )}
    </div>
  );
}