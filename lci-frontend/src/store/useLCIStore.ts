import { create } from 'zustand';
import axios from 'axios';

interface UserPreferences {
  monthlyIncome: number;
  targetSavings: number;
  workplace: string;
  currentLiving: string;
}

export interface SimulationResult {
  regionName: string;
  estimatedSavings: number;
  timeGap: number;
  savingsGap: number;
  realHousingCost: number;
  livingCost: number;
  opportunityCost: number;
  safetyScore: number;
  lat: number;
  lng: number;
  description?: string;
}

interface LCIStore {
  preferences: UserPreferences;
  results: SimulationResult[];
  allRegions: any[]; // Changed: Added to store all regions for initial map load
  setPreference: (key: keyof UserPreferences, value: any) => void;
  runSimulation: () => Promise<void>;
  fetchAllRegions: () => Promise<void>; // Added: Fetch all regions
}

export const useLCIStore = create<LCIStore>((set, get) => ({
  preferences: {
    monthlyIncome: 3000000,
    targetSavings: 1500000,
    workplace: "강남역",
    currentLiving: "신림동",
  },
  results: [],
  allRegions: [],
  setPreference: (key, value) =>
    set((state) => ({
      preferences: { ...state.preferences, [key]: value }
    })),
  runSimulation: async () => {
    const { preferences } = get();
    try {
      const response = await axios.post('http://localhost:9090/api/simulation/run', preferences);
      set({ results: response.data });
    } catch (error) {
      console.error("Simulation failed:", error);
      alert("백엔드 시뮬레이션 엔진에 연결할 수 없습니다. 서비스 상태를 확인해주세요.");
    }
  },
  fetchAllRegions: async () => {
    try {
      const response = await axios.get('http://localhost:9090/api/simulation/regions');
      set({ allRegions: response.data });
    } catch (error) {
      console.error("Failed to fetch regions:", error);
    }
  }
}));
