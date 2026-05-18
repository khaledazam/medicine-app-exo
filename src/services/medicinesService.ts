import api, { AppApiError } from './api';

export interface Medicine {
    _id: string;
    name: string;
    dosage: string;
    schedule: string[];
    notes?: string;
    quantity: number;
    refillAlertAt: number;
    prescriptionImage?: string;
    history?: Array<{
        date: string;
        time: string;
        taken: boolean;
        timestamp?: string;
    }>;
    user?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateMedicineData {
    name: string;
    dosage: string;
    schedule: string[];
    notes?: string;
    quantity?: number;
    refillAlertAt?: number;
}

export const medicinesService = {
    getAllMedicines: async (): Promise<Medicine[]> => {
        try {
            const response = await api.get<Medicine[]>('/medicines');
            return response.data;
        } catch (error) {
            throw error instanceof AppApiError ? error : new AppApiError('Failed to fetch medicines');
        }
    },

    getMedicineById: async (id: string): Promise<Medicine> => {
        try {
            const response = await api.get<Medicine>(`/medicines/${id}`);
            return response.data;
        } catch (error) {
            throw error instanceof AppApiError ? error : new AppApiError('Failed to fetch medicine');
        }
    },

    createMedicine: async (data: CreateMedicineData): Promise<Medicine> => {
        try {
            const response = await api.post<{ medicine: Medicine }>('/medicines/create', data);
            return response.data.medicine;
        } catch (error) {
            throw error instanceof AppApiError ? error : new AppApiError('Failed to create medicine');
        }
    },

    updateMedicine: async (id: string, data: Partial<CreateMedicineData>): Promise<Medicine> => {
        try {
            const response = await api.put<{ medicine: Medicine }>(`/medicines/edit/${id}`, data);
            return response.data.medicine;
        } catch (error) {
            throw error instanceof AppApiError ? error : new AppApiError('Failed to update medicine');
        }
    },

    deleteMedicine: async (id: string): Promise<void> => {
        try {
            await api.delete(`/medicines/delete/${id}`);
        } catch (error) {
            throw error instanceof AppApiError ? error : new AppApiError('Failed to delete medicine');
        }
    },

    markDoseTaken: async (medicineId: string, time: string): Promise<any> => {
        try {
            const response = await api.post(`/medicines/mark-taken/${medicineId}`, { time });
            return response.data;
        } catch (error) {
            throw error instanceof AppApiError ? error : new AppApiError('Failed to mark dose');
        }
    },

    getMissedDoses: async (): Promise<any[]> => {
        try {
            const response = await api.get('/medicines/missed-doses');
            return response.data;
        } catch (error) {
            throw error instanceof AppApiError ? error : new AppApiError('Failed to fetch missed doses');
        }
    },

    getRefillAlerts: async (): Promise<any[]> => {
        try {
            const response = await api.get('/medicines/refill-alerts');
            return response.data;
        } catch (error) {
            throw error instanceof AppApiError ? error : new AppApiError('Failed to fetch refill alerts');
        }
    },

    getDailySummary: async (): Promise<any> => {
        try {
            const response = await api.get('/medicines/daily-summary');
            return response.data;
        } catch (error) {
            throw error instanceof AppApiError ? error : new AppApiError('Failed to fetch daily summary');
        }
    },

    getCalendarSchedule: async (): Promise<any> => {
        try {
            const response = await api.get('/medicines/calendar');
            return response.data;
        } catch (error) {
            throw error instanceof AppApiError ? error : new AppApiError('Failed to fetch calendar');
        }
    },

    uploadPrescription: async (medicineId: string, imageUri: string): Promise<Medicine> => {
        try {
            const formData = new FormData();
            formData.append('prescription', {
                uri: imageUri,
                type: 'image/jpeg',
                name: `prescription-${medicineId}.jpg`,
            } as any);

            const response = await api.post<{ medicine: Medicine }>(
                `/medicines/upload-prescription/${medicineId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data.medicine;
        } catch (error) {
            throw error instanceof AppApiError ? error : new AppApiError('Failed to upload prescription');
        }
    },
};
