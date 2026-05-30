import { create } from 'zustand';
import { Alert, TrainSet } from './types';
import { INITIAL_ALERTS, INITIAL_TRAIN_SETS } from './data';

interface SystemStore {
  alerts: Alert[];
  trains: TrainSet[];
  liveToast: { message: string; severity: string } | null;
  
  resolveAlert: (id: string) => void;
  simulateFault: (severity: 'critical' | 'high' | 'warning', message: string, stationCode: string) => void;
  triggerToast: (message: string, severity: string) => void;
  clearToast: () => void;
}

export const useSystemStore = create<SystemStore>((set) => ({
  alerts: INITIAL_ALERTS,
  trains: INITIAL_TRAIN_SETS,
  liveToast: null,

  resolveAlert: (id) => set((state) => {
    const updatedAlerts = state.alerts.map((a) =>
      a.id === id ? { ...a, resolved_at: new Date().toISOString() } : a
    );
    const resolvedAlert = state.alerts.find(a => a.id === id);
    const message = resolvedAlert 
      ? `ALERT CLEARANCE SYNCED: Resolved status published for ${resolvedAlert.train_number || 'Train'} at ${resolvedAlert.station_name || 'Station'}.`
      : 'ALERT CLEARANCE SYNCED: Resolved status published via Supabase Realtime.';
    
    // Auto-schedule toast clearance
    setTimeout(() => {
      set((s) => {
        if (s.liveToast?.message === message) {
          return { liveToast: null };
        }
        return {};
      });
    }, 4500);

    return {
      alerts: updatedAlerts,
      liveToast: {
        message,
        severity: 'info'
      }
    };
  }),

  simulateFault: (severity, message, stationCode) => set((state) => {
    const targetStationName =
      stationCode === 'HLM' ? 'Halim Station' :
      stationCode === 'KWG' ? 'Karawang Station' :
      stationCode === 'PDL' ? 'Padalarang Station' :
      stationCode === 'TGL' ? 'Tegalluar Station' : 'Global Depot';
      
    const operationalTrains = state.trains.filter((t) => t.status === 'operational');
    const targetTrain =
      operationalTrains.length > 0
        ? operationalTrains[Math.floor(Math.random() * operationalTrains.length)]
        : state.trains[0];

    const newAlert: Alert = {
      id: `al-${Date.now()}`,
      station_id: stationCode === 'HLM' ? 'st-hlm-011e-4cb8-9999' :
                  stationCode === 'KWG' ? 'st-kwg-022e-4cb8-9999' :
                  stationCode === 'PDL' ? 'st-pdl-033e-4cb8-9999' :
                  'st-tgl-044e-4cb8-9999',
      station_name: targetStationName,
      train_set_id: targetTrain.id,
      train_number: targetTrain.train_number,
      severity,
      message,
      resolved_at: null,
      created_at: new Date().toISOString(),
    };

    const updatedTrains = state.trains.map((t) =>
      t.id === targetTrain.id && severity === 'critical'
        ? { ...t, status: 'maintenance' as const }
        : t
    );

    const toastMessage = `REALTIME ALERT DETECTED: [${severity.toUpperCase()}] at ${stationCode} on ${targetTrain.train_number}.`;

    // Auto-schedule toast clearance
    setTimeout(() => {
      set((s) => {
        if (s.liveToast?.message === toastMessage) {
          return { liveToast: null };
        }
        return {};
      });
    }, 4500);

    return {
      alerts: [newAlert, ...state.alerts],
      trains: updatedTrains,
      liveToast: {
        message: toastMessage,
        severity
      }
    };
  }),

  triggerToast: (message, severity) => {
    set({ liveToast: { message, severity } });
    setTimeout(() => {
      set((state) => {
        if (state.liveToast?.message === message) {
          return { liveToast: null };
        }
        return {};
      });
    }, 4500);
  },

  clearToast: () => set({ liveToast: null }),
}));
