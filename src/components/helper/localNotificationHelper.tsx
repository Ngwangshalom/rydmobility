import { Notifier, Easing } from 'react-native-notifier';
import { Platform, PermissionsAndroid } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';

class NotificationHelper {
    static async configure() {
        if (Platform.OS === 'android') {
            // Request permissions for Android 13+
            if (Platform.Version >= 33) {
                await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                );
            }

            // Create a channel for Notifee
            await notifee.createChannel({
                id: 'default',
                name: 'Default Channel',
                importance: AndroidImportance.HIGH,
            });
        }
    }

    static showNotification({ title, message }: { title: string; message: string }) {
        // Show in-app banner using react-native-notifier
        Notifier.showNotification({
            title,
            description: message,
            duration: 3000,
            showAnimationDuration: 800,
            showEasing: Easing.out(Easing.exp),
            hideOnPress: true,
        });

        // Also show system notification using Notifee for consistency
        notifee.displayNotification({
            title,
            body: message,
            android: {
                channelId: 'default',
                importance: AndroidImportance.HIGH,
                pressAction: {
                    id: 'default',
                },
            },
        });
    }
}

export default NotificationHelper;
