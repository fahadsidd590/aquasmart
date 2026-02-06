import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { theme } from '../styles/theme';

export default function DashboardScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [systemData, setSystemData] = useState({
    tankLevel: 75,
    litersAvailable: 5625,
    waterQuality: 'Good',
    filterStatus: 'Active',
    phLevel: 7.2,
    tds: 145,
    turbidity: 2.5,
    temperature: 24,
    automation: 'Enabled',
    pumpStatus: 'Running',
    lastUpdated: '2 mins ago',
  });

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const QuickReading = ({ label, value, unit, icon }) => (
    <View style={styles.quickReading}>
      <View style={styles.readingHeader}>
        <Icon name={icon} size={20} color={theme.colors.primary} />
        <Text style={styles.readingLabel}>{label}</Text>
      </View>
      <Text style={styles.readingValue}>
        {value} <Text style={styles.readingUnit}>{unit}</Text>
      </Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Tank Level Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Tank Level</Text>
        <View style={styles.tankLevelContainer}>
          <View style={styles.tankLevelBar}>
            <View
              style={[
                styles.tankLevelFill,
                { width: `${systemData.tankLevel}%` },
              ]}
            />
          </View>
          <Text style={styles.tankLevelText}>{systemData.tankLevel}%</Text>
        </View>
        <Text style={styles.litersText}>
          {systemData.litersAvailable.toLocaleString()} Liters Available
        </Text>
      </View>

      {/* Water Quality Card */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Quality')}
      >
        <View style={styles.qualityHeader}>
          <Text style={styles.cardTitle}>Water Quality</Text>
          <Icon name="chevron-right" size={24} color={theme.colors.text} />
        </View>
        <View style={styles.qualityBadge}>
          <Icon name="check-circle" size={20} color={theme.colors.success} />
          <Text style={styles.qualityText}>{systemData.waterQuality}</Text>
        </View>
        <Text style={styles.filterStatus}>
          Filter Status: <Text style={styles.filterActive}>Active</Text>
        </Text>
      </TouchableOpacity>

      {/* Quick Readings */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Readings</Text>
        <View style={styles.quickReadingsGrid}>
          <QuickReading label="pH Level" value={7.2} unit="" icon="science" />
          <QuickReading label="TDS" value={145} unit="ppm" icon="science" />
          <QuickReading label="Turbidity" value={2.5} unit="NTU" icon="opacity" />
          <QuickReading label="Temperature" value={24} unit="°C" icon="device-thermostat" />
        </View>
      </View>

      {/* System Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>System Status</Text>
        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Automation</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusValue}>{systemData.automation}</Text>
            </View>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Pump Status</Text>
            <View style={[styles.statusBadge, styles.pumpRunning]}>
              <Icon name="play-arrow" size={16} color={theme.colors.success} />
              <Text style={styles.statusValue}>{systemData.pumpStatus}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.lastUpdated}>
          Last Updated: {systemData.lastUpdated}
        </Text>
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
  cardTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  tankLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  tankLevelBar: {
    flex: 1,
    height: 20,
    backgroundColor: '#e8f0fe',
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: theme.spacing.md,
  },
  tankLevelFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
  },
  tankLevelText: {
    ...theme.typography.h2,
    fontSize: 24,
    color: theme.colors.primary,
  },
  litersText: {
    ...theme.typography.caption,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  qualityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f4ea',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  qualityText: {
    color: theme.colors.success,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  filterStatus: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  filterActive: {
    color: theme.colors.success,
    fontWeight: '600',
  },
  quickReadingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  quickReading: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  readingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  readingLabel: {
    ...theme.typography.caption,
    marginLeft: theme.spacing.xs,
    color: theme.colors.textSecondary,
  },
  readingValue: {
    ...theme.typography.h3,
    fontSize: 20,
    color: theme.colors.text,
  },
  readingUnit: {
    ...theme.typography.caption,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  statusItem: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  statusLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
  },
  pumpRunning: {
    backgroundColor: '#e6f4ea',
  },
  statusValue: {
    color: theme.colors.success,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  lastUpdated: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
});