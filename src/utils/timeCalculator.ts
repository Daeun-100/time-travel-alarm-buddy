export function parseTimeString(timeString: string): { hour: number; minute: number } {
  const [hour, minute] = timeString.split(':').map(Number);
  return { hour, minute };
}

export function formatTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

export function addMinutes(timeString: string, minutes: number): string {
  const { hour, minute } = parseTimeString(timeString);
  const totalMinutes = hour * 60 + minute + minutes;
  
  const newHour = Math.floor(totalMinutes / 60) % 24;
  const newMinute = totalMinutes % 60;
  
  return formatTime(newHour, newMinute);
}

export function subtractMinutes(timeString: string, minutes: number): string {
  const { hour, minute } = parseTimeString(timeString);
  let totalMinutes = hour * 60 + minute - minutes;
  
  // Handle negative time (previous day)
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60;
  }
  
  const newHour = Math.floor(totalMinutes / 60) % 24;
  const newMinute = totalMinutes % 60;
  
  return formatTime(newHour, newMinute);
}

export function calculateDepartureTime(
  arrivalTime: string,
  trafficDuration: number,
  preparationTime: number
): { departureTime: string; preparationStartTime: string } {
  console.log(`Calculating times - Arrival: ${arrivalTime}, Traffic: ${trafficDuration}min, Prep: ${preparationTime}min`);
  
  const departureTime = subtractMinutes(arrivalTime, trafficDuration);
  const preparationStartTime = subtractMinutes(departureTime, preparationTime);
  
  console.log(`Results - Departure: ${departureTime}, Prep start: ${preparationStartTime}`);
  
  return { departureTime, preparationStartTime };
}

export function getTrafficTime(
  from: string,
  to: string,
  transportType: 'subway' | 'bus' | 'walk' | 'bicycle' | 'car',
  hour: number
): number {
  // Mock traffic data - in a real app, this would come from an API
  const baseTrafficTimes: Record<string, Record<string, Record<string, number>>> = {
    '잠실 루터회관': {
      '행성대학교': { subway: 50, bus: 65, walk: 120, bicycle: 40, car: 45 },
      '강남역': { subway: 12, bus: 16, walk: 35, bicycle: 15, car: 20 },
      '홍대입구': { subway: 25, bus: 35, walk: 80, bicycle: 30, car: 40 },
      '신촌': { subway: 30, bus: 40, walk: 85, bicycle: 35, car: 45 }
    }
  };

  // Time slot based delays
  const getTimeSlot = (hour: number): 'morning' | 'afternoon' | 'evening' | 'night' => {
    if (hour >= 7 && hour <= 9) return 'morning';
    if (hour >= 10 && hour <= 17) return 'afternoon';
    if (hour >= 18 && hour <= 22) return 'evening';
    return 'night';
  };

  const delayTimes = {
    morning: { subway: 10, bus: 15, walk: 0, bicycle: 5, car: 20 },
    afternoon: { subway: 5, bus: 8, walk: 0, bicycle: 2, car: 10 },
    evening: { subway: 8, bus: 12, walk: 0, bicycle: 3, car: 15 },
    night: { subway: 0, bus: 0, walk: 0, bicycle: 0, car: 0 }
  };

  const timeSlot = getTimeSlot(hour);
  const baseTime = baseTrafficTimes[from]?.[to]?.[transportType] || 30;
  const delay = delayTimes[timeSlot][transportType] || 0;

  console.log(`Traffic time calculation - From: ${from}, To: ${to}, Transport: ${transportType}, Hour: ${hour}, Base: ${baseTime}min, Delay: ${delay}min`);
  
  return baseTime + delay;
}
