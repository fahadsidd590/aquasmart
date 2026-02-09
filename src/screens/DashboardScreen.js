import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { theme } from '../styles/theme';

export default function DashboardScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
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

  // Hardcoded location - Change this to your desired city
  const CITY = 'Karachi';
  const COUNTRY = 'PK';
  // Using OpenWeatherMap API (free tier: 60 calls/minute, 1,000,000 calls/month)
  const API_KEY = '4213fff239538dbc509dc355ea04e14a'; // Demo key - replace with your own from https://openweathermap.org/api

  const fetchWeatherData = async () => {
    try {
      setWeatherLoading(true);
      // Using free OpenWeather API for current weather
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${CITY},${COUNTRY}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();
      console.log("weather data ")
      console.log(data)
      if (data && data.main) {
        setWeatherData({
          city: data.name,
          country: data.sys.country,
          currentTemp: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          condition: data.weather[0].main,
          description: data.weather[0].description,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          pressure: data.main.pressure,
          icon: data.weather[0].icon,
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      // Fallback mock data if API fails
      setWeatherData({
        city: CITY,
        country: COUNTRY,
        currentTemp: 28,
        feelsLike: 30,
        condition: 'Clear',
        description: 'clear sky',
        humidity: 65,
        windSpeed: 5.2,
        pressure: 1013,
        icon: '01d',
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      setWeatherLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Refresh both system data and weather
    fetchWeatherData();
    
    // Simulate API call for system data
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  useEffect(() => {
    fetchWeatherData();
    
    // Refresh weather every 10 minutes
    const interval = setInterval(fetchWeatherData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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

  const WeatherIcon = ({ icon, size = 40 }) => {
    // Map OpenWeather icons to MaterialIcons
    const iconMap = {
      '01d': 'wb-sunny',       // clear sky day
      '01n': 'nights-stay',    // clear sky night
      '02d': 'partly-cloudy-day',
      '02n': 'partly-cloudy-night',
      '03d': 'cloud',
      '03n': 'cloud',
      '04d': 'cloud-queue',
      '04n': 'cloud-queue',
      '09d': 'umbrella',
      '09n': 'umbrella',
      '10d': 'rainy',
      '10n': 'rainy',
      '11d': 'flash-on',
      '11n': 'flash-on',
      '13d': 'ac-unit',
      '13n': 'ac-unit',
      '50d': 'foggy',
      '50n': 'foggy',
    };
    
    return <Icon name={iconMap[icon] || 'wb-sunny'} size={size} color="#FFA726" />;
  };

  const getWeatherAdvice = (weather) => {
    if (!weather) return '';
    
    const condition = weather.condition.toLowerCase();
    const temp = weather.currentTemp;
    
    if (condition.includes('rain')) {
      return 'Rain detected - Good for tank refill';
    } else if (condition.includes('clear') && temp > 30) {
      return 'Hot day - Increase water usage monitoring';
    } else if (condition.includes('cloud')) {
      return 'Cloudy - Moderate evaporation expected';
    } else {
      return 'Normal weather conditions';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Weather Forecast Card */}
      <View style={styles.card}>
        <View style={styles.weatherHeader}>
          <View style={styles.locationContainer}>
            <Icon name="location-on" size={20} color={theme.colors.primary} />
            <Text style={styles.locationText}>
              {CITY}, {COUNTRY}
            </Text>
          </View>
          <TouchableOpacity onPress={fetchWeatherData}>
            <Icon name="refresh" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        {weatherLoading ? (
          <View style={styles.weatherLoading}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading weather data...</Text>
          </View>
        ) : weatherData ? (
          <>
            <View style={styles.currentWeather}>
              <View style={styles.temperatureContainer}>
                <Text style={styles.temperature}>
                  {weatherData.currentTemp}°
                </Text>
                <Text style={styles.temperatureUnit}>C</Text>
              </View>
              <View style={styles.weatherConditionContainer}>
                <WeatherIcon icon={weatherData.icon} />
                <Text style={styles.weatherCondition}>
                  {weatherData.condition}
                </Text>
                <Text style={styles.weatherDescription}>
                  {weatherData.description}
                </Text>
              </View>
            </View>
            
            <View style={styles.weatherDetails}>
              <View style={styles.weatherDetailRow}>
                <View style={styles.weatherDetailItem}>
                  <Icon name="water-drop" size={18} color={theme.colors.info} />
                  <Text style={styles.weatherDetailValue}>{weatherData.humidity}%</Text>
                  <Text style={styles.weatherDetailLabel}>Humidity</Text>
                </View>
                
                <View style={styles.weatherDetailItem}>
                  <Icon name="air" size={18} color={theme.colors.info} />
                  <Text style={styles.weatherDetailValue}>{weatherData.windSpeed} m/s</Text>
                  <Text style={styles.weatherDetailLabel}>Wind</Text>
                </View>
                
                <View style={styles.weatherDetailItem}>
                  <Icon name="speed" size={18} color={theme.colors.info} />
                  <Text style={styles.weatherDetailValue}>{weatherData.pressure} hPa</Text>
                  <Text style={styles.weatherDetailLabel}>Pressure</Text>
                </View>
              </View>
              
              <View style={styles.feelsLikeContainer}>
                <Text style={styles.feelsLikeText}>
                  Feels like {weatherData.feelsLike}°C
                </Text>
              </View>
              
              <View style={styles.weatherAdvice}>
                <Icon name="lightbulb" size={16} color={theme.colors.warning} />
                <Text style={styles.weatherAdviceText}>
                  {getWeatherAdvice(weatherData)}
                </Text>
              </View>
            </View>
            
            <View style={styles.weatherFooter}>
              <Text style={styles.weatherUpdated}>
                Updated: {weatherData.updatedAt}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.noWeatherData}>
            <Icon name="error-outline" size={40} color={theme.colors.textSecondary} />
            <Text style={styles.noWeatherText}>Weather data unavailable</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchWeatherData}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

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
        activeOpacity={0.7}
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
  
  // Weather Styles
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    ...theme.typography.h3,
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  weatherLoading: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  currentWeather: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  temperature: {
    ...theme.typography.h1,
    fontSize: 48,
    color: theme.colors.text,
  },
  temperatureUnit: {
    ...theme.typography.h3,
    fontSize: 20,
    color: theme.colors.textSecondary,
    marginTop: 6,
  },
  weatherConditionContainer: {
    alignItems: 'center',
  },
  weatherCondition: {
    ...theme.typography.h3,
    fontSize: 16,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  weatherDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 12,
    textTransform: 'capitalize',
  },
  weatherDetails: {
    marginBottom: theme.spacing.md,
  },
  weatherDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  weatherDetailItem: {
    alignItems: 'center',
    flex: 1,
  },
  weatherDetailValue: {
    ...theme.typography.h3,
    fontSize: 16,
    color: theme.colors.text,
    marginTop: 4,
  },
  weatherDetailLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  feelsLikeContainer: {
    backgroundColor: '#f0f7ff',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  feelsLikeText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    textAlign: 'center',
    fontSize: 14,
  },
  weatherAdvice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8e6',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  weatherAdviceText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    fontSize: 13,
    flex: 1,
  },
  weatherFooter: {
    marginTop: theme.spacing.md,
  },
  weatherUpdated: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  noWeatherData: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  noWeatherText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  
  // Existing styles for other components
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