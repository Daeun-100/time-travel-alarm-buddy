import { useState, useCallback } from 'react';
import { Schedule, TransportType, Weekday } from '@/types/schedule';
import { getTrafficTime, parseTimeString, calculateDepartureTime } from '@/utils/timeCalculator';

export function useSchedule() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const addSchedule = useCallback((
    destination: string,
    arrivalTime: string,
    transportType: TransportType,
    preparationTime: number,
    weekdays?: Weekday[],
    selectedDates?: Date[]
  ) => {
    console.log('Adding new schedule:', { destination, arrivalTime, transportType, preparationTime, weekdays, selectedDates });
    
    const { hour } = parseTimeString(arrivalTime);
    const trafficDuration = getTrafficTime('잠실 루터회관', destination, transportType, hour);
    const { departureTime, preparationStartTime } = calculateDepartureTime(
      arrivalTime,
      trafficDuration,
      preparationTime
    );

    const newSchedule: Schedule = {
      id: Date.now().toString(),
      destination,
      arrivalTime,
      transportType,
      preparationTime,
      departureTime,
      preparationStartTime,
      weekdays,
      selectedDates,
      isActive: true,
      createdAt: new Date()
    };

    console.log('Created schedule:', newSchedule);
    setSchedules(prev => [...prev, newSchedule]);
    return newSchedule;
  }, []);

  const deleteSchedule = useCallback((id: string) => {
    setSchedules(prev => prev.filter(schedule => schedule.id !== id));
  }, []);

  const updateSchedule = useCallback((
    id: string,
    destination: string,
    arrivalTime: string,
    transportType: TransportType,
    preparationTime: number,
    weekdays?: Weekday[],
    selectedDates?: Date[]
  ) => {
    const { hour } = parseTimeString(arrivalTime);
    const trafficDuration = getTrafficTime('잠실 루터회관', destination, transportType, hour);
    const { departureTime, preparationStartTime } = calculateDepartureTime(
      arrivalTime,
      trafficDuration,
      preparationTime
    );

    setSchedules(prev => prev.map(schedule => 
      schedule.id === id 
        ? {
            ...schedule,
            destination,
            arrivalTime,
            transportType,
            preparationTime,
            departureTime,
            preparationStartTime,
            weekdays,
            selectedDates
          }
        : schedule
    ));
  }, []);

  const toggleScheduleActive = useCallback((id: string) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.id === id 
        ? { ...schedule, isActive: !schedule.isActive }
        : schedule
    ));
  }, []);

  return {
    schedules,
    addSchedule,
    deleteSchedule,
    updateSchedule,
    toggleScheduleActive
  };
}
