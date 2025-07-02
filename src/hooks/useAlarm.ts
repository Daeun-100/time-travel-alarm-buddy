import { useEffect, useRef, useCallback } from 'react';
import { Schedule } from '@/types/schedule';
import {
  getNextAlarmTime,
  createAlarmMessage,
  showNotification,
  playAlarmSound,
} from '@/utils/alarmUtils';

export function useAlarm(schedules: Schedule[]) {
  // Map: alarmKey -> timeoutId
  const alarmTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  // 알람 예약
  const setAlarm = useCallback((schedule: Schedule) => {
    const { preparation, departure, advance, preparationAdvance } =
      getNextAlarmTime(schedule);
    const alarmTypes = [
      { time: preparation, type: 'preparation' },
      { time: departure, type: 'departure' },
      { time: advance, type: 'advance' },
      { time: preparationAdvance, type: 'preparation-advance' },
    ];
    alarmTypes.forEach(({ time, type }) => {
      if (time) {
        const alarmKey = `${schedule.id}-${type}`;
        // 기존 알람 제거
        const prevTimeout = alarmTimeoutsRef.current.get(alarmKey);
        if (prevTimeout) clearTimeout(prevTimeout);
        // 알람 예약
        const delay = time.getTime() - Date.now();
        if (delay > 0) {
          const timeoutId = setTimeout(async () => {
            const title =
              type === 'preparation'
                ? '준비 알람'
                : type === 'departure'
                ? '출발 알람'
                : type === 'advance'
                ? '사전 알림'
                : type === 'preparation-advance'
                ? '준비 사전 알림'
                : '알람';
            const body = createAlarmMessage(schedule, type as any);
            await showNotification(title, body);
            playAlarmSound();
            alarmTimeoutsRef.current.delete(alarmKey);
          }, delay);
          alarmTimeoutsRef.current.set(alarmKey, timeoutId);
        }
      }
    });
  }, []);

  // 알람 제거
  const clearAlarm = useCallback((scheduleId: string) => {
    ['preparation', 'departure', 'advance', 'preparation-advance'].forEach(
      (type) => {
        const alarmKey = `${scheduleId}-${type}`;
        const timeoutId = alarmTimeoutsRef.current.get(alarmKey);
        if (timeoutId) {
          clearTimeout(timeoutId);
          alarmTimeoutsRef.current.delete(alarmKey);
        }
      }
    );
  }, []);

  // 모든 알람 제거
  const clearAllAlarms = useCallback(() => {
    alarmTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    alarmTimeoutsRef.current.clear();
  }, []);

  // 알람 테스트
  const testAlarm = useCallback(
    async (
      schedule: Schedule,
      type:
        | 'preparation'
        | 'departure'
        | 'advance'
        | 'preparation-advance' = 'departure'
    ) => {
      const title =
        type === 'preparation'
          ? '준비 알람'
          : type === 'departure'
          ? '출발 알람'
          : type === 'advance'
          ? '사전 알림'
          : type === 'preparation-advance'
          ? '준비 사전 알림'
          : '알람';
      const body = createAlarmMessage(schedule, type);
      await showNotification(title, body);
      playAlarmSound();
    },
    []
  );

  // 일정 변경 시 알람 재설정
  useEffect(() => {
    clearAllAlarms();
    schedules.forEach((schedule) => {
      if (schedule.isActive !== false) {
        setAlarm(schedule);
      }
    });
  }, [schedules, setAlarm, clearAllAlarms]);

  return {
    setAlarm,
    clearAlarm,
    clearAllAlarms,
    testAlarm,
  };
}
