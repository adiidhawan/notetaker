"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
  totalMeetings: number;
  ongoingMeetings: number;
  totalDuration: number;
  recentMeetings: Array<{
    title: string;
    startTime: string;
    endTime: string | null;
  }>;
}

export default function Dashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/meetings/analytics");
        if (!response.ok) {
          throw new Error("Failed to fetch meeting statistics");
        }
        const data: AnalyticsData = await response.json();
        setAnalyticsData(data);
      } catch (err) {
        setError("Error fetching meeting statistics");
        console.error(err);
      }
    };

    fetchAnalytics();
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!analyticsData) {
    return <div>Loading dashboard...</div>;
  }

  const chartData = [
    { name: "Total Meetings", value: analyticsData.totalMeetings },
    { name: "Ongoing Meetings", value: analyticsData.ongoingMeetings },
  ];

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Total Meetings</h3>
          <p className="text-3xl font-bold">{analyticsData.totalMeetings}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Ongoing Meetings</h3>
          <p className="text-3xl font-bold">{analyticsData.ongoingMeetings}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Total Duration</h3>
          <p className="text-3xl font-bold">
            {Math.round(analyticsData.totalDuration / 60)} minutes
          </p>
        </div>
      </div>
      <div className="mt-8 bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Meeting Statistics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-8 bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Meetings</h3>
        <ul>
          {analyticsData.recentMeetings.map((meeting, index) => (
            <li key={index} className="mb-2">
              <span className="font-semibold">{meeting.title}</span>
              <br />
              <span className="text-sm text-gray-600">
                {new Date(meeting.startTime).toLocaleString()} -
                {meeting.endTime
                  ? new Date(meeting.endTime).toLocaleString()
                  : "Ongoing"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
