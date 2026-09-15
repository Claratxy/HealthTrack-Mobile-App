import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, isValidPassword } from '../utils/validation';
import { colors, spacing, radius, shadow, typography } from '../styles/theme';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    setError('');
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!isValidPassword(password)) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await register({ name, email, password });
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logoWrap}>
          <View style={styles.logoBadge}>
            <Ionicons name="heart-circle" size={54} color={colors.primary} />
          </View>
          <Text style={styles.appName}>HealthTrack</Text>
          <Text style={styles.tagline}>Create your account</Text>
        </View>

        <View style={styles.card}>
          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input} value={name} onChangeText={setName}
            placeholder="Your name" placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter your password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={handleRegister} disabled={submitting} activeOpacity={0.85}>
            {submitting ? (
              <ActivityIndicator color={colors.textOnPrimary} />
            ) : (
              <Text style={styles.primaryBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkWrap} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkTextBold}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.privacyRow}>
          <Ionicons name="lock-closed-outline" size={12} color={colors.textMuted} />
          <Text style={styles.privacyNote}>
            Your account and health data stay on this device only. Nothing is uploaded.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: spacing.xl, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: spacing.lg },
  logoBadge: {
    width: 80, height: 80, borderRadius: radius.pill, backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
  },
  appName: { ...typography.h1, color: colors.textPrimary },
  tagline: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.xxl, padding: spacing.xl,
    borderWidth: 1, borderColor: colors.border, ...shadow.md,
  },
  label: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs, marginTop: spacing.md },
  input: {
    backgroundColor: colors.surfaceMuted, borderRadius: radius.md, paddingHorizontal: spacing.md,
    paddingVertical: spacing.md, fontSize: 15, borderWidth: 1.5, borderColor: colors.border, color: colors.textPrimary,
  },
  passwordRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceMuted, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: spacing.md,
  },
  passwordInput: { flex: 1, paddingVertical: spacing.md, fontSize: 15, color: colors.textPrimary },
  primaryBtn: {
    backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: spacing.md + 4,
    alignItems: 'center', marginTop: spacing.xl, ...shadow.sm,
  },
  primaryBtnText: { color: colors.textOnPrimary, fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  linkWrap: { marginTop: spacing.lg, alignItems: 'center' },
  linkText: { fontSize: 13, color: colors.textSecondary },
  linkTextBold: { color: colors.primaryDark, fontWeight: '700' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.dangerLight, borderRadius: radius.md,
    padding: spacing.sm + 2, marginBottom: spacing.sm,
  },
  errorText: { color: colors.danger, fontSize: 13, marginLeft: spacing.sm, flex: 1, fontWeight: '500' },
  privacyRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', marginTop: spacing.xl, paddingHorizontal: spacing.lg },
  privacyNote: { fontSize: 11, color: colors.textMuted, textAlign: 'center', lineHeight: 16, marginLeft: 5 },
});