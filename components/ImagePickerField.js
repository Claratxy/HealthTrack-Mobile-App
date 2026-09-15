import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../styles/theme';

export default function ImagePickerField({ value, onChange, label = 'Photo (optional)' }) {
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access to add a photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      const uri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
      onChange(uri);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.pickerBox} onPress={pickImage} activeOpacity={0.8}>
        {value ? (
          <Image source={{ uri: value }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <View style={styles.placeholderIconWrap}>
              <Ionicons name="camera-outline" size={20} color={colors.creamText} />
            </View>
            <Text style={styles.placeholderText}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>
      {!!value && (
        <TouchableOpacity onPress={() => onChange(null)} hitSlop={8}>
          <Text style={styles.removeText}>Remove Photo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.md },
  label: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.sm },
  pickerBox: {
    width: 96, height: 96, borderRadius: radius.lg, backgroundColor: colors.cream,
    borderWidth: 1.5, borderColor: colors.creamDark, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center' },
  placeholderIconWrap: {
    width: 34, height: 34, borderRadius: radius.pill, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  placeholderText: { fontSize: 10, color: colors.creamText, marginTop: 2, fontWeight: '700' },
  removeText: { color: colors.danger, fontSize: 12, marginTop: 6, fontWeight: '600' },
});