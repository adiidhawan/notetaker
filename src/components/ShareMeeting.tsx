"use client";

import { useState } from "react";
import Toast from "./Toast"; // Ensure this import path is correct

type ShareMeetingProps = {
  meetingId: string;
  initialShareToken?: string | null;
};

export default function ShareMeeting({
  meetingId,
  initialShareToken,
}: ShareMeetingProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(
    initialShareToken
      ? `${window.location.origin}/shared/${initialShareToken}`
      : null,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [password, setPassword] = useState("");
  const [expirationDays, setExpirationDays] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const generateShareLink = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/meetings/${meetingId}/share/manage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "regenerate",
          password,
          expirationDays: expirationDays ? parseInt(expirationDays) : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate share link");
      }

      const data = await response.json();
      const newShareUrl = `${window.location.origin}/shared/${data.shareToken}`;
      setShareUrl(newShareUrl);
      setToast({
        message: "Share link generated successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error generating share link:", error);
      setToast({ message: "Failed to generate share link", type: "error" });
    } finally {
      setIsGenerating(false);
    }
  };

  const revokeShareLink = async () => {
    try {
      const response = await fetch(`/api/meetings/${meetingId}/share/manage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "revoke" }),
      });

      if (!response.ok) {
        throw new Error("Failed to revoke share link");
      }

      setShareUrl(null);
      setToast({
        message: "Share link revoked successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error revoking share link:", error);
      setToast({ message: "Failed to revoke share link", type: "error" });
    }
  };

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setToast({ message: "Share link copied to clipboard!", type: "success" });
    }
  };

  return (
    <div className="mt-4">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password (optional)"
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
      />
      <input
        type="number"
        value={expirationDays}
        onChange={(e) => setExpirationDays(e.target.value)}
        placeholder="Expiration days (optional)"
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
      />
      <button
        onClick={generateShareLink}
        disabled={isGenerating}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
      >
        {isGenerating
          ? "Generating..."
          : (shareUrl ? "Regenerate" : "Generate") + " Share Link"}
      </button>
      {shareUrl && (
        <button
          onClick={revokeShareLink}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Revoke Share Link
        </button>
      )}
      {shareUrl && (
        <div className="mt-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <button
            onClick={copyToClipboard}
            className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Copy to Clipboard
          </button>
        </div>
      )}
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