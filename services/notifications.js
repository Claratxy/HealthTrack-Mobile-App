import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // Setting an Android notification channel is a no-op on iOS, so we can
  // call it unconditionally instead of checking Platform.OS, avoiding a
  // react-native import in a module that otherwise has none.
  try {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  } catch (e) {
    // Safe to ignore on platforms where this API doesn't apply.
  }

  return finalStatus === 'granted';
}

export async function scheduleNotification({ title, body, date, data = {} }) {
  if (!date || isNaN(new Date(date).getTime())) {
    console.log('scheduleNotification: invalid date', date);
    return null;
  }
  const triggerDate = new Date(date);
  if (triggerDate <= new Date()) {
    console.log('scheduleNotification: date is in the past', triggerDate);
    return null;
  }

  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: { title, body, data },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
    return identifier;
  } catch (e) {
    console.log('scheduleNotification error:', e.message, e);
    return null;
  }
}

export async function cancelNotification(identifier) {
  if (!identifier) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (e) {
    console.error('Failed to cancel notification', e);
  }
}

export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    console.error('Failed to cancel all notifications', e);
  }
}

export async function scheduleMedicineReminder(medicineName, date, time) {
  const [hours, minutes] = time.split(':').map(Number);
  const triggerDate = new Date(date);
  triggerDate.setHours(hours, minutes, 0, 0);

  return scheduleNotification({
    title: 'Medicine Reminder',
    body: `Time to take ${medicineName}`,
    date: triggerDate,
    data: { type: 'medicine' },
  });
}

export async function scheduleAppointmentReminder(title, date, time, minutesBefore = 30) {
  const [hours, minutes] = time.split(':').map(Number);
  const triggerDate = new Date(date);
  triggerDate.setHours(hours, minutes, 0, 0);
  triggerDate.setMinutes(triggerDate.getMinutes() - minutesBefore);

  return scheduleNotification({
    title: 'Upcoming Appointment',
    body: `${title} in ${minutesBefore} minutes`,
    date: triggerDate,
    data: { type: 'appointment' },
  });
}

export async function scheduleCycleReminder(date, daysBefore = 1) {
  const triggerDate = new Date(date);
  triggerDate.setHours(9, 0, 0, 0);
  triggerDate.setDate(triggerDate.getDate() - daysBefore);

  return scheduleNotification({
    title: 'Cycle Reminder',
    body: 'Your estimated period start date is approaching',
    date: triggerDate,
    data: { type: 'cycle' },
  });
}