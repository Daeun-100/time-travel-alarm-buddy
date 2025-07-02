import { useEffect, useRef, useCallback } from 'react';
import { Schedule } from '@/types/schedule';
import { 
  getNextAlarmTime, 
  createAlarmMessage, 
  showNotification, 
  playAlarmSound
} from '@/utils/alarmUtils';
import { useBackgroundAlarm } from './useBackgroundAlarm';

export function useAlarm(schedules: Schedule[]) {
  const alarmTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const { 
    setBackgroundAlarm, 
    clearBackgroundAlarm, 
    clearAllBackgroundAlarms, 
    testBackgroundAlarm: testBackgroundAlarmFn 
  } = useBackgroundAlarm(schedules);

  // 알람 설정 (백그라운드 알람 사용)
  const setAlarm = useCallback((schedule: Schedule) => {
    setBackgroundAlarm(schedule);
  }, [setBackgroundAlarm]);

  // 알람 제거 (백그라운드 알람 사용)
  const clearAlarm = useCallback((scheduleId: string) => {
    clearBackgroundAlarm(scheduleId);
  }, [clearBackgroundAlarm]);

  // 모든 알람 제거 (백그라운드 알람 사용)
  const clearAllAlarms = useCallback(() => {
    clearAllBackgroundAlarms();
  }, [clearAllBackgroundAlarms]);

  // 알람 테스트 (백그라운드 알람 사용)
  const testAlarm = useCallback((schedule: Schedule, type: 'preparation' | 'departure' | 'advance' | 'preparation-advance' = 'departure') => {
    testBackgroundAlarmFn(schedule, type);
  }, [testBackgroundAlarmFn]);

  // 일정 변경 시 알람 재설정 (백그라운드 알람이 자동으로 처리)
  useEffect(() => {
    // 백그라운드 알람이 자동으로 처리하므로 여기서는 추가 작업 불필요
  }, [schedules]);

  return {
    setAlarm,
    clearAlarm,
    clearAllAlarms,
    testAlarm
  };
} 