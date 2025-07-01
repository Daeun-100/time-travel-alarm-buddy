
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
