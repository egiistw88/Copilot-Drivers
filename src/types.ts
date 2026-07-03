export type ViewState = 'home' | 'radar' | 'work';

export interface FinalReceiptData {
  date: string;
  totalOrders: number;
  grossIncome: number;
  expenses: number;
  netIncome: number;
  orderHistory: { id: string; amount: number; time: string; location: string }[];
}

export interface DriverPosition {
  lat: number;
  lng: number;
  accuracy: number;
  heading: number;
}

export interface DriverConfig {
  vehicleType: string;
  serviceType: string;
  targetIncome: number;
  emergencyNumber?: string;
}

export interface ShiftStats {
  orders: number;
  income: number;
}

export interface OrderHistoryItem {
  id: string;
  amount: number;
  time: string;
  location: string;
}

export interface Recommendation {
  targetLocation: string;
  distanceKm: number;
  etaMins: number;
  actionText: string;
}
