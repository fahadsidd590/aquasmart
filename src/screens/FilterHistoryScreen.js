import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { apiRequest } from '../config/api';
import { getToken } from '../services/authStorage';

function formatWhen(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return String(iso);
  }
}

export default function FilterHistoryScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    const token = await getToken();
    if (!token) {
      setError('Not signed in.');
      setItems([]);
      return;
    }
    const data = await apiRequest('/api/me/filter-history?page=1&pageSize=100', {
      token,
    });
    setItems(Array.isArray(data) ? data : []);
  };

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        try {
          await load();
        } catch (e) {
          if (!cancelled) setError(e.message || 'Could not load history.');
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } catch (e) {
      setError(e.message || 'Could not load history.');
    } finally {
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Icon name="history" size={22} color={theme.colors.primary} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.action}>{item.action}</Text>
        <Text style={styles.meta}>Filter ID: {item.filterId}</Text>
        <Text style={styles.when}>{formatWhen(item.atUtc)}</Text>
        {item.details ? (
          <Text style={styles.details} numberOfLines={4}>
            {item.details}
          </Text>
        ) : null}
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{error}</Text>
        </View>
      ) : null}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id || `${item.filterId}-${item.atUtc}`}
        renderItem={renderItem}
        contentContainerStyle={items.length === 0 ? styles.emptyList : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
        ListEmptyComponent={
          !error ? (
            <Text style={styles.emptyText}>No filter changes recorded yet.</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  list: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  banner: {
    backgroundColor: '#fdecea',
    padding: theme.spacing.md,
  },
  bannerText: {
    color: '#c62828',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  rowIcon: {
    marginRight: theme.spacing.md,
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  rowBody: {
    flex: 1,
  },
  action: {
    ...theme.typography.h3,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 4,
  },
  meta: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  when: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    marginBottom: 6,
  },
  details: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
  },
});
