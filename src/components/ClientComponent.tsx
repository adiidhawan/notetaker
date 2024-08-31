"use client";

import { useState, useEffect } from "react";
import { Session } from "next-auth";
import LoginButton from "./LoginButton";
import JoinMeeting from "./JoinMeeting";
import MeetingList from "./MeetingList";
import SearchMeetings from "./SearchMeetings";
import Pagination from "./Pagination";
import Dashboard from "./Dashboard";
import TagManager from "./TagManager";
import NotificationPreferences from "./NotificationPreferences";

type Props = {
  session: Session | null;
};

export default function ClientComponent({ session }: Props) {
  const [meetings, setMeetings] = useState<any[]>([]); // Replace 'any' with your Meeting type
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Fetch meetings here
    // Update setMeetings, setCurrentPage, and setTotalPages based on the fetched data
  }, []);

  return (
    <>
      <LoginButton />
      {session && (
        <>
          <h2 className="text-xl font-bold mt-4">
            Welcome, {session.user?.name}!
          </h2>
          <Dashboard />
          <TagManager />
          <NotificationPreferences />
          <JoinMeeting />
          <SearchMeetings />
          <MeetingList initialMeetings={meetings} />
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </>
      )}
    </>
  );
}
