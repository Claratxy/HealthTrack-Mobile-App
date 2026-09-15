import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  MEDICINES: 'healthtrack_medicines',
  MEDICINE_OCCURRENCES: 'healthtrack_medicine_occurrences',
  APPOINTMENTS: 'healthtrack_appointments',
  HEALTH_RECORDS: 'healthtrack_health_records',
  PROFILE: 'healthtrack_profile',
  CYCLE_DATA: 'healthtrack_cycle_data',
  CYCLE_LOGS: 'healthtrack_cycle_logs',
  AUTH_ACCOUNT: 'healthtrack_account',   
  AUTH_SESSION: 'healthtrack_session',  
};

async function getList(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Storage get error', key, e);
    return [];
  }
}

async function saveList(key, list) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(list));
    return true;
  } catch (e) {
    console.error('Storage save error', key, e);
    return false;
  }
}

async function getObject(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Storage get error', key, e);
    return null;
  }
}

async function saveObject(key, obj) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(obj));
    return true;
  } catch (e) {
    console.error('Storage save error', key, e);
    return false;
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ---------- Medicines ----------
export async function getMedicines() {
  return getList(KEYS.MEDICINES);
}

export async function getMedicineById(id) {
  const list = await getMedicines();
  return list.find((m) => m.id === id) || null;
}

export async function addMedicine(medicine) {
  const list = await getMedicines();
  const newMedicine = { id: generateId(), ...medicine };
  list.push(newMedicine);
  await saveList(KEYS.MEDICINES, list);
  return newMedicine;
}

export async function updateMedicine(id, updates) {
  const list = await getMedicines();
  const idx = list.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates };
  await saveList(KEYS.MEDICINES, list);
  return list[idx];
}

export async function deleteMedicine(id) {
  const list = await getMedicines();
  const filtered = list.filter((m) => m.id !== id);
  await saveList(KEYS.MEDICINES, filtered);
  const occurrences = await getMedicineOccurrences();
  const filteredOcc = occurrences.filter((o) => o.medicineId !== id);
  await saveList(KEYS.MEDICINE_OCCURRENCES, filteredOcc);
  return true;
}

// ---------- Medicine Occurrences ----------
export async function getMedicineOccurrences() {
  return getList(KEYS.MEDICINE_OCCURRENCES);
}

export async function deleteOccurrencesForMedicine(medicineId) {
  const list = await getMedicineOccurrences();
  const toRemove = list.filter((o) => o.medicineId === medicineId);
  const remaining = list.filter((o) => o.medicineId !== medicineId);

  // Import is done at call site to avoid a circular import between
  // storage.js and notifications.js; see updated screens below.
  return { toRemove, remaining };
}

export async function saveOccurrenceList(list) {
  await saveList(KEYS.MEDICINE_OCCURRENCES, list);
}

export async function addOccurrences(occurrences) {
  const list = await getMedicineOccurrences();
  const newOnes = occurrences.map((o) => ({ id: generateId(), notificationId: null, ...o }));
  const updated = [...list, ...newOnes];
  await saveList(KEYS.MEDICINE_OCCURRENCES, updated);
  return newOnes;
}

export async function updateOccurrenceStatus(id, status) {
  const list = await getMedicineOccurrences();
  const idx = list.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], status };
  await saveList(KEYS.MEDICINE_OCCURRENCES, list);
  return list[idx];
}

// Attaches a scheduled notification's identifier to its occurrence record.
export async function setOccurrenceNotificationId(occurrenceId, notificationId) {
  const list = await getMedicineOccurrences();
  const idx = list.findIndex((o) => o.id === occurrenceId);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], notificationId };
  await saveList(KEYS.MEDICINE_OCCURRENCES, list);
  return list[idx];
}

// ---------- Appointments ----------
export async function getAppointments() {
  return getList(KEYS.APPOINTMENTS);
}

export async function getAppointmentById(id) {
  const list = await getAppointments();
  return list.find((a) => a.id === id) || null;
}

export async function addAppointment(appointment) {
  const list = await getAppointments();
  const newAppt = { id: generateId(), status: 'Upcoming', ...appointment };
  list.push(newAppt);
  await saveList(KEYS.APPOINTMENTS, list);
  return newAppt;
}

