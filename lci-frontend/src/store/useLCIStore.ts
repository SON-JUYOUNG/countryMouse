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
  // Specific fields from backend are not strictly typed here but are passed through
  [key: string]: any;
}

interface LCIStore {
  preferences: UserPreferences;
  results: SimulationResult[];
  allRegions: any[];
  displayMode: 'rent' | 'jeonse';
  housingType: 'apt' | 'officetel' | 'villa' | 'oneroom' | 'tworoom';

  setPreference: (key: keyof UserPreferences, value: any) => void;
  setDisplayMode: (mode: 'rent' | 'jeonse') => void;
  setHousingType: (type: 'apt' | 'officetel' | 'villa' | 'oneroom' | 'tworoom') => void;

  runSimulation: () => Promise<void>;
  fetchAllRegions: () => Promise<void>;
  clearResults: () => void;
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
  displayMode: 'rent',
  housingType: 'apt', // Default to Apartment

  setPreference: (key, value) =>
    set((state) => ({
      preferences: { ...state.preferences, [key]: value }
    })),

  setDisplayMode: (mode) => set({ displayMode: mode }),

  setHousingType: (type) => set({ housingType: type }),

  runSimulation: async () => {
    const { preferences } = get();
    try {
      const response = await axios.post('http://localhost:9090/api/simulation/run', preferences);
      // 포맷팅은 이제 컴포넌트 레벨에서 처리하므로 여기서는 raw data 저장
      // 단, formattedSavings는 시뮬레이션 결과이므로 유지
      const processedResults = response.data.map((res: any) => ({
        ...res,
        formattedSavings: `${(Number(res.estimatedSavings) / 10000).toLocaleString()}만 절약`
      }));
      set({ results: processedResults });
    } catch (error) {
      console.error("Simulation failed:", error);
      alert("백엔드 시뮬레이션 엔진에 연결할 수 없습니다. 서비스 상태를 확인해주세요.");
    }
  },

  fetchAllRegions: async () => {
    try {
      const response = await axios.get('http://localhost:9090/api/simulation/regions');
      // 지역 데이터도 raw data로 저장
      set({ allRegions: response.data });
    } catch (error) {
      console.error("Failed to fetch regions:", error);
    }
  },

  clearResults: () => set({ results: [] })
}));
