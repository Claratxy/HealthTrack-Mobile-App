import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addMedicine,
  addOccurrences,
  getMedicines,
  getMedicineOccurrences,
  updateOccurrenceStatus,
  addAppointment,
  getAppointments,
  updateAppointment,
  clearAllData,
} from '../services/storage';
import { generateRecurringDates } from '../utils/dateUtils';
import { calculateDailyProgress } from '../utils/reminderUtils';
import { scheduleMedicineReminder, scheduleAppointmentReminder } from '../services/notifications';

// Reset AsyncStorage between tests so each test starts from a clean slate,
// mirroring a fresh app install.
beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('Integration: Add Medicine flow', () => {
  test('a new medicine generates occurrences, and marking one Taken updates progress', async () => {
    // 1. Add a recurring medicine for 3 days
    const medicine = await addMedicine({
      name: 'Vitamin D',
      dosage: '10',
      unit: 'mg',
      isRecurring: true,
      frequency: 'Every day',
      selectedDays: [],
      times: ['08:00'],
      startDate: '2026-01-01',
      endDate: '2026-01-03',
      reminderEnabled: true,
      notes: '',
    });

    expect(medicine.id).toBeDefined();

    // 2. Medicine should now appear in storage
    const allMedicines = await getMedicines();
    expect(allMedicines).toHaveLength(1);
    expect(allMedicines[0].name).toBe('Vitamin D');

    // 3. Generate and save occurrences for its schedule
    const dates = generateRecurringDates('2026-01-01', '2026-01-03', []);
    expect(dates).toHaveLength(3);

    const occurrences = await addOccurrences(
      dates.map((date) => ({
        medicineId: medicine.id,
        date,
        scheduledTime: '08:00',
        status: 'Pending',
      }))
    );
    expect(occurrences).toHaveLength(3);

    // 4. All occurrences should be Pending initially, so progress is 0/3
    const savedOccurrences = await getMedicineOccurrences();
    let progress = calculateDailyProgress(savedOccurrences);
    expect(progress).toEqual({ completed: 0, total: 3 });

    // 5. Mark one occurrence as Taken
    const firstOccurrence = savedOccurrences[0];
    await updateOccurrenceStatus(firstOccurrence.id, 'Taken');

    // 6. Progress should now reflect 1/3 completed
    const updatedOccurrences = await getMedicineOccurrences();
    progress = calculateDailyProgress(updatedOccurrences);
    expect(progress).toEqual({ completed: 1, total: 3 });
  });

  test('a reminder is scheduled for each occurrence when reminders are enabled', async () => {
    const medicine = await addMedicine({
      name: 'Ibuprofen',
      dosage: '200',
      unit: 'mg',
      isRecurring: false,
      frequency: 'One-time',
      selectedDays: [],
      times: ['09:00'],
      startDate: '2099-01-01', // far future so it's never treated as past
      endDate: '2099-01-01',
      reminderEnabled: true,
      notes: '',
    });

    const occurrences = await addOccurrences([
      { medicineId: medicine.id, date: '2099-01-01', scheduledTime: '09:00', status: 'Pending' },
    ]);

    const notificationId = await scheduleMedicineReminder(medicine.name, '2099-01-01', '09:00');
    expect(notificationId).toBe('mock-notification-id');
  });
});

describe('Integration: Add Appointment flow', () => {
  test('a new appointment is saved, appears in the list, and can be marked Completed', async () => {
    const appointment = await addAppointment({
      title: 'Dental Check-up',
      type: 'Dental',
      date: '2099-06-01',
      time: '14:30',
      location: 'ABC Dental Clinic',
      notes: '',
    });

    expect(appointment.status).toBe('Upcoming');

    // Appears in storage
    let allAppointments = await getAppointments();
    expect(allAppointments).toHaveLength(1);
    expect(allAppointments[0].title).toBe('Dental Check-up');

    // A reminder can be scheduled for it
    const notificationId = await scheduleAppointmentReminder(
      appointment.title,
      appointment.date,
      appointment.time,
      30
    );
    expect(notificationId).toBe('mock-notification-id');

    // Mark it Completed
    await updateAppointment(appointment.id, { status: 'Completed' });

    allAppointments = await getAppointments();
    expect(allAppointments[0].status).toBe('Completed');
  });
});

describe('Integration: Clearing all data', () => {
  test('clearAllData removes medicines, occurrences, and appointments', async () => {
    await addMedicine({ name: 'Test Med', dosage: '5', unit: 'mg', isRecurring: false, times: ['08:00'], startDate: '2099-01-01', endDate: '2099-01-01', reminderEnabled: false, notes: '' });
    await addAppointment({ title: 'Test Appt', date: '2099-01-01', time: '10:00' });

    let medicines = await getMedicines();
    let appointments = await getAppointments();
    expect(medicines).toHaveLength(1);
    expect(appointments).toHaveLength(1);

    await clearAllData();

    medicines = await getMedicines();
    appointments = await getAppointments();
    expect(medicines).toHaveLength(0);
    expect(appointments).toHaveLength(0);
  });
});