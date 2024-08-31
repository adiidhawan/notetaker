"use client";

import Link from "next/link";

export interface Meeting {
  id: string;
  title: string;
  startTime: string | Date;
  endTime: string | Date | null;
}

type Props = {
  initialMeetings: Meeting[];
};

export default function MeetingList({ initialMeetings }: Props) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Your Meetings</h2>
      {initialMeetings.length === 0 ? (
        <p>No meetings found. Try a different search or join a new meeting.</p>
      ) : (
        <ul className="space-y-4">
          {initialMeetings.map((meeting) => (
            <li key={meeting.id} className="border p-4 rounded shadow">
              <Link
                href={`/meetings/${meeting.id}`}
                className="text-blue-500 hover:underline"
              >
                <h3 className="text-xl font-semibold">{meeting.title}</h3>
              </Link>
              <p>Start Time: {new Date(meeting.startTime).toLocaleString()}</p>
              <p>
                Status:{" "}
                {meeting.endTime ? (
                  <span className="text-green-600">Ended</span>
                ) : (
                  <span className="text-blue-600">Ongoing</span>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
