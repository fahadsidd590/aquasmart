import React, { useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { apiRequest } from '../config/api';
import { getUser } from '../services/authStorage';
import { sensorPackageFingerprint } from '../utils/liveDataFingerprint';

export default function QualityScreen() {
  const lastSensorFingerprint = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const [quality, setQuality] = useState({
    status: 'Unknown',
    description: 'No sensor reading yet',
    decisionTitle: 'Waiting for Sensor Data',
    decisionDescription: 'Please send readings from ESP first.',
    decisionUse: 'Area based live quality will appear here.',
    areaId: 1,
    metrics: [
      { label: 'pH Level', value: 'N/A', status: 'Unknown', icon: 'science' },
      { label: 'Turbidity', value: 'N/A', status: 'Unknown', icon: 'opacity' },
      { label: 'TDS', value: 'N/A', status: 'Unknown', icon: 'science' },
      { label: 'Clean Valve', value: 'N/A', status: 'Unknown', icon: 'settings-input-component' },
      { label: 'Dirty Valve', value: 'N/A', status: 'Unknown', icon: 'settings-input-component' },
    ],
  });

  const loadAreaQuality = useCallback(async (force = false) => {
    const me = await getUser();
    const areaId = me?.areaId && me.areaId > 0 ? me.areaId : 1;
    try {
      const response = await apiRequest(`/api/area-sensor-state/current?areaId=${areaId}`);
      const fp = sensorPackageFingerprint(response);
      if (!force && fp === lastSensorFingerprint.current) return;
      lastSensorFingerprint.current = fp;
      const state = response?.data || response;
      const status = state?.status || 'Unknown';
      setQuality({
        status,
        description: status === 'NOT_SAFE' ? 'Water is not safe for use' : 'Water quality within acceptable range',
        decisionTitle: status === 'NOT_SAFE' ? 'Water Quality Alert' : 'Water Quality Approved',
        decisionDescription:
          status === 'NOT_SAFE'
            ? 'One or more values are outside acceptable range'
            : 'All values are in expected range',
        decisionUse:
          status === 'NOT_SAFE'
            ? 'Run treatment before using this water'
            : 'Suitable for non-potable use',
        areaId,
        metrics: [
          { label: 'pH Level', value: `${state?.ph ?? 'N/A'}`, status, icon: 'science' },
          { label: 'Turbidity', value: `${state?.turbidity ?? 'N/A'} NTU`, status, icon: 'opacity' },
          { label: 'TDS', value: `${state?.tds ?? 'N/A'} ppm`, status, icon: 'science' },
          {
            label: 'Tank',
            value: (() => {
              const w = state?.waterLevel ?? state?.WaterLevel;
              const s = w != null ? String(w).trim() : '';
              if (s === '1') return 'Full';
              if (s === '0') return 'Not full';
              return 'No reading';
            })(),
            status: (() => {
              const w = state?.waterLevel ?? state?.WaterLevel;
              const s = w != null ? String(w).trim() : '';
              if (s === '1') return 'Full';
              if (s === '0') return 'Low';
              return 'Unknown';
            })(),
            icon: 'opacity',
          },
          { label: 'Clean Valve', value: state?.cleanValve || 'N/A', status: state?.cleanValve || 'Unknown', icon: 'settings-input-component' },
          { label: 'Dirty Valve', value: state?.dirtyValve || 'N/A', status: state?.dirtyValve || 'Unknown', icon: 'settings-input-component' },
        ],
      });
    } catch {
      if (!force && lastSensorFingerprint.current === '__err__') return;
      lastSensorFingerprint.current = '__err__';
      setQuality((prev) => ({ ...prev, areaId }));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      const poll = () => {
        if (alive) loadAreaQuality(false);
      };
      poll();
      const id = setInterval(poll, 2000);
      return () => {
        alive = false;
        clearInterval(id);
        lastSensorFingerprint.current = null;
      };
    }, [loadAreaQuality])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAreaQuality(true);
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Normal':
      case 'Good':
      case 'Optimal':
      case 'Clear':
        return theme.colors.success;
      case 'Warning':
        return theme.colors.warning;
      case 'Poor':
      case 'NOT_SAFE':
      case 'OFF':
        return theme.colors.danger;
      case 'ON':
      case 'SAFE':
      case 'Good':
      case 'Full':
        return theme.colors.success;
      case 'Low':
        return theme.colors.warning;
      default:
        return theme.colors.textSecondary;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
    >
      {/* Overall Quality Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Overall Quality</Text>
        <View style={styles.overallQuality}>
          <Icon
            name={quality.status === 'NOT_SAFE' ? 'error' : 'check-circle'}
            size={40}
            color={quality.status === 'NOT_SAFE' ? theme.colors.danger : theme.colors.success}
          />
          <View style={styles.qualityContent}>
            <Text style={styles.qualityStatus}>{quality.status}</Text>
            <Text style={styles.qualityDescription}>
              {quality.description} (Area {quality.areaId})
            </Text>
          </View>
        </View>
      </View>

      {/* Detailed Sensor Data */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Detailed Sensor Data</Text>
        <View style={styles.sensorGrid}>
          {quality.metrics.map((sensor, index) => (
            <View key={index} style={styles.sensorItem}>
              <View style={styles.sensorHeader}>
                <Icon name={sensor.icon} size={20} color={theme.colors.primary} />
                <Text style={styles.sensorLabel}>{sensor.label}</Text>
              </View>
              <Text style={styles.sensorValue}>{sensor.value}</Text>
              <View style={styles.sensorStatus}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(sensor.status) },
                  ]}
                />
                <Text
                  style={[
                    styles.sensorStatusText,
                    { color: getStatusColor(sensor.status) },
                  ]}
                >
                  {sensor.status}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Decision Logic */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Decision Logic</Text>
        <View style={styles.decisionCard}>
          <Icon name="verified" size={24} color={theme.colors.success} />
          <View style={styles.decisionContent}>
            <Text style={styles.decisionTitle}>{quality.decisionTitle}</Text>
            <Text style={styles.decisionDescription}>
              {quality.decisionDescription}
            </Text>
            <Text style={styles.decisionUse}>
              {quality.decisionUse}
            </Text>
          </View>
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
  cardTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  overallQuality: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qualityContent: {
    marginLeft: theme.spacing.md,
  },
  qualityStatus: {
    ...theme.typography.h2,
    color: theme.colors.success,
    marginBottom: theme.spacing.xs,
  },
  qualityDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  sensorGrid: {
    gap: theme.spacing.md,
  },
  sensorItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  sensorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sensorLabel: {
    ...theme.typography.caption,
    marginLeft: theme.spacing.sm,
    color: theme.colors.textSecondary,
  },
  sensorValue: {
    ...theme.typography.h3,
    fontSize: 24,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  sensorStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.xs,
  },
  sensorStatusText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  decisionCard: {
    flexDirection: 'row',
    backgroundColor: '#e6f4ea',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  decisionContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  decisionTitle: {
    ...theme.typography.h3,
    color: theme.colors.success,
    marginBottom: theme.spacing.xs,
  },
  decisionDescription: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  decisionUse: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
});