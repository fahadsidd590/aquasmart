import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, CommonActions } from '@react-navigation/native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { getUser, getToken, clearSession } from '../services/authStorage';
import { apiRequest } from '../config/api';
import { postControlAction } from '../services/pumpControl';

const AUTOMATION_STORAGE_KEY = 'aquasmart_automation_settings';

export default function SettingsScreen({ navigation }) {
  const [automationSettings, setAutomationSettings] = useState({
    autoFill: false,
    smartScheduling: true,
    overflowProtection: true,
  });

  const [alertSettings, setAlertSettings] = useState({
    lowTank: true,
    poorQuality: true,
    filterMaintenance: true,
  });

  const [profile, setProfile] = useState(null);
  const [pumpBusy, setPumpBusy] = useState(false);

  const persistAutomation = useCallback(async (next) => {
    try {
      await AsyncStorage.setItem(AUTOMATION_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const u = await getUser();
        if (active) setProfile(u);
        try {
          const raw = await AsyncStorage.getItem(AUTOMATION_STORAGE_KEY);
          if (active && raw) {
            const parsed = JSON.parse(raw);
            setAutomationSettings((prev) => ({
              ...prev,
              ...(typeof parsed.autoFill === 'boolean' ? { autoFill: parsed.autoFill } : {}),
              ...(typeof parsed.smartScheduling === 'boolean' ? { smartScheduling: parsed.smartScheduling } : {}),
              ...(typeof parsed.overflowProtection === 'boolean'
                ? { overflowProtection: parsed.overflowProtection }
                : {}),
            }));
          }
        } catch {
          /* ignore */
        }
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  const goFilterHistory = () => {
    navigation.navigate('FilterHistory');
  };

  const onLogout = () => {
    Alert.alert('Sign out', 'You will need to sign in again to use the app.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await clearSession();
          const root = navigation.getParent()?.getParent();
          if (root) {
            root.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              })
            );
          } else {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              })
            );
          }
        },
      },
    ]);
  };

  const setAutomationKey = useCallback(
    (key, value) => {
      setAutomationSettings((prev) => {
        const next = { ...prev, [key]: value };
        void persistAutomation(next);
        return next;
      });
    },
    [persistAutomation]
  );

  const onAutoFillChange = useCallback(
    async (value) => {
      const token = await getToken();
      if (!token) {
        Alert.alert('Sign in', 'Sign in to sync pump with Auto Fill Tank.');
        return;
      }
      setAutomationSettings((prev) => {
        const next = { ...prev, autoFill: value };
        void persistAutomation(next);
        return next;
      });
      try {
        setPumpBusy(true);
        if (value) {
          let startPump = true;
          try {
            const data = await apiRequest('/api/area-sensor-state/current?areaId=1', { token });
            const state = data?.data || data;
            const wl = String(state?.waterLevel ?? state?.WaterLevel ?? '0').trim();
            startPump = wl !== '1';
          } catch {
            startPump = true;
          }
          await postControlAction(token, 1, startPump ? 'pump start' : 'pump stop');
        } else {
          await postControlAction(token, 1, 'pump stop');
        }
      } catch (e) {
        Alert.alert('Pump sync failed', e?.message || 'Could not update pump for area 1.');
      } finally {
        setPumpBusy(false);
      }
    },
    [persistAutomation]
  );

  const pumpDeviceAreaId = async () => {
    const u = await getUser();
    return u?.areaId && u.areaId > 0 ? u.areaId : 1;
  };

  const onPumpStart = async () => {
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Sign in', 'Sign in to control the pump.');
        return;
      }
      setPumpBusy(true);
      const areaId = await pumpDeviceAreaId();
      await postControlAction(token, areaId, 'pump start');
      Alert.alert('Pump', 'Start command saved.');
    } catch (e) {
      Alert.alert('Error', e?.message || 'Request failed');
    } finally {
      setPumpBusy(false);
    }
  };

  const onPumpStop = async () => {
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Sign in', 'Sign in to control the pump.');
        return;
      }
      setPumpBusy(true);
      const areaId = await pumpDeviceAreaId();
      await postControlAction(token, areaId, 'pump stop');
      Alert.alert('Pump', 'Stop command saved.');
    } catch (e) {
      Alert.alert('Error', e?.message || 'Request failed');
    } finally {
      setPumpBusy(false);
    }
  };

  const onPurify = async () => {
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Sign in', 'Sign in to run purify.');
        return;
      }
      setPumpBusy(true);
      const areaId = await pumpDeviceAreaId();
      await postControlAction(token, areaId, 'purify cycle');
      Alert.alert('Purify', 'Command logged (does not change pump on/off state).');
    } catch (e) {
      Alert.alert('Error', e?.message || 'Request failed');
    } finally {
      setPumpBusy(false);
    }
  };

  const toggleAlert = (key) => {
    setAlertSettings({
      ...alertSettings,
      [key]: !alertSettings[key],
    });
  };

  const AutomationItem = ({ title, description, value, onValueChange, switchDisabled }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={switchDisabled}
        trackColor={{ false: '#767577', true: theme.colors.primary }}
        thumbColor="#ffffff"
      />
    </View>
  );

  const AlertItem = ({ title, enabled, onToggle }) => (
    <View style={styles.settingItem}>
      <Text style={styles.settingTitle}>{title}</Text>
      <Switch
        value={enabled}
        onValueChange={onToggle}
        trackColor={{ false: '#767577', true: theme.colors.primary }}
        thumbColor="#ffffff"
      />
    </View>
  );

  const ControlButton = ({ title, icon, color, onPress, disabled }) => (
    <TouchableOpacity
      style={[styles.controlButton, { backgroundColor: color }, disabled && styles.controlButtonDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Icon name={icon} size={24} color="#fff" />
      <Text style={styles.controlButtonText}>{title}</Text>
    </TouchableOpacity>
  );
  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Account</Text>
        {profile?.email ? (
          <Text style={styles.accountEmail}>{profile.email}</Text>
        ) : null}
        <TouchableOpacity style={styles.accountRow} onPress={goFilterHistory} activeOpacity={0.7}>
          <Icon name="history" size={22} color={theme.colors.primary} />
          <View style={styles.accountRowText}>
            <Text style={styles.accountRowTitle}>Filter change history</Text>
            <Text style={styles.accountRowSub}>All updates to your water filters</Text>
          </View>
          <Icon name="chevron-right" size={22} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.accountRow} onPress={onLogout} activeOpacity={0.7}>
          <Icon name="logout" size={22} color={theme.colors.danger} />
          <View style={styles.accountRowText}>
            <Text style={[styles.accountRowTitle, { color: theme.colors.danger }]}>Sign out</Text>
            <Text style={styles.accountRowSub}>Log out of this device</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Automation Management */}
      {/* <View style={styles.card}>
        <Text style={styles.sectionTitle}>Automation Management</Text>
        <AutomationItem
          title="Auto Fill Tank"
          description="Syncs pump for area 1: ON uses tank sensor (not full → start, full → stop); OFF stops pump"
          value={automationSettings.autoFill}
          onValueChange={onAutoFillChange}
          switchDisabled={pumpBusy}
        />
        <View style={styles.divider} />
        <AutomationItem
          title="Smart Scheduling"
          description="Optimize pump usage based on patterns"
          value={automationSettings.smartScheduling}
          onValueChange={(v) => setAutomationKey('smartScheduling', v)}
        />
        <View style={styles.divider} />
        <AutomationItem
          title="Overflow Protection"
          description="Stop filling at 95% capacity"
          value={automationSettings.overflowProtection}
          onValueChange={(v) => setAutomationKey('overflowProtection', v)}
        />
      </View> */}

      {/* Alert Settings */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Alert Settings</Text>
        {/* <AlertItem
          title="Low Tank Level"
          enabled={alertSettings.lowTank}
          onToggle={() => toggleAlert('lowTank')}
        />
        <View style={styles.divider} />
        <AlertItem
          title="Poor Water Quality"
          enabled={alertSettings.poorQuality}
          onToggle={() => toggleAlert('poorQuality')}
        />
        <View style={styles.divider} /> */}
        <AlertItem
          title="Filter Maintenance"
          enabled={alertSettings.filterMaintenance}
          onToggle={() => toggleAlert('filterMaintenance')}
        />
      </View>

      {/* Manual Control */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Manual Control</Text>
        {pumpBusy ? (
          <View style={styles.pumpBusyRow}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={styles.pumpBusyText}>Saving…</Text>
          </View>
        ) : null}
        <View style={styles.controlGrid}>
          <ControlButton
            title="Open Valve"
            icon="play-arrow"
            color={theme.colors.success}
            onPress={onPumpStart}
            disabled={pumpBusy}
          />
          <ControlButton
            title="Stop Valve"
            icon="stop"
            color={theme.colors.danger}
            onPress={onPumpStop}
            disabled={pumpBusy}
          />
          {/* <ControlButton
            title="Purify"
            icon="clean-hands"
            color={theme.colors.info}
            onPress={onPurify}
            disabled={pumpBusy}
          /> */}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.lg,
    color: theme.colors.text,
  },
  accountEmail: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  accountRowText: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  accountRowTitle: {
    ...theme.typography.h3,
    fontSize: 16,
    color: theme.colors.text,
  },
  accountRowSub: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingTitle: {
    ...theme.typography.h3,
    fontSize: 16,
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
  },
  settingDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  pumpBusyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  pumpBusyText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  controlGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  controlButton: {
     flex: 1,
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  controlButtonDisabled: {
    opacity: 0.55,
  },
  controlButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginTop: theme.spacing.sm, // Add margin top instead of gap
    textAlign: 'center', // Ensure text is centered

  },
});