export async function updateAppointment(id, updates) {
  const list = await getAppointments();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates };
  await saveList(KEYS.APPOINTMENTS, list);
  return list[idx];
}

export async function deleteAppointment(id) {
  const list = await getAppointments();
  const filtered = list.filter((a) => a.id !== id);
  await saveList(KEYS.APPOINTMENTS, filtered);
  return true;
}

// ---------- Health Records ----------
export async function getHealthRecords() {
  return getList(KEYS.HEALTH_RECORDS);
}

export async function getHealthRecordById(id) {
  const list = await getHealthRecords();
  return list.find((r) => r.id === id) || null;
}

export async function addHealthRecord(record) {
  const list = await getHealthRecords();
  const newRecord = { id: generateId(), ...record };
  list.push(newRecord);
  await saveList(KEYS.HEALTH_RECORDS, list);
  return newRecord;
}

export async function updateHealthRecord(id, updates) {
  const list = await getHealthRecords();
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates };
  await saveList(KEYS.HEALTH_RECORDS, list);
  return list[idx];
}

export async function deleteHealthRecord(id) {
  const list = await getHealthRecords();
  const filtered = list.filter((r) => r.id !== id);
  await saveList(KEYS.HEALTH_RECORDS, filtered);
  return true;
}

// ---------- Profile ----------
const DEFAULT_PROFILE = {
  name: '',
  gender: '',
  dateOfBirth: '',
  contactInformation: '',
  emergencyContact: '',
  profileImage: null,
  cycleTrackingEnabled: false,
  notificationsEnabled: true,
};

export async function getProfile() {
  const profile = await getObject(KEYS.PROFILE);
  return profile ? { ...DEFAULT_PROFILE, ...profile } : { ...DEFAULT_PROFILE };
}

export async function saveProfile(updates) {
  const current = await getProfile();
  const updated = { ...current, ...updates };
  await saveObject(KEYS.PROFILE, updated);
  return updated;
}

// ---------- Cycle Tracking ----------
const DEFAULT_CYCLE_DATA = {
  trackingEnabled: false,
  lastPeriodStartDate: null,
  averageCycleLength: 28,
  averagePeriodLength: 5,
};

export async function getCycleData() {
  const data = await getObject(KEYS.CYCLE_DATA);
  return data ? { ...DEFAULT_CYCLE_DATA, ...data } : { ...DEFAULT_CYCLE_DATA };
}

export async function saveCycleData(updates) {
  const current = await getCycleData();
  const updated = { ...current, ...updates };
  await saveObject(KEYS.CYCLE_DATA, updated);
  return updated;
}

export async function getCycleLogs() {
  return getList(KEYS.CYCLE_LOGS);
}

export async function addCycleLog(log) {
  const list = await getCycleLogs();
  const newLog = { id: generateId(), ...log };
  list.push(newLog);
  await saveList(KEYS.CYCLE_LOGS, list);
  return newLog;
}

export async function deleteCycleLog(id) {
  const list = await getCycleLogs();
  const filtered = list.filter((l) => l.id !== id);
  await saveList(KEYS.CYCLE_LOGS, filtered);
  return true;
}

export async function clearAllData() {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}

// ---------- Authentication ----------

export async function getAccount() {
  return getObject(KEYS.AUTH_ACCOUNT);
}

export async function createAccount({ name, email, passwordHash }) {
  const account = {
    name,
    email: email.toLowerCase().trim(),
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  await saveObject(KEYS.AUTH_ACCOUNT, account);
  return account;
}

export async function verifyCredentials(email, passwordHash) {
  const account = await getAccount();
  if (!account) return null;
  const normalizedEmail = (email || '').toLowerCase().trim();
  if (account.email !== normalizedEmail || account.passwordHash !== passwordHash) {
    return null;
  }
  return account;
}

export async function getSession() {
  return getObject(KEYS.AUTH_SESSION);
}

export async function setSession(session) {
  await saveObject(KEYS.AUTH_SESSION, session);
}

export async function clearSession() {
  await AsyncStorage.removeItem(KEYS.AUTH_SESSION);
}