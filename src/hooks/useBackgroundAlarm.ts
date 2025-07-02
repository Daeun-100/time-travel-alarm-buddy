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
        console.log('✅ 서비스 워커 등록됨:', registration);

        // 서비스 워커 상태 확인
        if (registration.active) {
          console.log('✅ 서비스 워커 활성화됨');
        } else {
          console.log('⚠️ 서비스 워커 아직 활성화되지 않음');
        }

        return registration;
      } catch (error) {
        console.error('❌ 서비스 워커 등록 실패:', error);
        return null;
      }
    } else {
      console.error('❌ 이 브라우저는 서비스 워커를 지원하지 않습니다.');
      return null;
    }
  }, []);

  // 알림 권한 요청
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('❌ 이 브라우저는 알림을 지원하지 않습니다.');
      return false;
    }

    console.log('🔔 현재 알림 권한:', Notification.permission);

    if (Notification.permission === 'granted') {
      console.log('✅ 알림 권한이 이미 허용됨');
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('❌ 알림 권한이 거부됨');
      return false;
    }

    console.log('🔔 알림 권한 요청 중...');
    const permission = await Notification.requestPermission();
    console.log('🔔 알림 권한 결과:', permission);
    return permission === 'granted';
  }, []);

  // 브라우저 알림 표시 (Windows 11 최적화)
  const showNotification = useCallback(
    (
      title: string,
      body: string,
      scheduleId: string,
      alarmType: string,
      scheduleData: Schedule
    ) => {
      if (
        !('Notification' in window) ||
        Notification.permission !== 'granted'
      ) {
        console.log('❌ 알림 권한이 없어서 alert로 대체');
        alert(`${title}\n${body}`);
        return;
      }

      try {
        // 기존 알림들을 모두 닫기 (Windows 11 배너 문제 해결)
        if ('Notification' in window) {
          // 기존 알림 닫기
          const existingNotifications = (window as any).__notifications || [];
          existingNotifications.forEach((notification: Notification) => {
            try {
              notification.close();
            } catch (e) {
              console.log('기존 알림 닫기 실패:', e);
            }
          });
        }

        // Windows 11에서 배너 알림이 제대로 표시되도록 설정
        const notification = new Notification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          requireInteraction: true, // 사용자가 직접 닫을 때까지 유지
          silent: false,
          tag: `${scheduleId}-${alarmType}`,
          data: { scheduleId, alarmType, scheduleData },
        });

        // 알림 추적을 위한 배열에 추가
        if (!(window as any).__notifications) {
          (window as any).__notifications = [];
        }
        (window as any).__notifications.push(notification);

        console.log('✅ 브라우저 알림 생성됨 (Windows 11 최적화)');

        // 알림 클릭 시 앱 포커스
        notification.onclick = (event) => {
          console.log('🔔 알림 클릭됨:', event);
          notification.close();

          // 추적 배열에서 제거
          const notifications = (window as any).__notifications || [];
          const index = notifications.indexOf(notification);
          if (index > -1) {
            notifications.splice(index, 1);
          }

          window.focus();

          // Windows 11에서 알림 센터로 이동하지 않도록 방지
          if (event.preventDefault) {
            event.preventDefault();
          }
        };

        // 알림이 표시되었는지 확인
        notification.onshow = () => {
          console.log('🔔 알림이 화면에 표시됨');
        };

        notification.onerror = (error: Event) => {
          console.error('❌ 알림 표시 오류:', error);
          // 오류 시 alert로 대체
          alert(`${title}\n${body}`);
        };

        // 알림이 닫힐 때 추적 배열에서 제거
        notification.onclose = () => {
          console.log('🔔 알림이 닫힘');
          const notifications = (window as any).__notifications || [];
          const index = notifications.indexOf(notification);
          if (index > -1) {
            notifications.splice(index, 1);
          }
        };
      } catch (error) {
        console.error('❌ 브라우저 알림 생성 실패:', error);
        alert(`${title}\n${body}`);
      }
    },
    []
  );

  // 오디오 알람 재생
  const playAlarmSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      console.log('🔊 클라이언트에서 오디오 알람 재생됨');
    } catch (error) {
      console.error('❌ 오디오 알람 재생 실패:', error);
    }
  }, []);

  // 백그라운드 알람 설정
  const setBackgroundAlarm = useCallback((schedule: Schedule) => {
    if (!swRegistrationRef.current?.active) {
      console.log('❌ 서비스 워커가 활성화되지 않았습니다.');
      return;
    }

    const { preparation, departure, advance, preparationAdvance } =
      getNextAlarmTime(schedule);

    // 준비 알람 설정
    if (preparation) {
      swRegistrationRef.current.active.postMessage({
        type: 'SET_ALARM',
        scheduleId: schedule.id,
        alarmTime: preparation.getTime(),
        alarmType: 'preparation',
        scheduleData: schedule,
      });
    }

    // 출발 알람 설정
    if (departure) {
      swRegistrationRef.current.active.postMessage({
        type: 'SET_ALARM',
        scheduleId: schedule.id,
        alarmTime: departure.getTime(),
        alarmType: 'departure',
        scheduleData: schedule,
      });
    }

    // 사전 알림 설정
    if (advance) {
      swRegistrationRef.current.active.postMessage({
        type: 'SET_ALARM',
        scheduleId: schedule.id,
        alarmTime: advance.getTime(),
        alarmType: 'advance',
        scheduleData: schedule,
      });
    }

    // 준비 사전 알림 설정
    if (preparationAdvance) {
      swRegistrationRef.current.active.postMessage({
        type: 'SET_ALARM',
        scheduleId: schedule.id,
        alarmTime: preparationAdvance.getTime(),
        alarmType: 'preparation-advance',
        scheduleData: schedule,
      });
    }
  }, []);

  // 백그라운드 알람 제거
  const clearBackgroundAlarm = useCallback((scheduleId: string) => {
    if (!swRegistrationRef.current?.active) return;

    const alarmTypes = [
      'preparation',
      'departure',
      'advance',
      'preparation-advance',
    ];
    alarmTypes.forEach((type) => {
      swRegistrationRef.current!.active!.postMessage({
        type: 'CLEAR_ALARM',
        scheduleId,
        alarmType: type,
      });
    });
  }, []);

  // 모든 백그라운드 알람 제거
  const clearAllBackgroundAlarms = useCallback(() => {
    if (!swRegistrationRef.current?.active) return;

    swRegistrationRef.current.active.postMessage({
      type: 'CLEAR_ALL_ALARMS',
    });
  }, []);

  // Windows 알림 센터 강제 새로고침 (Windows 11 배너 문제 해결)
  const refreshNotificationCenter = useCallback(() => {
    try {
      // Windows 알림 센터를 강제로 새로고침
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            if (registration.active) {
              registration.active.postMessage({
                type: 'REFRESH_NOTIFICATIONS',
              });
            }
          });
        });
      }

      // 기존 알림들을 모두 닫기
      const existingNotifications = (window as any).__notifications || [];
      existingNotifications.forEach((notification: Notification) => {
        try {
          notification.close();
        } catch (e) {
          console.log('기존 알림 닫기 실패:', e);
        }
      });

      // 배열 초기화
      (window as any).__notifications = [];

      console.log('🔄 Windows 알림 센터 새로고침 완료');
    } catch (error) {
      console.error('❌ 알림 센터 새로고침 실패:', error);
    }
  }, []);

  // 알람 테스트 (개선된 버전)
  const testBackgroundAlarm = useCallback(
    (
      schedule: Schedule,
      type:
        | 'preparation'
        | 'departure'
        | 'advance'
        | 'preparation-advance' = 'departure'
    ) => {
      console.log('🧪 알람 테스트 시작:', { schedule, type });

      if (!swRegistrationRef.current?.active) {
        console.log('❌ 서비스 워커가 활성화되지 않음');
        alert(
          '서비스 워커가 활성화되지 않았습니다. 페이지를 새로고침해주세요.'
        );
        return;
      }

      // 알림 권한 확인
      if (Notification.permission !== 'granted') {
        console.log('❌ 알림 권한이 없음');
        alert('알림 권한이 필요합니다. 브라우저 설정에서 알림을 허용해주세요.');
        return;
      }

      // Windows 알림 센터 새로고침 (기존 알림 정리)
      refreshNotificationCenter();

      // 1초 후 테스트 알람 실행
      const testTime = Date.now() + 1000;
      console.log('⏰ 테스트 알람 설정:', { testTime, type });

      try {
        swRegistrationRef.current.active.postMessage({
          type: 'SET_ALARM',
          scheduleId: `${schedule.id}-test`,
          alarmTime: testTime,
          alarmType: type,
          scheduleData: schedule,
        });
        console.log('✅ 테스트 알람 메시지 전송됨');
      } catch (error) {
        console.error('❌ 테스트 알람 메시지 전송 실패:', error);
        alert('알람 테스트 설정에 실패했습니다.');
      }
    },
    [refreshNotificationCenter]
  );

  // 초기화
  useEffect(() => {
    const init = async () => {
      console.log('🚀 백그라운드 알람 초기화 시작');
      await registerServiceWorker();
      await requestNotificationPermission();
      console.log('✅ 백그라운드 알람 초기화 완료');
    };
    init();
  }, [registerServiceWorker, requestNotificationPermission]);

  // 일정 변경 시 알람 재설정
  useEffect(() => {
    if (!swRegistrationRef.current?.active) return;

    // 모든 기존 알람 제거
    clearAllBackgroundAlarms();

    // 활성화된 일정에 대해 알람 설정
    schedules.forEach((schedule) => {
      if (schedule.isActive !== false) {
        setBackgroundAlarm(schedule);
      }
    });
  }, [schedules, setBackgroundAlarm, clearAllBackgroundAlarms]);

  // 서비스 워커 메시지 리스너
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('📨 클라이언트에서 서비스 워커 메시지 수신:', event.data);

      if (event.data && event.data.type === 'ALARM_TRIGGERED') {
        console.log('🔔 백그라운드 알람 실행됨:', event.data);
        // 필요한 경우 추가 처리
      } else if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        console.log('🔔 알림 표시 요청:', event.data);
        showNotification(
          event.data.title,
          event.data.body,
          event.data.scheduleId,
          event.data.alarmType,
          event.data.scheduleData
        );
      } else if (event.data && event.data.type === 'PLAY_ALARM_SOUND') {
        console.log('🔊 오디오 재생 요청');
        playAlarmSound();
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, [showNotification, playAlarmSound]);

  return {
    setBackgroundAlarm,
    clearBackgroundAlarm,
    clearAllBackgroundAlarms,
    testBackgroundAlarm,
    requestNotificationPermission,
    refreshNotificationCenter,
  };
}
