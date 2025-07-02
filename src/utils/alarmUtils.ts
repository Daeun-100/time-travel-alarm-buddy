import { Schedule, Weekday } from '@/types/schedule';

// 현재 요일을 Weekday 타입으로 반환
export function getCurrentWeekday(): Weekday {
  const days = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  return days[new Date().getDay()] as Weekday;
}

// 시간 문자열을 Date 객체로 변환 (오늘 날짜 기준)
export function timeStringToDate(timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// 특정 날짜의 시간 문자열을 Date 객체로 변환
export function timeStringToDateOnDate(timeString: string, date: Date): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
}

// 일정이 오늘 활성화되어야 하는지 확인
export function isScheduleActiveToday(schedule: Schedule): boolean {
  if (!schedule.isActive) return false;

  const today = new Date();
  const currentWeekday = getCurrentWeekday();

  // 일회성 일정인 경우
  if (schedule.selectedDates && schedule.selectedDates.length > 0) {
    return schedule.selectedDates.some(
      (date) => date.toDateString() === today.toDateString()
    );
  }

  // 반복 일정인 경우
  if (schedule.weekdays && schedule.weekdays.length > 0) {
    return schedule.weekdays.includes(currentWeekday);
  }

  return false;
}

// 다음 알람 시간 계산
export function getNextAlarmTime(schedule: Schedule): {
  preparation: Date | null;
  departure: Date | null;
  advance: Date | null;
  preparationAdvance: Date | null;
} {
  if (!isScheduleActiveToday(schedule)) {
    return {
      preparation: null,
      departure: null,
      advance: null,
      preparationAdvance: null,
    };
  }

  const now = new Date();
  const today = new Date();

  // 준비 시작 시간
  const preparationTime = timeStringToDateOnDate(
    schedule.preparationStartTime,
    today
  );
  // 출발 시간
  const departureTime = timeStringToDateOnDate(schedule.departureTime, today);

  // 사전 알림 시간 (출발 시간에서 설정된 분만큼 뺀 시간)
  let advanceTime: Date | null = null;
  if (schedule.advanceAlarm?.enabled && schedule.advanceAlarm.minutes > 0) {
    advanceTime = new Date(departureTime);
    advanceTime.setMinutes(
      advanceTime.getMinutes() - schedule.advanceAlarm.minutes
    );
  }

  // 준비 사전 알림 시간 (준비 시작 시간에서 설정된 분만큼 뺀 시간)
  let preparationAdvanceTime: Date | null = null;
  if (
    schedule.preparationAdvanceAlarm?.enabled &&
    schedule.preparationAdvanceAlarm.minutes > 0
  ) {
    preparationAdvanceTime = new Date(preparationTime);
    preparationAdvanceTime.setMinutes(
      preparationAdvanceTime.getMinutes() -
        schedule.preparationAdvanceAlarm.minutes
    );
  }

  return {
    preparation: preparationTime > now ? preparationTime : null,
    departure: departureTime > now ? departureTime : null,
    advance: advanceTime && advanceTime > now ? advanceTime : null,
    preparationAdvance:
      preparationAdvanceTime && preparationAdvanceTime > now
        ? preparationAdvanceTime
        : null,
  };
}

// 알람 메시지 생성
export function createAlarmMessage(
  schedule: Schedule,
  type: 'preparation' | 'departure' | 'advance' | 'preparation-advance'
): string {
  let time: string;
  let action: string;

  switch (type) {
    case 'preparation':
      time = schedule.preparationStartTime;
      action = '준비를 시작하세요';
      break;
    case 'departure':
      time = schedule.departureTime;
      action = '출발하세요';
      break;
    case 'advance':
      time = schedule.departureTime;
      const minutes = schedule.advanceAlarm?.minutes || 0;
      action = `${minutes}분 후 출발 예정입니다`;
      break;
    case 'preparation-advance':
      time = schedule.preparationStartTime;
      const prepMinutes = schedule.preparationAdvanceAlarm?.minutes || 0;
      action = `${prepMinutes}분 후 준비 시작 예정입니다`;
      break;
  }

  let message = `⏰ ${
    schedule.destination
  } ${action}!\n시간: ${time}\n이동수단: ${getTransportLabel(
    schedule.transportType
  )}`;

  // 사전 알림이 아닌 경우에만 메모 표시
  if (type !== 'advance' && type !== 'preparation-advance' && schedule.memo) {
    message += `\n\n📝 메모: ${schedule.memo}`;
  }

  return message;
}

// 교통수단 라벨
function getTransportLabel(transportType: string): string {
  const labels = {
    subway: '지하철',
    bus: '버스',
    car: '자동차',
    bicycle: '자전거',
    walk: '도보',
  };
  return labels[transportType as keyof typeof labels] || transportType;
}

// 브라우저 알림 권한 요청
export async function requestNotificationPermission(): Promise<boolean> {
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
}

// 브라우저 알림 표시
export async function showNotification(
  title: string,
  body: string
): Promise<void> {
  // 알림 권한이 없으면 먼저 요청
  if (!('Notification' in window)) {
    console.log('이 브라우저는 알림을 지원하지 않습니다.');
    // 브라우저가 알림을 지원하지 않는 경우에만 alert 사용
    alert(`${title}\n${body}`);
    return;
  }

  // 알림 권한이 없으면 요청
  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('알림 권한이 거부되었습니다.');
      // 권한이 거부된 경우에도 alert는 사용하지 않고 콘솔에만 기록
      console.log(`${title}\n${body}`);
      return;
    }
  }

  // 알림 권한이 거부된 경우
  if (Notification.permission === 'denied') {
    console.log('알림 권한이 거부되었습니다.');
    // 권한이 거부된 경우에도 alert는 사용하지 않고 콘솔에만 기록
    console.log(`${title}\n${body}`);
    return;
  }

  // 알림 권한이 허용된 경우 브라우저 알림 표시
  try {
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      requireInteraction: true,
      silent: false,
      tag: 'alarm-notification', // 같은 태그의 알림은 하나만 표시
    });

    // 알림 클릭 시 포커스
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // 10초 후 자동으로 닫기
    setTimeout(() => {
      notification.close();
    }, 10000);
  } catch (error) {
    console.log('알림 표시에 실패했습니다:', error);
    // 알림 표시에 실패한 경우에만 alert 사용
    alert(`${title}\n${body}`);
  }
}

// 오디오 알람 재생
export function playAlarmSound(): void {
  try {
    const audio = new Audio();
    // 간단한 비프음 생성 (Web Audio API 사용)
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
  } catch (error) {
    console.log('오디오 재생에 실패했습니다:', error);
  }
}

// 알림 권한 상태 확인
export function getNotificationPermissionStatus():
  | 'granted'
  | 'denied'
  | 'default'
  | 'unsupported' {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

// 알림 권한 상태를 한글로 반환
export function getNotificationPermissionStatusText(): string {
  const status = getNotificationPermissionStatus();
  switch (status) {
    case 'granted':
      return '허용됨';
    case 'denied':
      return '거부됨';
    case 'default':
      return '요청 대기 중';
    case 'unsupported':
      return '지원하지 않음';
    default:
      return '알 수 없음';
  }
}
