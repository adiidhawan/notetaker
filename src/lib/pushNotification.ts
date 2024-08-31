import webPush from "web-push";
import prisma from "./prisma";
import { NotificationPreferences } from "@prisma/client";

webPush.setVapidDetails(
  "mailto:your-email@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

type NotificationType =
  | "meetingReminders"
  | "meetingStart"
  | "meetingEnd"
  | "transcriptReady"
  | "summaryReady";

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  type: NotificationType,
) {
  try {
    const preferences = await prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    if (!preferences || !preferences[type]) {
      console.log(
        `Notification of type ${type} is disabled for user ${userId}`,
      );
      return;
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    const notifications = subscriptions.map((subscription) => {
      return webPush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        JSON.stringify({ title, body }),
      );
    });

    await Promise.all(notifications);
    console.log(
      `Sent ${notifications.length} push notifications for user ${userId}`,
    );
  } catch (error) {
    console.error("Error sending push notification:", error);
    throw error;
  }
}

export async function areNotificationsEnabled(
  userId: string,
  type: NotificationType,
): Promise<boolean> {
  const preferences = await prisma.notificationPreferences.findUnique({
    where: { userId },
  });

  return !!preferences && preferences[type];
}
