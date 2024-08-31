"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import MeetingDetails from "@/components/MeetingDetails";
import PasswordPrompt from "@/components/PasswordPrompt";

export default function SharedMeetingPage({
  params,
}: {
  params: { token: string };
}) {
  const [meeting, setMeeting] = useState(null);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchMeeting = useCallback(
    async (password?: string) => {
      try {
        const response = await fetch(`/api/meetings/shared/${params.token}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        });

        if (response.status === 401) {
          setIsPasswordProtected(true);
          return;
        }

        if (response.status === 410) {
          setIsExpired(true);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch meeting");
        }

        const data = await response.json();
        setMeeting(data);
      } catch (error) {
        console.error("Error fetching shared meeting:", error);
        setError("Failed to load meeting. Please try again.");
      }
    },
    [params.token],
  );

  useEffect(() => {
    fetchMeeting();
  }, [fetchMeeting]);

  const handlePasswordSubmit = (password: string) => {
    fetchMeeting(password);
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (isExpired) {
    return <div className="text-red-500">This shared link has expired.</div>;
  }

  if (isPasswordProtected) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Password Protected Meeting</h1>
        <PasswordPrompt onSubmit={handlePasswordSubmit} />
      </div>
    );
  }

  if (!meeting) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Shared Meeting Details</h1>
      <MeetingDetails initialMeeting={meeting} isShared={true} />
    </div>
  );
}
