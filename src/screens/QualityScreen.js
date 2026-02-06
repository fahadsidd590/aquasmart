import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { theme } from '../styles/theme';

export default function QualityScreen() {
  const sensorData = [
    { label: 'pH Level', value: '7.2', status: 'Normal', icon: 'science' },
    { label: 'Turbidity', value: '2.5 NTU', status: 'Clear', icon: 'opacity' },
    { label: 'TDS', value: '145 ppm', status: 'Good', icon: 'science' },
    { label: 'Temperature', value: '24°C', status: 'Optimal', icon: 'device-thermostat' },
  ];

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
        return theme.colors.danger;
      default:
        return theme.colors.textSecondary;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Overall Quality Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Overall Quality</Text>
        <View style={styles.overallQuality}>
          <Icon name="check-circle" size={40} color={theme.colors.success} />
          <View style={styles.qualityContent}>
            <Text style={styles.qualityStatus}>Good</Text>
            <Text style={styles.qualityDescription}>
              Safe for non-potable use
            </Text>
          </View>
        </View>
      </View>

      {/* Detailed Sensor Data */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Detailed Sensor Data</Text>
        <View style={styles.sensorGrid}>
          {sensorData.map((sensor, index) => (
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
            <Text style={styles.decisionTitle}>Water Quality Approved</Text>
            <Text style={styles.decisionDescription}>
              All parameters within acceptable range
            </Text>
            <Text style={styles.decisionUse}>
              For non-potable use, Suitable for gardening, cleaning, and flushing
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