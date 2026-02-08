import {
    addCustomBlockedApp,
    getBlockerConfig,
    removeBlockedApp,
    toggleAppBlock,
    toggleAppBlocker,
    toggleBlockOnPomodoroStart,
} from '@/lib/appBlockerService';
import { COLORS } from '@/lib/constants';
import { emitDemoUsage } from '@/lib/demoEvents';
import {
    DEFAULT_SOCIAL_APP,
    getAppLimitMinutes,
    getAppUsageMinutes,
    resetDailyState
} from '@/lib/focusGuard';
import {
    isNativeScreenTimeAvailable,
    openScreenTimeSettings,
    requestScreenTimePermissions
} from '@/lib/nativeScreenTime';
import { AppBlockerConfig, BlockedApp } from '@/lib/types';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface AppBlockerProps {
  onConfigChange?: (config: AppBlockerConfig) => void;
}

export const AppBlocker: React.FC<AppBlockerProps> = ({ onConfigChange }) => {
  const router = useRouter();
  const [config, setConfig] = useState<AppBlockerConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppPackage, setNewAppPackage] = useState('');
  const [newAppCategory, setNewAppCategory] = useState<'social' | 'games' | 'entertainment' | 'communication' | 'other'>('other');
  const [nativeAvailable, setNativeAvailable] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState<boolean | null>(null);
  const [missingPermissions, setMissingPermissions] = useState<string[]>([]);
  const [demoUsageMinutes, setDemoUsageMinutes] = useState(0);

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    const checkNative = async () => {
      const available = await isNativeScreenTimeAvailable();
      setNativeAvailable(available);
    };

    void checkNative();
  }, []);

  useEffect(() => {
    const loadUsage = async () => {
      const minutes = await getAppUsageMinutes(DEFAULT_SOCIAL_APP);
      setDemoUsageMinutes(minutes);
    };

    void loadUsage();
  }, []);

  useEffect(() => {
    if (config && onConfigChange) {
      onConfigChange(config);
    }
  }, [config]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const loadedConfig = await getBlockerConfig();
      setConfig(loadedConfig);
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlocker = async (enabled: boolean) => {
    try {
      const updated = await toggleAppBlocker(enabled);
      setConfig(updated);
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle app blocker');
    }
  };

  const handleToggleBlockOnPomodoro = async (block: boolean) => {
    try {
      const updated = await toggleBlockOnPomodoroStart(block);
      setConfig(updated);
    } catch (error) {
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const handleToggleApp = async (appId: string, isBlocked: boolean) => {
    try {
      const updated = await toggleAppBlock(appId, isBlocked);
      setConfig(updated);
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle app');
    }
  };

  const handleAddApp = async () => {
    if (!newAppName.trim() || !newAppPackage.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const updated = await addCustomBlockedApp(
        newAppPackage,
        newAppName,
        '📱',
        newAppCategory
      );
      setConfig(updated);
      setNewAppName('');
      setNewAppPackage('');
      setNewAppCategory('other');
      setShowAddModal(false);
      Alert.alert('Success', `Added "${newAppName}" to block list`);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add app');
    }
  };

  const handleRemoveApp = async (appId: string, appName: string) => {
    Alert.alert(
      'Remove App',
      `Remove "${appName}" from block list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const updated = await removeBlockedApp(appId);
              setConfig(updated);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove app');
            }
          },
        },
      ]
    );
  };

  const handleRequestPermissions = async () => {
    try {
      const status = await requestScreenTimePermissions();
      setPermissionsGranted(status.granted);
      setMissingPermissions(status.missing || []);
      if (!status.granted) {
        Alert.alert(
          'Permissions Needed',
          'Enable Usage Access and Accessibility to block apps during focus.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request permissions');
    }
  };

  const refreshDemoUsage = async () => {
    const minutes = await getAppUsageMinutes(DEFAULT_SOCIAL_APP);
    setDemoUsageMinutes(minutes);
  };

  const handleSimulateUsage = (minutes: number) => {
    emitDemoUsage(DEFAULT_SOCIAL_APP, minutes, 'settings-demo');
    setTimeout(() => {
      void refreshDemoUsage();
    }, 200);
  };

  const handleResetDemo = async () => {
    await resetDailyState(DEFAULT_SOCIAL_APP);
    await refreshDemoUsage();
  };

  if (loading || !config) {
    return <Text style={styles.loadingText}>Loading...</Text>;
  }

  const blockedCount = config.blockedApps.filter((a: BlockedApp) => a.isBlocked).length;

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <View>
          <Text style={styles.sectionTitle}>🛡️ App Blocker</Text>
          <Text style={styles.sectionDescription}>
            Block distracting apps during Pomodoro sessions
          </Text>
        </View>
      </View>

      {/* Main Toggle */}
      <View style={styles.toggleCard}>
        <View style={styles.toggleContent}>
          <View>
            <Text style={styles.cardTitle}>Enable App Blocker</Text>
            <Text style={styles.cardDesc}>
              {config.enabled
                ? `Blocking ${blockedCount} app${blockedCount !== 1 ? 's' : ''}`
                : 'App blocker is disabled'}
            </Text>
          </View>
          <Switch
            value={config.enabled}
            onValueChange={handleToggleBlocker}
            trackColor={{ false: COLORS.slate300, true: COLORS.secondary }}
            thumbColor={config.enabled ? COLORS.white : COLORS.slate400}
          />
        </View>
      </View>

      {/* Block on Pomodoro Start */}
      <View style={styles.toggleCard}>
        <View style={styles.toggleContent}>
          <View>
            <Text style={styles.cardTitle}>Auto-Block During Pomodoro</Text>
            <Text style={styles.cardDesc}>
              {config.blockOnPomodoroStart
                ? 'Blocks apps automatically when timer starts'
                : 'Blocks apps manually only'}
            </Text>
          </View>
          <Switch
            value={config.blockOnPomodoroStart}
            onValueChange={handleToggleBlockOnPomodoro}
            trackColor={{ false: COLORS.slate300, true: COLORS.secondary }}
            thumbColor={config.blockOnPomodoroStart ? COLORS.white : COLORS.slate400}
          />
        </View>
      </View>

      {/* System Permissions */}
      <View style={styles.permissionCard}>
        <View style={styles.permissionHeader}>
          <Text style={styles.cardTitle}>System Permissions</Text>
          <Text style={styles.cardDesc}>
            {nativeAvailable
              ? 'Native blocker available on this build.'
              : 'Requires custom dev build (Expo Go cannot block apps).'}
          </Text>
          {permissionsGranted === false && missingPermissions.length > 0 && (
            <Text style={styles.permissionHint}>
              Missing: {missingPermissions.join(', ')}
            </Text>
          )}
        </View>
        <View style={styles.permissionActions}>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={handleRequestPermissions}
          >
            <Text style={styles.permissionButtonText}>Request Access</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.permissionButtonSecondary}
            onPress={openScreenTimeSettings}
          >
            <Text style={styles.permissionButtonSecondaryText}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Demo Mode */}
      <View style={styles.demoCard}>
        <Text style={styles.cardTitle}>Demo Mode</Text>
        <Text style={styles.cardDesc}>
          Instagram today: {demoUsageMinutes} min / {getAppLimitMinutes(DEFAULT_SOCIAL_APP)} min
        </Text>
        <View style={styles.demoActions}>
          <TouchableOpacity
            style={styles.demoButton}
            onPress={() => handleSimulateUsage(5)}
          >
            <Text style={styles.demoButtonText}>Simulate 5 min</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.demoButtonDanger}
            onPress={() => handleSimulateUsage(12)}
          >
            <Text style={styles.demoButtonText}>Simulate 12 min</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.demoButtonGhost}
            onPress={() => router.push('/instagram-demo')}
          >
            <Text style={styles.demoButtonGhostText}>Open Instagram Demo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.demoButtonGhost}
            onPress={handleResetDemo}
          >
            <Text style={styles.demoButtonGhostText}>Reset Demo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Blocked Apps List */}
      <View style={styles.appsSection}>
        <View style={styles.appsHeader}>
          <Text style={styles.sectionTitle}>Blocked Apps</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addButtonText}>+ Add App</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          scrollEnabled={false}
          data={config.blockedApps}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.appItem}>
              <View style={styles.appInfo}>
                <Text style={styles.appIcon}>{item.icon || '📱'}</Text>
                <View style={styles.appDetails}>
                  <Text style={styles.appName}>{item.name}</Text>
                  <Text style={styles.appPackage}>{item.packageName}</Text>
                  {item.category && (
                    <Text style={styles.appCategory}>{item.category}</Text>
                  )}
                </View>
              </View>

              <View style={styles.appAction}>
                <Switch
                  value={item.isBlocked}
                  onValueChange={blocked => handleToggleApp(item.id, blocked)}
                  trackColor={{ false: COLORS.slate300, true: COLORS.secondary }}
                  thumbColor={item.isBlocked ? COLORS.white : COLORS.slate400}
                />
                {item.id.startsWith('custom-') && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveApp(item.id, item.name)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      </View>

      {/* Add App Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Add App to Block List</Text>

            <Text style={styles.label}>App Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Facebook"
              value={newAppName}
              onChangeText={setNewAppName}
              placeholderTextColor={COLORS.slate400}
            />

            <Text style={styles.label}>Package Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., com.facebook.katana"
              value={newAppPackage}
              onChangeText={setNewAppPackage}
              placeholderTextColor={COLORS.slate400}
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryButtons}>
              {(['social', 'games', 'entertainment', 'communication', 'other'] as const).map(
                category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      newAppCategory === category && styles.categoryButtonActive,
                    ]}
                    onPress={() => setNewAppCategory(category)}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        newAppCategory === category && styles.categoryButtonTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleAddApp}
            >
              <Text style={styles.buttonText}>Add App</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    color: COLORS.slate500,
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.slate900,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    color: COLORS.slate500,
  },
  toggleCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.slate100,
  },
  permissionCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.slate100,
  },
  permissionHeader: {
    marginBottom: 10,
  },
  permissionHint: {
    marginTop: 6,
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  permissionActions: {
    flexDirection: 'row',
    gap: 10,
  },
  permissionButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  permissionButtonSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: COLORS.slate100,
    borderRadius: 10,
  },
  permissionButtonSecondaryText: {
    color: COLORS.slate700,
    fontSize: 12,
    fontWeight: '700',
  },
  demoCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.slate100,
  },
  demoActions: {
    marginTop: 10,
    gap: 10,
  },
  demoButton: {
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  demoButtonDanger: {
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
  },
  demoButtonGhost: {
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    alignItems: 'center',
  },
  demoButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  demoButtonGhostText: {
    color: COLORS.slate700,
    fontSize: 12,
    fontWeight: '700',
  },
  toggleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.slate800,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: COLORS.slate500,
  },
  appsSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  appsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 12,
  },
  appItem: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.slate100,
  },
  appInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  appDetails: {
    flex: 1,
  },
  appName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.slate800,
  },
  appPackage: {
    fontSize: 11,
    color: COLORS.slate500,
    marginTop: 2,
  },
  appCategory: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  appAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    maxHeight: '80%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 12,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 28,
    color: COLORS.slate500,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.slate900,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.slate700,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.slate50,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    fontSize: 14,
    color: COLORS.slate900,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.slate100,
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.slate600,
  },
  categoryButtonTextActive: {
    color: COLORS.white,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.slate100,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
  cancelButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AppBlocker;
