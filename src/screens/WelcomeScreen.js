import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { theme } from '../styles/theme';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Header/Logo Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>💧</Text>
          </View>
          <Text style={styles.title}>AquaSmart</Text>
          <Text style={styles.subtitle}>
            IoT Based Water Harvesting System
          </Text>
        </View>

        {/* Tagline */}
        <View style={styles.taglineContainer}>
          <Text style={styles.description}>
            Monitor, Control & Save Water Intelligently
          </Text>
          <View style={styles.waterDropContainer}>
            <Text style={styles.waterDrop}>💧</Text>
            <Text style={styles.waterDrop}>💧</Text>
            <Text style={styles.waterDrop}>💧</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a73e8', // Solid blue background
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xl * 2,
    paddingHorizontal: theme.spacing.lg,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: height * 0.1,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoIcon: {
    fontSize: 48,
  },
  title: {
    ...theme.typography.h1,
    fontSize: 42,
    color: '#fff',
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.h2,
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    lineHeight: 24,
    opacity: 0.95,
  },
  taglineContainer: {
    alignItems: 'center',
  },
  description: {
    ...theme.typography.body,
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    fontWeight: '600',
  },
  waterDropContainer: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  waterDrop: {
    fontSize: 32,
    opacity: 0.8,
  },
  buttonContainer: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  getStartedButton: {
    backgroundColor: '#fff',
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  getStartedText: {
    color: '#1a73e8',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: 'transparent',
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  loginText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});