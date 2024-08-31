"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchMeetings() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Helper function to safely get query parameters
  const getParam = (key: string) =>
    searchParams ? searchParams.get(key) || "" : "";

  const [searchTerm, setSearchTerm] = useState(getParam("search"));
  const [startDate, setStartDate] = useState(getParam("startDate"));
  const [endDate, setEndDate] = useState(getParam("endDate"));
  const [status, setStatus] = useState(getParam("status"));

  const createQueryString = useCallback(
    (params: Record<string, string>) => {
      const newParams = new URLSearchParams(searchParams || "");
      Object.entries(params).forEach(([name, value]) => {
        if (value) {
          newParams.set(name, value);
        } else {
          newParams.delete(name);
        }
      });
      newParams.delete("page"); // Reset page when searching
      return newParams.toString();
    },
    [searchParams],
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      "/?" +
        createQueryString({
          search: searchTerm,
          startDate,
          endDate,
          status,
        }),
    );
  };

  return (
    <form onSubmit={handleSearch} className="my-4 space-y-4">
      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search meetings..."
          className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
        />
      </div>
      <div className="flex space-x-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="">All Statuses</option>
          <option value="ongoing">Ongoing</option>
          <option value="ended">Ended</option>
        </select>
      </div>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Search
      </button>
    </form>
  );
}
