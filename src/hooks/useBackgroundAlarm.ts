import { useEffect, useRef, useCallback } from 'react';
import { Schedule } from '@/types/schedule';
import { getNextAlarmTime } from '@/utils/alarmUtils';

export function useBackgroundAlarm(schedules: Schedule[]) {
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);

  // 서비스 워커 등록
  const registerServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        swRegistrationRef.current = registration;
        console.log('서비스 워커 등록됨:', registration);
        return registration;
      } catch (error) {
        console.error('서비스 워커 등록 실패:', error);
        return null;
      }
    }
    return null;
  }, []);

  // 알림 권한 요청
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('이 브라우저는 알림을 지원하지 않습니다.');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('알림 권한이 거부되었습니다.');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, []);

  // 백그라운드 알람 설정
  const setBackgroundAlarm = useCallback((schedule: Schedule) => {
    if (!swRegistrationRef.current?.active) {
      console.log('서비스 워커가 활성화되지 않았습니다.');
      return;
    }

    const { preparation, departure, advance, preparationAdvance } = getNextAlarmTime(schedule);
    
    // 준비 알람 설정
    if (preparation) {
      swRegistrationRef.current.active.postMessage({
        type: 'SET_ALARM',
        scheduleId: schedule.id,
        alarmTime: preparation.getTime(),
        alarmType: 'preparation',
        scheduleData: schedule
      });
    }

    // 출발 알람 설정
    if (departure) {
      swRegistrationRef.current.active.postMessage({
        type: 'SET_ALARM',
        scheduleId: schedule.id,
        alarmTime: departure.getTime(),
        alarmType: 'departure',
        scheduleData: schedule
      });
    }

    // 사전 알림 설정
    if (advance) {
      swRegistrationRef.current.active.postMessage({
        type: 'SET_ALARM',
        scheduleId: schedule.id,
        alarmTime: advance.getTime(),
        alarmType: 'advance',
        scheduleData: schedule
      });
    }

    // 준비 사전 알림 설정
    if (preparationAdvance) {
      swRegistrationRef.current.active.postMessage({
        type: 'SET_ALARM',
        scheduleId: schedule.id,
        alarmTime: preparationAdvance.getTime(),
        alarmType: 'preparation-advance',
        scheduleData: schedule
      });
    }
  }, []);

  // 백그라운드 알람 제거
  const clearBackgroundAlarm = useCallback((scheduleId: string) => {
    if (!swRegistrationRef.current?.active) return;

    const alarmTypes = ['preparation', 'departure', 'advance', 'preparation-advance'];
    alarmTypes.forEach(type => {
      swRegistrationRef.current!.active!.postMessage({
        type: 'CLEAR_ALARM',
        scheduleId,
        alarmType: type
      });
    });
  }, []);

  // 모든 백그라운드 알람 제거
  const clearAllBackgroundAlarms = useCallback(() => {
    if (!swRegistrationRef.current?.active) return;

    swRegistrationRef.current.active.postMessage({
      type: 'CLEAR_ALL_ALARMS'
    });
  }, []);

  // 알람 테스트
  const testBackgroundAlarm = useCallback((schedule: Schedule, type: 'preparation' | 'departure' | 'advance' | 'preparation-advance' = 'departure') => {
    if (!swRegistrationRef.current?.active) return;

    // 3초 후 테스트 알람 실행
    const testTime = Date.now() + 3000;
    swRegistrationRef.current.active.postMessage({
      type: 'SET_ALARM',
      scheduleId: `${schedule.id}-test`,
      alarmTime: testTime,
      alarmType: type,
      scheduleData: schedule
    });
  }, []);

  // 초기화
  useEffect(() => {
    const init = async () => {
      await registerServiceWorker();
      await requestNotificationPermission();
    };
    init();
  }, [registerServiceWorker, requestNotificationPermission]);

  // 일정 변경 시 알람 재설정
  useEffect(() => {
    if (!swRegistrationRef.current?.active) return;

    // 모든 기존 알람 제거
    clearAllBackgroundAlarms();

    // 활성화된 일정에 대해 알람 설정
    schedules.forEach(schedule => {
      if (schedule.isActive !== false) {
        setBackgroundAlarm(schedule);
      }
    });
  }, [schedules, setBackgroundAlarm, clearAllBackgroundAlarms]);

  // 서비스 워커 메시지 리스너
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'ALARM_TRIGGERED') {
        console.log('백그라운드 알람 실행됨:', event.data);
        // 필요한 경우 추가 처리
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  return {
    setBackgroundAlarm,
    clearBackgroundAlarm,
    clearAllBackgroundAlarms,
    testBackgroundAlarm,
    requestNotificationPermission
  };
} 