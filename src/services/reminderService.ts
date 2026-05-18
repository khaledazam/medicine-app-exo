import api, { AppApiError } from './api';

// Matches backend Reminder model exactly
export interface Reminder {
    _id: string;
    user: string;
    medicine: string; // ObjectId ref to Medicine
    dosage: string;
    times: string[]; // e.g. ["08:00", "14:00", "20:00"]
    repeatType: 'once' | 'daily' | 'weekly' | 'custom';
    daysOfWeek: number[]; // e.g. [0,1,2,3,4]
    note: string;
    isTakenToday: boolean;
    remindBeforeMinutes: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateReminderData {
    medicine: string;
    dosage: string;
    time: string; // backend expects 'time' for compat
    times?: string[];
    repeat?: string;
    isImportant?: boolean;
    note?: string;
    repeatType?: string;
    daysOfWeek?: number[];
    remindBeforeMinutes?: number;
}

export interface ReminderResponse {
    message: string;
    data: Reminder;
}

export interface RemindersListResponse {
    count: number;
    data: Reminder[];
}

export const reminderService = {
    getAllReminders: async (): Promise<Reminder[]> => {
        try {
            const response = await api.get<RemindersListResponse>('/reminders');
            return response.data.data || [];
        } catch (error) {
            throw error instanceof AppApiError ? error : new AppApiError('Failed to fetch reminders');
        }
    },

    createReminder: async (data: CreateReminderData): Promise<Reminder> => {
        try {
            const response = await api.post<ReminderResponse>('/reminders', data);
            return response.data.data;
        } catch (error) {
            throw error instanceof AppApiError ? error : new AppApiError('Failed to create reminder');
        }
    },

    updateReminder: async (id: string, data: Partial<CreateReminderData>): Promise<Reminder> => {
        try {
            const response = await api.put<ReminderResponse>(`/reminders/${id}`, data);
            return response.data.data;
        } catch (error) {
            throw error instanceof AppApiError ? error : new AppApiError('Failed to update reminder');
        }
    },

    deleteReminder: async (id: string): Promise<void> => {
        try {
            await api.delete(`/reminders/${id}`);
        } catch (error) {
            throw error instanceof AppApiError ? error : new AppApiError('Failed to delete reminder');
        }
    },

    toggleDone: async (id: string, isDone: boolean): Promise<Reminder> => {
        try {
            const response = await api.put<ReminderResponse>(`/reminders/${id}`, { isTakenToday: isDone });
            return response.data.data;
        } catch (error) {
            throw error instanceof AppApiError ? error : new AppApiError('Failed to toggle reminder');
        }
    },
};
