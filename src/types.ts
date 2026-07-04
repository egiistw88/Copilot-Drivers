export type ViewState = 'home' | 'radar' | 'work';

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

export interface Recommendation {
  targetLocation: string;
  address?: string;
  distanceKm: number;
  etaMins: number;
  actionText: string;
  score?: number;
}
