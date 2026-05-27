import messaging from "@react-native-firebase/messaging";
import notifee, { EventType, AndroidImportance } from "@notifee/react-native";

// Request notification permission
export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();

  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    return await getFCMToken();
  }
}

// Get FCM token
export async function getFCMToken() {
  try {
    const fcmToken = await messaging().getToken();

    if (fcmToken) {
      return fcmToken;
    }
  } catch (error) {
    console.log("FCM Token Error:", error);
  }
}

// Create Android notification channel
async function createNotificationChannel() {
  const channelId = await notifee.createChannel({
    id: "default",
    name: "Default Channel",
    importance: AndroidImportance.HIGH,
  });

  return channelId;
}

// Show Local Notification (Same UI as background)
async function showLocalNotification(remoteMessage) {
  const channelId = await createNotificationChannel();

  const title =
    remoteMessage.notification?.title ||
    remoteMessage.data?.title ||
    "New Notification";

  const body =
    remoteMessage.notification?.body || remoteMessage.data?.body || "";

  await notifee.displayNotification({
    title: title,
    body: body,
    android: {
      channelId,
      smallIcon: "ic_launcher", // make sure this icon exists
      pressAction: {
        id: "default",
      },
    },
  });
}

export function NotificationServices() {
  // Foreground message
  const unsubscribe = messaging().onMessage(async remoteMessage => {

    // Show system notification when app is open
    await showLocalNotification(remoteMessage);
  });

  // When notification opens app from background
  messaging().onNotificationOpenedApp(remoteMessage => {

    // Navigate screen here if needed
  });

  // When notification opens app from quit state
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
      }
    });

  // Foreground notification press (Notifee)
  const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) {

      // Navigate here if needed
    }
  });

  return () => {
    unsubscribe();
    unsubscribeNotifee();
  };
}

// Handle background messages
messaging().setBackgroundMessageHandler(async remoteMessage => {

  // Show notification for data-only payload
  if (!remoteMessage.notification) {
    await showLocalNotification(remoteMessage);
  }
});

// Handle notification press in background
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
  }
});
