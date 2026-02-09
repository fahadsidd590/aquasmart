import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { theme } from '../styles/theme';

export default function SettingsScreen() {
  const [automationSettings, setAutomationSettings] = useState({
    autoFill: true,
    smartScheduling: true,
    overflowProtection: true,
  });

  const [alertSettings, setAlertSettings] = useState({
    lowTank: true,
    poorQuality: true,
    filterMaintenance: true,
  });

  const toggleAutomation = (key) => {
    setAutomationSettings({
      ...automationSettings,
      [key]: !automationSettings[key],
    });
  };

  const toggleAlert = (key) => {
    setAlertSettings({
      ...alertSettings,
      [key]: !alertSettings[key],
    });
  };

  const AutomationItem = ({ title, description, value, onToggle }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
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

  const ControlButton = ({ title, icon, color }) => (
    <TouchableOpacity style={[styles.controlButton, { backgroundColor: color }]}>
      <Icon name={icon} size={24} color="#fff" />
      <Text style={styles.controlButtonText}>{title}</Text>
    </TouchableOpacity>
  );
  return (
    <ScrollView style={styles.container}>
      {/* Automation Management */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Automation Management</Text>
        <AutomationItem
          title="Auto Fill Tank"
          description="Fill tank automatically when level is low"
          value={automationSettings.autoFill}
          onToggle={() => toggleAutomation('autoFill')}
        />
        <View style={styles.divider} />
        <AutomationItem
          title="Smart Scheduling"
          description="Optimize pump usage based on patterns"
          value={automationSettings.smartScheduling}
          onToggle={() => toggleAutomation('smartScheduling')}
        />
        <View style={styles.divider} />
        <AutomationItem
          title="Overflow Protection"
          description="Stop filling at 95% capacity"
          value={automationSettings.overflowProtection}
          onToggle={() => toggleAutomation('overflowProtection')}
        />
      </View>

      {/* Alert Settings */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Alert Settings</Text>
        <AlertItem
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
        <View style={styles.divider} />
        <AlertItem
          title="Filter Maintenance"
          enabled={alertSettings.filterMaintenance}
          onToggle={() => toggleAlert('filterMaintenance')}
        />
      </View>

      {/* Manual Control */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Manual Control</Text>
        <View style={styles.controlGrid}>
          <ControlButton
            title="Start Pump"
            icon="play-arrow"
            color={theme.colors.success}
          />
          <ControlButton
            title="Stop Pump"
            icon="stop"
            color={theme.colors.danger}
          />
          <ControlButton
            title="Activate Purification"
            icon="clean-hands"
            color={theme.colors.info}
          />
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
  controlGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  controlButton: {
     flex: 1,
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  controlButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginTop: theme.spacing.sm, // Add margin top instead of gap
    textAlign: 'center', // Ensure text is centered

  },
});