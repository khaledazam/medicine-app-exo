import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Medicine } from '../services/medicinesService';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('medication-reminders', {
        name: 'Medication Reminders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1a8e2d',
        sound: 'default',
      });
    }

    const response = await Notifications.getExpoPushTokenAsync();
    token = response.data;
    return token;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

export async function scheduleMedicineReminders(medicine: Medicine): Promise<string[]> {
  const identifiers: string[] = [];

  try {
    if (!medicine.schedule || medicine.schedule.length === 0) return identifiers;

    for (const time of medicine.schedule) {
      const [hours, minutes] = time.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) continue;

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💊 Medication Reminder',
          body: `Time to take ${medicine.name} (${medicine.dosage})`,
          data: { medicineId: medicine._id, time, type: 'medication' },
          sound: 'default',
          categoryIdentifier: 'medication',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
        },
      });

      identifiers.push(identifier);
    }
  } catch (error) {
    console.error('Error scheduling medicine reminders:', error);
  }

  return identifiers;
}

export async function scheduleAllMedicineReminders(medicines: Medicine[]): Promise<void> {
  try {
    // Cancel all existing medication reminders first
    await cancelAllMedicationReminders();

    // Schedule for each medicine
    for (const medicine of medicines) {
      await scheduleMedicineReminders(medicine);
    }

    console.log(`📅 Scheduled reminders for ${medicines.length} medicines`);
  } catch (error) {
    console.error('Error scheduling all reminders:', error);
  }
}

export async function cancelAllMedicationReminders(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      const data = notification.content.data as { type?: string } | null;
      if (data?.type === 'medication') {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  } catch (error) {
    console.error('Error canceling reminders:', error);
  }
}

export async function cancelMedicineReminders(medicineId: string): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      const data = notification.content.data as { medicineId?: string } | null;
      if (data?.medicineId === medicineId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  } catch (error) {
    console.error('Error canceling medicine reminders:', error);
  }
}

export async function snoozeMedicationReminder(
  medicineId: string,
  medicineName: string,
  dosage: string,
  snoozeMinutes: number = 10
): Promise<string | undefined> {
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Snoozed Reminder',
        body: `Reminder: Take ${medicineName} (${dosage})`,
        data: { medicineId, type: 'medication-snooze' },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: snoozeMinutes * 60,
      },
    });

    return identifier;
  } catch (error) {
    console.error('Error snoozing reminder:', error);
    return undefined;
  }
}

export async function scheduleRefillAlert(medicine: Medicine): Promise<void> {
  try {
    const threshold = medicine.refillAlertAt || 5;
    if (medicine.quantity <= threshold) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚠️ Refill Alert',
          body: medicine.quantity === 0
            ? `${medicine.name} is OUT OF STOCK!`
            : `${medicine.name} supply is low (${medicine.quantity} remaining)`,
          data: { medicineId: medicine._id, type: 'refill' },
          sound: 'default',
        },
        trigger: null, // Show immediately
      });
    }
  } catch (error) {
    console.error('Error scheduling refill alert:', error);
  }
}
