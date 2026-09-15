import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, Switch } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { getProfile, saveProfile, clearAllData } from '../services/storage';
import { cancelAllNotifications, requestNotificationPermissions } from '../services/notifications';
import { useProfileContext } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius, shadow, typography } from '../styles/theme';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const { refreshProfile } = useProfileContext();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  const loadProfile = useCallback(async () => {
    const p = await refreshProfile(); // now updates shared context too
    setProfile(p);
  }, [refreshProfile]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access to set a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      const uri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
      const updated = await saveProfile({ profileImage: uri });
      setProfile(updated);
    }
  };

  const toggleCycleTracking = async (value) => {
    const updated = await saveProfile({ cycleTrackingEnabled: value });
    setProfile(updated);
  };

  const toggleNotifications = async (value) => {
    if (value) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert('Permission needed', 'Please allow notifications to receive reminders.');
        return;
      }
    } else {
      await cancelAllNotifications();
    }
    const updated = await saveProfile({ notificationsEnabled: value });
    setProfile(updated);
  };

  const handleClearData = () => {
    Alert.alert('Clear All Data', 'This will permanently delete all your HealthTrack data. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearAllData();
          await cancelAllNotifications();
          Alert.alert('Done', 'All data has been cleared.');
          loadProfile();
        },
      },
    ]);
  };

  if (!profile) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarWrap}>
        <TouchableOpacity onPress={handlePickImage} activeOpacity={0.85}>
          {profile.profileImage ? (
            <Image source={{ uri: profile.profileImage }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person-circle-outline" size={82} color={colors.primary} />
            </View>
          )}
          <View style={styles.cameraBadge}>
            <Ionicons name="camera" size={13} color={colors.textOnPrimary} />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{profile.name || 'Add your name'}</Text>
        <Text style={styles.subtitle}>HealthTrack User</Text>
      </View>

      <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')} activeOpacity={0.85}>
        <Ionicons name="create-outline" size={17} color={colors.primaryDark} />
        <Text style={styles.editBtnText}>Edit Personal Details</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Details</Text>
        <DetailRow label="Gender" value={profile.gender || 'Not set'} />
        <DetailRow label="Date of Birth" value={profile.dateOfBirth || 'Not set'} />
        <DetailRow label="Contact" value={profile.contactInformation || 'Not set'} />
        <DetailRow label="Emergency Contact" value={profile.emergencyContact || 'Not set'} last />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Settings</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Enable Reminders</Text>
          <Switch
            value={profile.notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Modules</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Menstrual Cycle Tracking</Text>
          <Switch
            value={profile.cycleTrackingEnabled}
            onValueChange={toggleCycleTracking}
            trackColor={{ false: colors.border, true: colors.accentPink }}
            thumbColor={colors.surface}
          />
        </View>
        <Text style={styles.switchHint}>
          When enabled, a Cycle tab will appear so you can log and estimate your cycle.
        </Text>
      </View>

      <View style={[styles.section, styles.privacySection]}>
        <View style={styles.privacyHeader}>
          <Ionicons name="shield-checkmark-outline" size={16} color={colors.creamText} />
          <Text style={[styles.sectionTitle, { marginBottom: 0, marginLeft: spacing.xs }]}>Privacy</Text>
        </View>
        <Text style={styles.sectionBody}>
          All your health data, including your profile picture, is stored locally on this
          device only. Nothing is shared or uploaded.
        </Text>
      </View>

      <Text style={styles.userEmail}>{user?.email || 'HealthTrack User'}</Text>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
        <Ionicons name="log-out-outline" size={17} color={colors.textSecondary} />
        <Text style={styles.logoutBtnText}>Log Out</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.dangerBtn} onPress={handleClearData} activeOpacity={0.85}>
        <Text style={styles.dangerBtnText}>Clear All Data</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function DetailRow({ label, value, last }) {
  return (
    <View style={[styles.detailRow, last && { marginBottom: 0 }]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: spacing.xxxl + 10 },
  avatarWrap: { alignItems: 'center', marginBottom: spacing.lg },
  avatarImage: { width: 90, height: 90, borderRadius: radius.pill },
  avatarPlaceholder: {
    width: 90, height: 90, borderRadius: radius.pill, backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.primary,
    width: 26, height: 26, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.background,
  },
  name: { ...typography.h2, color: colors.textPrimary, marginTop: spacing.md },
  subtitle: { fontSize: 13, color: colors.textSecondary },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primaryLight, borderRadius: radius.lg, paddingVertical: spacing.sm + 2, marginBottom: spacing.lg,
  },
  editBtnText: { color: colors.primaryDark, fontWeight: '700', marginLeft: spacing.xs, fontSize: 13 },
  section: {
    width: '100%', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg,
    marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadow.xs,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  sectionBody: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  detailLabel: { fontSize: 13, color: colors.textSecondary },
  detailValue: { fontSize: 13, color: colors.textPrimary, fontWeight: '700' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchLabel: { fontSize: 13, color: colors.textPrimary, fontWeight: '600' },
  switchHint: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 16 },
  privacySection: { backgroundColor: colors.cream, borderColor: colors.creamDark },
  privacyHeader: { flexDirection: 'row', alignItems: 'center' },
  userEmail: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surfaceMuted, borderRadius: radius.lg, paddingVertical: spacing.sm + 2, marginBottom: spacing.lg,
  },
  logoutBtnText: { color: colors.textSecondary, fontWeight: '700', marginLeft: spacing.xs, fontSize: 13 },
  dangerBtn: {
    width: '100%', borderWidth: 1.5, borderColor: colors.danger, borderRadius: radius.lg,
    paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xs, marginBottom: spacing.xxxl,
  },
  dangerBtnText: { color: colors.danger, fontWeight: '700' },
});