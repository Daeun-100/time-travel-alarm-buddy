export interface Schedule {
  id: string;
  origin: string; // 출발지
  destination: string; // 도착지
  arrivalTime: string; // HH:MM format
  transportType: 'subway' | 'bus' | 'walk' | 'bicycle' | 'car';
  preparationTime: number; // minutes
  departureTime: string; // calculated HH:MM format
  preparationStartTime: string; // calculated HH:MM format
  weekdays?: Weekday[]; // 요일 배열 (선택사항)
  selectedDates?: Date[]; // 선택된 날짜들 (선택사항)
  createdAt: Date;
  isActive?: boolean; // 알람 활성화 상태
  advanceAlarm?: {
    enabled: boolean;
    minutes: number; // 몇 분 전에 알림할지
  };
  preparationAdvanceAlarm?: {
    enabled: boolean;
    minutes: number; // 준비 시작 몇 분 전에 알림할지
  };
  memo?: string; // 일정에 대한 메모
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

export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: '월',
  tuesday: '화',
  wednesday: '수',
  thursday: '목',
  friday: '금',
  saturday: '토',
  sunday: '일'
};

export interface AlarmInfo {
  scheduleId: string;
  destination: string;
  departureTime: string;
  preparationStartTime: string;
  type: 'departure' | 'preparation' | 'advance' | 'preparation-advance';
  advanceMinutes?: number;
}
