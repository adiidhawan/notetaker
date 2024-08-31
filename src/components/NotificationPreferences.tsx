"use client";

import { useState, useEffect } from "react";
import Toast from "./Toast"; // or './toast' depending on your file name
type Preferences = {
  meetingReminders: boolean;
  meetingStart: boolean;
  meetingEnd: boolean;
  transcriptReady: boolean;
  summaryReady: boolean;
};

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState<Preferences>({
    meetingReminders: true,
    meetingStart: true,
    meetingEnd: true,
    transcriptReady: true,
    summaryReady: true,
  });
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/user/notification-preferences");
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
    }
  };

  const handleToggle = (key: keyof Preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const savePreferences = async () => {
    try {
      const response = await fetch("/api/user/notification-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        setToast({
          message: "Preferences saved successfully!",
          type: "success",
        });
      } else {
        throw new Error("Failed to save preferences");
      }
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      setToast({ message: "Failed to save preferences", type: "error" });
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Notification Preferences</h2>
      <div className="space-y-4">
        {Object.entries(preferences).map(([key, value]) => (
          <div key={key} className="flex items-center">
            <input
              type="checkbox"
              id={key}
              checked={value}
              onChange={() => handleToggle(key as keyof Preferences)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <label htmlFor={key} className="ml-2 text-gray-700">
              {key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
            </label>
          </div>
        ))}
      </div>
      <button
        onClick={savePreferences}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Save Preferences
      </button>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
