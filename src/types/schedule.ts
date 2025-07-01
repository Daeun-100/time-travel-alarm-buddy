
export interface Schedule {
  id: string;
  destination: string;
  arrivalTime: string; // HH:MM format
  transportType: 'subway' | 'bus' | 'walk' | 'bicycle' | 'car';
  preparationTime: number; // minutes
  departureTime: string; // calculated HH:MM format
  preparationStartTime: string; // calculated HH:MM format
  createdAt: Date;
}

export interface TrafficData {
  from: string;
  to: string;
  transportType: 'subway' | 'bus' | 'walk' | 'bicycle' | 'car';
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night';
  duration: number; // minutes
  isDelayed: boolean;
}

export type TransportType = 'subway' | 'bus' | 'walk' | 'bicycle' | 'car';
