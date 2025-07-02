import { useState, useCallback } from 'react';
import { Schedule, TransportType, Weekday } from '@/types/schedule';
import { getTrafficTime, parseTimeString, calculateDepartureTime } from '@/utils/timeCalculator';

export function useSchedule() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const addSchedule = useCallback((
    origin: string,
    destination: string,
    arrivalTime: string,
    transportType: TransportType,
    preparationTime: number,
    weekdays?: Weekday[],
    selectedDates?: Date[],
    advanceAlarm?: { enabled: boolean; minutes: number },
    preparationAdvanceAlarm?: { enabled: boolean; minutes: number },
    memo?: string
  ) => {
    console.log('Adding new schedule:', { origin, destination, arrivalTime, transportType, preparationTime, weekdays, selectedDates, advanceAlarm, preparationAdvanceAlarm, memo });
    
    const { hour } = parseTimeString(arrivalTime);
    const trafficDuration = getTrafficTime(origin, destination, transportType, hour);
    const { departureTime, preparationStartTime } = calculateDepartureTime(
      arrivalTime,
      trafficDuration,
      preparationTime
    );

    const newSchedule: Schedule = {
      id: Date.now().toString(),
      origin,
      destination,
      arrivalTime,
      transportType,
      preparationTime,
      departureTime,
      preparationStartTime,
      weekdays,
      selectedDates,
      advanceAlarm,
      preparationAdvanceAlarm,
      memo,
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
    origin: string,
    destination: string,
    arrivalTime: string,
    transportType: TransportType,
    preparationTime: number,
    weekdays?: Weekday[],
    selectedDates?: Date[],
    advanceAlarm?: { enabled: boolean; minutes: number },
    preparationAdvanceAlarm?: { enabled: boolean; minutes: number },
    memo?: string
  ) => {
    const { hour } = parseTimeString(arrivalTime);
    const trafficDuration = getTrafficTime(origin, destination, transportType, hour);
    const { departureTime, preparationStartTime } = calculateDepartureTime(
      arrivalTime,
      trafficDuration,
      preparationTime
    );

    setSchedules(prev => prev.map(schedule => 
      schedule.id === id 
        ? {
            ...schedule,
            origin,
            destination,
            arrivalTime,
            transportType,
            preparationTime,
            departureTime,
            preparationStartTime,
            weekdays,
            selectedDates,
            advanceAlarm,
            preparationAdvanceAlarm,
            memo
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

  // 일괄 관리 기능
  const toggleGroupActive = useCallback((scheduleIds: string[], active: boolean) => {
    setSchedules(prev => prev.map(schedule => 
      scheduleIds.includes(schedule.id)
        ? { ...schedule, isActive: active }
        : schedule
    ));
  }, []);

  const deleteGroup = useCallback((scheduleIds: string[]) => {
    setSchedules(prev => prev.filter(schedule => !scheduleIds.includes(schedule.id)));
  }, []);

  return {
    schedules,
    addSchedule,
    deleteSchedule,
    updateSchedule,
    toggleScheduleActive,
    toggleGroupActive,
    deleteGroup
  };
}
