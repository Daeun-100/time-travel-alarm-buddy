
import { TrafficData, TransportType } from '@/types/schedule';

// 기본 교통 시간 데이터 (분)
const TRAFFIC_TIMES: Record<string, Record<string, Record<TransportType, number>>> = {
  '잠실 루터회관': {
    '행성대학교': { subway: 50, bus: 65, walk: 180, bicycle: 35, car: 40 },
    '강남역': { subway: 12, bus: 16, walk: 45, bicycle: 20, car: 15 },
    '홍대입구': { subway: 35, bus: 55, walk: 120, bicycle: 40, car: 30 },
    '신촌': { subway: 30, bus: 45, walk: 100, bicycle: 35, car: 25 }
  }
};

// 시간대별 지연 시간 (분)
const DELAY_TIMES = {
  morning: { subway: 10, bus: 15, walk: 0, bicycle: 5, car: 20 },
  afternoon: { subway: 5, bus: 8, walk: 0, bicycle: 2, car: 10 },
  evening: { subway: 8, bus: 12, walk: 0, bicycle: 3, car: 15 },
  night: { subway: 0, bus: 0, walk: 0, bicycle: 0, car: 0 }
};

export function getTimeSlot(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

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
