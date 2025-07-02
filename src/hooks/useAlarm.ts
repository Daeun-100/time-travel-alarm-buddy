import { useEffect, useRef, useCallback } from 'react';
import { Schedule } from '@/types/schedule';
import { 
  getNextAlarmTime, 
  createAlarmMessage, 
  showNotification, 
  playAlarmSound
} from '@/utils/alarmUtils';

export function useAlarm(schedules: Schedule[]) {
  const alarmTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // 알람 설정
  const setAlarm = useCallback((schedule: Schedule) => {
    const { preparation, departure, advance, preparationAdvance } = getNextAlarmTime(schedule);
    
    // 기존 알람 제거
    const existingTimeout = alarmTimeoutsRef.current.get(schedule.id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      alarmTimeoutsRef.current.delete(schedule.id);
    }

    // 준비 알람 설정
    if (preparation) {
      const preparationDelay = preparation.getTime() - Date.now();
      if (preparationDelay > 0) {
        const timeout = setTimeout(() => {
          const message = createAlarmMessage(schedule, 'preparation');
          showNotification('준비 알람', message);
          playAlarmSound();
        }, preparationDelay);
        alarmTimeoutsRef.current.set(`${schedule.id}-preparation`, timeout);
      }
    }

    // 출발 알람 설정
    if (departure) {
      const departureDelay = departure.getTime() - Date.now();
      if (departureDelay > 0) {
        const timeout = setTimeout(() => {
          const message = createAlarmMessage(schedule, 'departure');
          showNotification('출발 알람', message);
          playAlarmSound();
        }, departureDelay);
        alarmTimeoutsRef.current.set(`${schedule.id}-departure`, timeout);
      }
    }

    // 사전 알림 설정
    if (advance) {
      const advanceDelay = advance.getTime() - Date.now();
      if (advanceDelay > 0) {
        const timeout = setTimeout(() => {
          const message = createAlarmMessage(schedule, 'advance');
          showNotification('사전 알림', message);
          playAlarmSound();
        }, advanceDelay);
        alarmTimeoutsRef.current.set(`${schedule.id}-advance`, timeout);
      }
    }

    // 준비 사전 알림 설정
    if (preparationAdvance) {
      const preparationAdvanceDelay = preparationAdvance.getTime() - Date.now();
      if (preparationAdvanceDelay > 0) {
        const timeout = setTimeout(() => {
          const message = createAlarmMessage(schedule, 'preparation-advance');
          showNotification('준비 사전 알림', message);
          playAlarmSound();
        }, preparationAdvanceDelay);
        alarmTimeoutsRef.current.set(`${schedule.id}-preparation-advance`, timeout);
      }
    }
  }, []);

  // 알람 제거
  const clearAlarm = useCallback((scheduleId: string) => {
    const preparationTimeout = alarmTimeoutsRef.current.get(`${scheduleId}-preparation`);
    const departureTimeout = alarmTimeoutsRef.current.get(`${scheduleId}-departure`);
    const advanceTimeout = alarmTimeoutsRef.current.get(`${scheduleId}-advance`);
    const preparationAdvanceTimeout = alarmTimeoutsRef.current.get(`${scheduleId}-preparation-advance`);
    
    if (preparationTimeout) {
      clearTimeout(preparationTimeout);
      alarmTimeoutsRef.current.delete(`${scheduleId}-preparation`);
    }
    
    if (departureTimeout) {
      clearTimeout(departureTimeout);
      alarmTimeoutsRef.current.delete(`${scheduleId}-departure`);
    }

    if (advanceTimeout) {
      clearTimeout(advanceTimeout);
      alarmTimeoutsRef.current.delete(`${scheduleId}-advance`);
    }

    if (preparationAdvanceTimeout) {
      clearTimeout(preparationAdvanceTimeout);
      alarmTimeoutsRef.current.delete(`${scheduleId}-preparation-advance`);
    }
  }, []);

  // 모든 알람 제거
  const clearAllAlarms = useCallback(() => {
    alarmTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    alarmTimeoutsRef.current.clear();
  }, []);

  // 알람 테스트
  const testAlarm = useCallback((schedule: Schedule, type: 'preparation' | 'departure' | 'advance' | 'preparation-advance' = 'departure') => {
    const message = createAlarmMessage(schedule, type);
    const title = type === 'preparation' ? '준비 알람 테스트' : 
                  type === 'advance' ? '사전 알림 테스트' : 
                  type === 'preparation-advance' ? '준비 사전 알림 테스트' : '출발 알람 테스트';
    showNotification(title, message);
    playAlarmSound();
  }, []);

  // 일정 변경 시 알람 재설정
  useEffect(() => {
    // 모든 기존 알람 제거
    clearAllAlarms();

    // 활성화된 일정에 대해 알람 설정
    schedules.forEach(schedule => {
      if (schedule.isActive !== false) { // isActive가 undefined이거나 true인 경우
        setAlarm(schedule);
      }
    });

    // 컴포넌트 언마운트 시 모든 알람 제거
    return () => {
      clearAllAlarms();
    };
  }, [schedules, setAlarm, clearAllAlarms]);

  return {
    setAlarm,
    clearAlarm,
    clearAllAlarms,
    testAlarm
  };
} 