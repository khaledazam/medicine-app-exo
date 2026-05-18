import React, { createContext, useState, useCallback, useContext } from 'react';
import { reminderService, Reminder, CreateReminderData } from '../services/reminderService';

export interface ReminderContextType {
  reminders: Reminder[];
  loading: boolean;
  error: string | null;
  fetchReminders: () => Promise<void>;
  addReminder: (data: CreateReminderData) => Promise<Reminder>;
  updateReminder: (id: string, data: Partial<CreateReminderData>) => Promise<Reminder>;
  deleteReminder: (id: string) => Promise<void>;
  toggleDone: (id: string, isDone: boolean) => Promise<void>;
}

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

export const ReminderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reminderService.getAllReminders();
      setReminders(data);
    } catch (err: any) {
      console.error('Error fetching reminders:', err);
      setError(err.message || 'Failed to fetch reminders');
    } finally {
      setLoading(false);
    }
  }, []);

  const addReminder = useCallback(async (data: CreateReminderData): Promise<Reminder> => {
    try {
      const newReminder = await reminderService.createReminder(data);
      setReminders(prev => [...prev, newReminder]);
      return newReminder;
    } catch (err: any) {
      console.error('Error adding reminder:', err);
      throw err;
    }
  }, []);

  const updateReminder = useCallback(async (id: string, data: Partial<CreateReminderData>): Promise<Reminder> => {
    try {
      const updated = await reminderService.updateReminder(id, data);
      setReminders(prev => prev.map(r => r._id === id ? updated : r));
      return updated;
    } catch (err: any) {
      console.error('Error updating reminder:', err);
      throw err;
    }
  }, []);

  const deleteReminder = useCallback(async (id: string): Promise<void> => {
    try {
      await reminderService.deleteReminder(id);
      setReminders(prev => prev.filter(r => r._id !== id));
    } catch (err: any) {
      console.error('Error deleting reminder:', err);
      throw err;
    }
  }, []);

  const toggleDone = useCallback(async (id: string, isDone: boolean): Promise<void> => {
    try {
      const updated = await reminderService.toggleDone(id, isDone);
      setReminders(prev => prev.map(r => r._id === id ? updated : r));
    } catch (err: any) {
      console.error('Error toggling reminder:', err);
      throw err;
    }
  }, []);

  return (
    <ReminderContext.Provider
      value={{
        reminders,
        loading,
        error,
        fetchReminders,
        addReminder,
        updateReminder,
        deleteReminder,
        toggleDone,
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
};

export const useReminders = () => {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error('useReminders must be used within ReminderProvider');
  }
  return context;
};
