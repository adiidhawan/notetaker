"use client";

import { useState, useEffect } from "react";
import Dashboard from "./Dashboard";
import JoinMeeting from "./JoinMeeting";
import SearchMeetings from "./SearchMeetings";
import MeetingList, { Meeting } from "./MeetingList";

type Props = {
  userName: string;
};

export default function ClientWrapper({ userName }: Props) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    async function fetchMeetings() {
      try {
        const response = await fetch("/api/meetings");
        if (response.ok) {
          const data: Meeting[] = await response.json();
          setMeetings(data);
        } else {
          console.error("Failed to fetch meetings");
        }
      } catch (error) {
        console.error("Error fetching meetings:", error);
      }
    }

    fetchMeetings();
  }, []);

  return (
    <>
      <h2 className="text-xl font-bold mt-4">Welcome, {userName}!</h2>
      <Dashboard />
      <JoinMeeting />
      <SearchMeetings />
      <MeetingList initialMeetings={meetings} />
    </>
  );
}
