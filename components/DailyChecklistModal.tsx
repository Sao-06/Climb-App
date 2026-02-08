import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '@/lib/constants';
import { DailyChecklist, DailyChecklistItem } from '@/lib/types';
import {
  addChecklistItem,
  getTodayChecklist,
  resetTodayChecklist,
  setChecklistSyncPreference,
  toggleChecklistItem,
} from '@/lib/dailyChecklistService';

interface DailyChecklistModalProps {
  visible: boolean;
  onClose: () => void;
  onPointsEarned?: (points: number) => void;
}

export const DailyChecklistModal: React.FC<DailyChecklistModalProps> = ({
  visible,
  onClose,
  onPointsEarned,
}) => {
  const [checklist, setChecklist] = useState<DailyChecklist | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPoints, setNewPoints] = useState('5');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadChecklist = useCallback(async () => {
    setLoading(true);
    const data = await getTodayChecklist();
    setChecklist(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (visible) {
      void loadChecklist();
    }
  }, [visible, loadChecklist]);

  const handleAddItem = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    const parsedPoints = Number.isNaN(Number(newPoints)) ? 1 : Math.max(1, Math.round(Number(newPoints)));
    const updated = await addChecklistItem(newTitle, newDescription, parsedPoints);
    setChecklist(updated);
    setNewTitle('');
    setNewDescription('');
    setNewPoints('5');
    setSaving(false);
  };

  const handleToggleItem = async (itemId: string) => {
    const { checklist: updated, pointsDelta } = await toggleChecklistItem(itemId);
    setChecklist(updated);
    if (pointsDelta > 0) {
      onPointsEarned?.(pointsDelta);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    const updated = await resetTodayChecklist();
    setChecklist(updated);
    setSaving(false);
  };

  const handleSyncToggle = async (value: boolean) => {
    const updated = await setChecklistSyncPreference(value);
    setChecklist(updated);
  };

  const renderItem = (item: DailyChecklistItem) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.itemRow, item.completed && styles.itemRowCompleted]}
      onPress={() => void handleToggleItem(item.id)}
      activeOpacity={0.8}
    >
      <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
        {item.completed && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, item.completed && styles.itemTitleCompleted]} numberOfLines={2}>
          {item.title}
        </Text>
        {item.description ? (
          <Text style={styles.itemDescription} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
      </View>
      <Text style={styles.itemPoints}>+{item.points}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Daily Checklist</Text>
              <Text style={styles.subtitle}>Build today’s plan and earn XP for each item.</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.syncRow}>
            <View>
              <Text style={styles.syncTitle}>Sync with team (optional)</Text>
              <Text style={styles.syncHint}>Keep local by default; toggle when you want to share.</Text>
            </View>
            <Switch
              value={Boolean(checklist?.syncWithTeam)}
              onValueChange={handleSyncToggle}
              trackColor={{ false: COLORS.slate300, true: COLORS.secondary }}
              thumbColor={checklist?.syncWithTeam ? COLORS.white : COLORS.slate400}
            />
          </View>

          <View style={styles.form}> 
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Add a new item"
              placeholderTextColor={COLORS.slate400}
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Details or acceptance criteria"
              placeholderTextColor={COLORS.slate400}
              value={newDescription}
              onChangeText={setNewDescription}
              multiline
            />
            <Text style={styles.label}>Points</Text>
            <TextInput
              style={styles.input}
              placeholder="5"
              placeholderTextColor={COLORS.slate400}
              keyboardType="numeric"
              value={newPoints}
              onChangeText={setNewPoints}
            />
            <TouchableOpacity
              onPress={handleAddItem}
              style={[styles.primaryButton, (!newTitle.trim() || saving) && styles.primaryButtonDisabled]}
              disabled={!newTitle.trim() || saving}
              activeOpacity={0.85}
            >
              {saving ? <ActivityIndicator color={COLORS.white} size="small" /> : <Text style={styles.primaryButtonText}>Add Item</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Today</Text>
            <Text style={styles.listMeta}>
              {checklist?.items.length || 0} items · {checklist?.pointsEarned || 0} XP earned
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {loading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading checklist…</Text>
              </View>
            )}
            {!loading && checklist?.items.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No items yet. Add your first task for today.</Text>
              </View>
            )}
            {!loading && checklist?.items.map(renderItem)}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleReset}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryButtonText}>Start today’s list</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ghostButton}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.ghostButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.slate900,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.slate500,
    marginTop: 4,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.slate100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: COLORS.slate600,
    fontWeight: '700',
  },
  syncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.slate50,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.slate100,
    marginBottom: 12,
  },
  syncTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.slate800,
  },
  syncHint: {
    fontSize: 12,
    color: COLORS.slate500,
    marginTop: 2,
  },
  form: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.slate100,
    padding: 12,
    gap: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.slate600,
  },
  input: {
    backgroundColor: COLORS.slate50,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    color: COLORS.slate900,
    fontSize: 14,
  },
  inputMultiline: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonDisabled: {
    backgroundColor: COLORS.slate300,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.slate800,
  },
  listMeta: {
    fontSize: 12,
    color: COLORS.slate500,
  },
  listContent: {
    paddingBottom: 12,
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.slate50,
    borderWidth: 1,
    borderColor: COLORS.slate100,
  },
  itemRowCompleted: {
    backgroundColor: COLORS.secondary + '15',
    borderColor: COLORS.secondary + '50',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.slate300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  checkmark: {
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.slate800,
  },
  itemTitleCompleted: {
    color: COLORS.secondary,
    textDecorationLine: 'line-through',
  },
  itemDescription: {
    fontSize: 12,
    color: COLORS.slate500,
    marginTop: 2,
  },
  itemPoints: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.slate700,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.slate600,
  },
  emptyState: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.slate50,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.slate500,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginBottom: 4,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14,
  },
  ghostButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.white,
  },
  ghostButtonText: {
    color: COLORS.slate700,
    fontWeight: '700',
    fontSize: 14,
  },
});
