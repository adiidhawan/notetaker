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

type AnalyticsData = {
  averageDuration: number;
  busiestDay: string;
  dayCount: Record<string, number>;
  monthCount: Record<string, number>;
};

export default function MeetingAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/meetings/analytics");
        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }
        const data = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    };

    fetchAnalytics();
  }, []);

  if (!analyticsData) {
    return <div>Loading analytics...</div>;
  }

  const dayData = Object.entries(analyticsData.dayCount).map(
    ([name, value]) => ({ name, value }),
  );
  const monthData = Object.entries(analyticsData.monthCount).map(
    ([name, value]) => ({ name, value }),
  );

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Meeting Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">
            Average Meeting Duration
          </h3>
          <p className="text-3xl font-bold">
            {analyticsData.averageDuration} minutes
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Busiest Day</h3>
          <p className="text-3xl font-bold">{analyticsData.busiestDay}</p>
        </div>
      </div>
      <div className="mt-8 bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Meetings by Day of Week</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dayData}>
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
        <h3 className="text-lg font-semibold mb-4">Meetings by Month</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
