import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import HealthRecordCard from '../components/HealthRecordCard';
import { getHealthRecords, deleteHealthRecord } from '../services/storage';
import { sortByDateTimeAsc } from '../utils/dateUtils';
import { colors, spacing, radius, shadow } from '../styles/theme';

export default function HealthRecordScreen({ navigation }) {
  const [records, setRecords] = useState([]);

  const loadData = useCallback(async () => {
    const list = await getHealthRecords();
    setRecords(sortByDateTimeAsc(list).reverse());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleDelete = (id, title) => {
    Alert.alert('Delete Record', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await deleteHealthRecord(id);
          loadData();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="document-text-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No health records yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('HealthRecordForm', { recordId: item.id })} activeOpacity={0.75}>
            <HealthRecordCard record={item} onDelete={() => handleDelete(item.id, item.title)} />
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('HealthRecordForm')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={colors.textOnPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: spacing.lg, paddingBottom: 100 },
  emptyWrap: { alignItems: 'center', marginTop: spacing.xxxl },
  emptyText: { color: colors.textMuted, fontSize: 13, marginTop: spacing.sm },
  fab: {
    position: 'absolute', right: spacing.xl, bottom: spacing.xl, width: 58, height: 58,
    borderRadius: radius.pill, backgroundColor: colors.accentPurple,
    alignItems: 'center', justifyContent: 'center', ...shadow.lg,
  },
});