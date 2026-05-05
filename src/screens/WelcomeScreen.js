import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
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
          <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            
              <Text style={styles.description}>
            Monitor, Control & Save Water Intelligently
          </Text>
          </View>
          {/* <Text style={styles.title}>AquaSmart</Text> */}
          {/* <Text style={styles.subtitle}>
            IoT Based Water Harvesting System
          </Text> */}
        </View>

        {/* Tagline */}
        <View style={styles.taglineContainer}>
         {/*  <Text style={styles.description}>
            Monitor, Control & Save Water Intelligently
          </Text>
          <View style={styles.waterDropContainer}>
            <Text style={styles.waterDrop}>💧</Text>
            <Text style={styles.waterDrop}>💧</Text>
            <Text style={styles.waterDrop}>💧</Text>
          </View> */}
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

          {/* <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff', // Solid blue backgr  ound
    width: '100%',
  },
  contentContainer: {
    flex: 1,
   justifyContent: 'space-between',
   //paddingVertical: theme.spacing.xl * 2,
    paddingHorizontal: theme.spacing.lg,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: height * 0.1,
  },
  logoContainer: {
   //width: 500,
   //height: 250,
  //  borderRadius: 100,
    //backgroundColor: 'rgba(255, 255, 255, 0.2)',
   //justifyContent: 'space-around',
  //alignItems: 'center',
  //  marginBottom: theme.spacing.lg,
   //borderWidth: 3,
   //borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoImage: {
  //  width: 380,
    //height:500,
  },
  title: {
   // ...theme.typography.h1,
   // fontSize: 42,
   // color: '#fff',
   // textAlign: 'center',
   // marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.h2,
    fontSize: 18,
    color: '#005485',
    textAlign: 'start',
    //marginBottom: theme.spacing.md,
    //lineHeight: 24,
    opacity: 0.95,
  },
  taglineContainer: {
    // alignItems: 'center',
  },
  description: {
   // ...theme.typography.body,
    fontSize: 20,
    color: '#5AAFC1',
    textAlign: 'center',
    marginTop: theme.spacing.xl,
   //marginBottom: theme.spacing.xl,
    fontWeight: '600',
  },
  waterDropContainer: {
    flexDirection: 'row',
   // gap: theme.spacing.lg,
  },
  waterDrop: {
    fontSize: 32,
    opacity: 0.8,
  },
  buttonContainer: {
    gap: theme.spacing.md,
   // marginTop: theme.spacing.xl,  
    marginBottom: theme.spacing.xl,
  },
  getStartedButton: {
    backgroundColor: '#5AAFC1',
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  getStartedText: {
    color: '#f8f8f8ff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: 'transparent',
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#5AAFC1',
  },
  loginText: {
    color: '#5AAFC1',
    fontSize: 18,
    fontWeight: 'bold',
  },
});