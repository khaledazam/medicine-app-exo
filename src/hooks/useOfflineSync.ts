import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Medicine } from '../services/medicinesService';

const CACHE_KEY_MEDICINES = '@cache_medicines';
const CACHE_KEY_PENDING_ACTIONS = '@cache_pending_actions';
const CACHE_KEY_TIMESTAMP = '@cache_timestamp';

interface PendingAction {
  id: string;
  type: 'markDose' | 'addMedicine' | 'updateMedicine' | 'deleteMedicine';
  data: any;
  timestamp: number;
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? true);
    });

    // Check initial state
    NetInfo.fetch().then((state) => {
      setIsOnline(state.isConnected ?? true);
    });

    loadPendingCount();

    return () => unsubscribe();
  }, []);

  const loadPendingCount = async () => {
    try {
      const pending = await AsyncStorage.getItem(CACHE_KEY_PENDING_ACTIONS);
      if (pending) {
        const actions: PendingAction[] = JSON.parse(pending);
        setPendingCount(actions.length);
      }
    } catch (error) {
      console.error('Error loading pending count:', error);
    }
  };

  const cacheMedicines = useCallback(async (medicines: Medicine[]) => {
    try {
      await AsyncStorage.setItem(CACHE_KEY_MEDICINES, JSON.stringify(medicines));
      await AsyncStorage.setItem(CACHE_KEY_TIMESTAMP, Date.now().toString());
    } catch (error) {
      console.error('Error caching medicines:', error);
    }
  }, []);

  const getCachedMedicines = useCallback(async (): Promise<Medicine[] | null> => {
    try {
      const data = await AsyncStorage.getItem(CACHE_KEY_MEDICINES);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Error getting cached medicines:', error);
      return null;
    }
  }, []);

  const getCacheAge = useCallback(async (): Promise<number> => {
    try {
      const timestamp = await AsyncStorage.getItem(CACHE_KEY_TIMESTAMP);
      if (timestamp) {
        return Date.now() - parseInt(timestamp);
      }
      return Infinity;
    } catch (error) {
      return Infinity;
    }
  }, []);

  const addPendingAction = useCallback(async (action: Omit<PendingAction, 'id' | 'timestamp'>) => {
    try {
      const pending = await AsyncStorage.getItem(CACHE_KEY_PENDING_ACTIONS);
      const actions: PendingAction[] = pending ? JSON.parse(pending) : [];

      actions.push({
        ...action,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      });

      await AsyncStorage.setItem(CACHE_KEY_PENDING_ACTIONS, JSON.stringify(actions));
      setPendingCount(actions.length);
    } catch (error) {
      console.error('Error adding pending action:', error);
    }
  }, []);

  const getPendingActions = useCallback(async (): Promise<PendingAction[]> => {
    try {
      const pending = await AsyncStorage.getItem(CACHE_KEY_PENDING_ACTIONS);
      return pending ? JSON.parse(pending) : [];
    } catch (error) {
      console.error('Error getting pending actions:', error);
      return [];
    }
  }, []);

  const clearPendingActions = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(CACHE_KEY_PENDING_ACTIONS);
      setPendingCount(0);
    } catch (error) {
      console.error('Error clearing pending actions:', error);
    }
  }, []);

  const clearCache = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        CACHE_KEY_MEDICINES,
        CACHE_KEY_PENDING_ACTIONS,
        CACHE_KEY_TIMESTAMP,
      ]);
      setPendingCount(0);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, []);

  return {
    isOnline,
    pendingCount,
    cacheMedicines,
    getCachedMedicines,
    getCacheAge,
    addPendingAction,
    getPendingActions,
    clearPendingActions,
    clearCache,
  };
}
