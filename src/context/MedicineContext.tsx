import React, { createContext, useState, useCallback, useContext } from 'react';
import { medicinesService, Medicine, CreateMedicineData } from '../services/medicinesService';

export interface MissedDose {
  medicineId: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string;
  date: string;
  message: string;
}

export interface RefillAlert {
  medicineId: string;
  medicineName: string;
  dosage: string;
  currentQuantity: number;
  refillThreshold: number;
  urgency: 'CRITICAL' | 'WARNING';
  message: string;
}

export interface DailySummaryMedicine {
  medicineId: string;
  medicineName: string;
  dosage: string;
  schedule: string[];
  taken: number;
  total: number;
  missed: number;
  adherence: number;
  status: string;
  takenTimes: string[];
}

export interface DailySummary {
  date: string;
  medicines: DailySummaryMedicine[];
  dailyStats: {
    totalDoses: number;
    totalTaken: number;
    totalMissed: number;
    overallAdherence: number;
    status: string;
  };
}

export interface CalendarEntry {
  date: string;
  fullDate: string;
  medicine: string;
  medicineId: string;
  dosage: string;
  scheduledTime: string;
  taken: boolean;
  status: string;
}

export interface MedicineContextType {
  medicines: Medicine[];
  loading: boolean;
  error: string | null;
  missedDoses: MissedDose[];
  missedDosesCount: number;
  refillAlerts: RefillAlert[];
  refillAlertsCount: number;
  dailySummary: DailySummary | null;
  calendarSchedule: CalendarEntry[];
  fetchMedicines: () => Promise<void>;
  addMedicine: (data: CreateMedicineData) => Promise<Medicine>;
  updateMedicine: (id: string, data: Partial<CreateMedicineData>) => Promise<Medicine>;
  deleteMedicine: (id: string) => Promise<void>;
  markDoseTaken: (medicineId: string, time: string) => Promise<any>;
  fetchMissedDoses: () => Promise<void>;
  fetchRefillAlerts: () => Promise<void>;
  fetchDailySummary: () => Promise<void>;
  fetchCalendarSchedule: () => Promise<void>;
  uploadPrescription: (id: string, uri: string) => Promise<Medicine>;
}

const MedicineContext = createContext<MedicineContextType | undefined>(undefined);

export const MedicineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missedDoses, setMissedDoses] = useState<MissedDose[]>([]);
  const [missedDosesCount, setMissedDosesCount] = useState(0);
  const [refillAlerts, setRefillAlerts] = useState<RefillAlert[]>([]);
  const [refillAlertsCount, setRefillAlertsCount] = useState(0);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [calendarSchedule, setCalendarSchedule] = useState<CalendarEntry[]>([]);

  const fetchMedicines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await medicinesService.getAllMedicines();
      setMedicines(data);
    } catch (err: any) {
      console.error('Error fetching medicines:', err);
      setError(err.message || 'Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  }, []);

  const addMedicine = useCallback(async (data: CreateMedicineData): Promise<Medicine> => {
    try {
      const newMedicine = await medicinesService.createMedicine(data);
      setMedicines(prev => [...prev, newMedicine]);
      return newMedicine;
    } catch (err: any) {
      console.error('Error adding medicine:', err);
      throw err;
    }
  }, []);

  const updateMedicine = useCallback(async (id: string, data: Partial<CreateMedicineData>): Promise<Medicine> => {
    try {
      const updated = await medicinesService.updateMedicine(id, data);
      setMedicines(prev => prev.map(m => m._id === id ? updated : m));
      return updated;
    } catch (err: any) {
      console.error('Error updating medicine:', err);
      throw err;
    }
  }, []);

  const deleteMedicine = useCallback(async (id: string): Promise<void> => {
    try {
      await medicinesService.deleteMedicine(id);
      setMedicines(prev => prev.filter(m => m._id !== id));
    } catch (err: any) {
      console.error('Error deleting medicine:', err);
      throw err;
    }
  }, []);

  const markDoseTaken = useCallback(async (medicineId: string, time: string): Promise<any> => {
    try {
      const result = await medicinesService.markDoseTaken(medicineId, time);
      await fetchMedicines();
      return result;
    } catch (err: any) {
      console.error('Error marking dose:', err);
      throw err;
    }
  }, [fetchMedicines]);

  const uploadPrescription = useCallback(async (id: string, uri: string): Promise<Medicine> => {
    try {
      const updated = await medicinesService.uploadPrescription(id, uri);
      await fetchMedicines();
      return updated;
    } catch (err: any) {
      console.error('Error uploading prescription:', err);
      throw err;
    }
  }, [fetchMedicines]);

  const fetchMissedDoses = useCallback(async () => {
    try {
      const data = await medicinesService.getMissedDoses();
      setMissedDoses(data.missedDoses || []);
      setMissedDosesCount(data.totalMissed || 0);
    } catch (err: any) {
      console.error('Error fetching missed doses:', err);
    }
  }, []);

  const fetchRefillAlerts = useCallback(async () => {
    try {
      const data = await medicinesService.getRefillAlerts();
      setRefillAlerts(data.alerts || []);
      setRefillAlertsCount(data.totalAlerts || 0);
    } catch (err: any) {
      console.error('Error fetching refill alerts:', err);
    }
  }, []);

  const fetchDailySummary = useCallback(async () => {
    try {
      const data = await medicinesService.getDailySummary();
      setDailySummary(data);
    } catch (err: any) {
      console.error('Error fetching daily summary:', err);
    }
  }, []);

  const fetchCalendarSchedule = useCallback(async () => {
    try {
      const data = await medicinesService.getCalendarSchedule();
      setCalendarSchedule(data.schedule || []);
    } catch (err: any) {
      console.error('Error fetching calendar:', err);
    }
  }, []);

  return (
    <MedicineContext.Provider
      value={{
        medicines,
        loading,
        error,
        missedDoses,
        missedDosesCount,
        refillAlerts,
        refillAlertsCount,
        dailySummary,
        calendarSchedule,
        fetchMedicines,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        markDoseTaken,
        fetchMissedDoses,
        fetchRefillAlerts,
        fetchDailySummary,
        fetchCalendarSchedule,
        uploadPrescription,
      }}
    >
      {children}
    </MedicineContext.Provider>
  );
};

export const useMedicines = () => {
  const context = useContext(MedicineContext);
  if (!context) {
    throw new Error('useMedicines must be used within MedicineProvider');
  }
  return context;
};
