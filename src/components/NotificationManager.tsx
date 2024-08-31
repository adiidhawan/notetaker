"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function NotificationManager() {
  const { data: session } = useSession();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsSubscribed(!!subscription);
        });
      });
    }
  }, []);

  const subscribeUser = async () => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });

        await fetch("/api/push-subscription", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(subscription),
        });

        setIsSubscribed(true);
      } catch (error) {
        console.error("Failed to subscribe the user: ", error);
      }
    }
  };

  if (!session) return null;

  return (
    <div className="mt-4">
      {!isSubscribed ? (
        <button
          onClick={subscribeUser}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Enable Notifications
        </button>
      ) : (
        <p>Notifications are enabled</p>
      )}
    </div>
  );
}
