import { create } from 'zustand';
import { Incident } from './types';
import { INITIAL_INCIDENTS, INCIDENT_CATEGORIES } from './incident_data';

interface FilterState {
  textSearch: string;
  stasiun: string;
  prioritas: string;
  status: string;
  kategori_aset: string;
  tanggalLaporFrom: string;
  tanggalLaporTo: string;
  bulan: string;
}

interface IncidentStore {
  // Incidents data state
  incidents: Incident[];
  setIncidents: (incidents: Incident[]) => void;
  addIncident: (incident: Incident) => void;

  // Category state
  categories: string[];
  addCategory: (category: string) => void;

  // Filter state
  filters: FilterState;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;

  // Drawer / Modal states
  activeIncidentId: string | null;
  isDrawerOpen: boolean;
  isCreateModalOpen: boolean;
  
  openDrawer: (id: string) => void;
  closeDrawer: () => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;

  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  rowsPerPage: number;
}

const initialFilters: FilterState = {
  textSearch: '',
  stasiun: '',
  prioritas: '',
  status: '',
  kategori_aset: '',
  tanggalLaporFrom: '',
  tanggalLaporTo: '',
  bulan: '',
};

export const useIncidentStore = create<IncidentStore>((set) => ({
  // Seed with mock data from server configuration
  incidents: INITIAL_INCIDENTS,
  setIncidents: (incidents) => set({ incidents }),
  addIncident: (incident) => set((state) => ({ 
    incidents: [incident, ...state.incidents],
    // Reset page to 1 on new ticketing insertion
    currentPage: 1 
  })),

  // Categories
  categories: INCIDENT_CATEGORIES,
  addCategory: (category) => set((state) => {
    const trimmed = category.trim();
    if (!trimmed || state.categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      return state;
    }
    return { categories: [...state.categories, trimmed] };
  }),

  // Filters
  filters: initialFilters,
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value },
    currentPage: 1 // Reset page on filter alteration
  })),
  resetFilters: () => set({ filters: initialFilters, currentPage: 1 }),

  // Drawer / Modals
  activeIncidentId: null,
  isDrawerOpen: false,
  isCreateModalOpen: false,

  openDrawer: (id) => set({ activeIncidentId: id, isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false, activeIncidentId: null }),
  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),

  // Pagination defaults
  currentPage: 1,
  setCurrentPage: (page) => set({ currentPage: page }),
  rowsPerPage: 20,
}));
