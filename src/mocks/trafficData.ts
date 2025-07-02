import { TrafficData, TransportType } from '@/types/schedule';

// 기본 교통 시간 데이터 (분)
export const TRAFFIC_TIMES: Record<string, Record<string, Record<TransportType, number>>> = {
  '잠실 루터회관': {
    '행성대학교': { subway: 50, bus: 65, walk: 180, bicycle: 35, car: 40 },
    '강남역': { subway: 12, bus: 16, walk: 45, bicycle: 20, car: 15 },
    '홍대입구': { subway: 35, bus: 55, walk: 120, bicycle: 40, car: 30 },
    '신촌': { subway: 30, bus: 45, walk: 100, bicycle: 35, car: 25 }
  }
};

// 시간대별 지연 시간 (분)
export const DELAY_TIMES = {
  morning: { subway: 10, bus: 15, walk: 0, bicycle: 5, car: 20 },
  afternoon: { subway: 5, bus: 8, walk: 0, bicycle: 2, car: 10 },
  evening: { subway: 8, bus: 12, walk: 0, bicycle: 3, car: 15 },
  night: { subway: 0, bus: 0, walk: 0, bicycle: 0, car: 0 }
};

// 시간대 분류 함수
export function getTimeSlot(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

// 교통 시간 계산 함수
export function getTrafficTime(
  from: string = '잠실 루터회관',
  to: string,
  transportType: TransportType,
  arrivalHour: number
): number {
  console.log(`Calculating traffic time: ${from} → ${to} via ${transportType} at ${arrivalHour}:00`);
  
  const baseTime = TRAFFIC_TIMES[from]?.[to]?.[transportType] || 30; // 기본값 30분
  const timeSlot = getTimeSlot(arrivalHour);
  const delayTime = DELAY_TIMES[timeSlot][transportType] || 0;
  
  const totalTime = baseTime + delayTime;
  console.log(`Base time: ${baseTime}min, Delay: ${delayTime}min, Total: ${totalTime}min`);
  
  return totalTime;
}

// Mock 교통 데이터 반환 함수
export function getMockTrafficData(
  to: string,
  transportType: TransportType,
  arrivalHour: number
): TrafficData {
  const from = '잠실 루터회관';
  const timeSlot = getTimeSlot(arrivalHour);
  const duration = getTrafficTime(from, to, transportType, arrivalHour);
  
  return {
    from,
    to,
    transportType,
    timeSlot,
    duration,
    isDelayed: timeSlot === 'morning' || timeSlot === 'evening'
  };
}

// 교통수단별 라벨
export const TRANSPORT_LABELS: Record<TransportType, string> = {
  subway: '지하철',
  bus: '버스',
  car: '자동차',
  bicycle: '자전거',
  walk: '도보'
};

// 인기 출발지 목록
export const POPULAR_ORIGINS = [
  '잠실 루터회관',
  '잠실역',
  '강남역',
  '홍대입구'
];

// 인기 도착지 목록
export const POPULAR_DESTINATIONS = [
  '행성대학교',
  '강남역',
  '홍대입구',
  '신촌'
];

// 교통수단별 아이콘 매핑 (Lucide 아이콘 이름)
export const TRANSPORT_ICONS: Record<TransportType, string> = {
  subway: 'Train',
  bus: 'Bus',
  car: 'Car',
  bicycle: 'Bike',
  walk: 'MapPin'
};

// 시간대별 지연 정보 (TrafficDetailBox용)
export const TIME_SLOT_LABELS = {
  morning: '아침 러시아워',
  afternoon: '일반 시간대',
  evening: '저녁 러시아워',
  night: '심야 시간대'
};

// 시간대별 지연 상세 정보
export const DELAY_INFO = {
  '아침 러시아워': {
    subway: { delay: 10, reason: '출근 시간 혼잡' },
    bus: { delay: 15, reason: '교통 정체' },
    car: { delay: 20, reason: '도로 정체' },
    bicycle: { delay: 5, reason: '자전거도로 혼잡' },
    walk: { delay: 0, reason: '영향 없음' }
  },
  '일반 시간대': {
    subway: { delay: 5, reason: '일반 지연' },
    bus: { delay: 8, reason: '일반 정체' },
    car: { delay: 10, reason: '일반 정체' },
    bicycle: { delay: 2, reason: '일반 혼잡' },
    walk: { delay: 0, reason: '영향 없음' }
  },
  '저녁 러시아워': {
    subway: { delay: 8, reason: '퇴근 시간 혼잡' },
    bus: { delay: 12, reason: '교통 정체' },
    car: { delay: 15, reason: '도로 정체' },
    bicycle: { delay: 3, reason: '자전거도로 혼잡' },
    walk: { delay: 0, reason: '영향 없음' }
  },
  '심야 시간대': {
    subway: { delay: 0, reason: '원활한 교통' },
    bus: { delay: 0, reason: '원활한 교통' },
    car: { delay: 0, reason: '원활한 교통' },
    bicycle: { delay: 0, reason: '원활한 교통' },
    walk: { delay: 0, reason: '영향 없음' }
  }
}; 