import { Schedule, Weekday } from '@/types/schedule';

// 현재 요일을 Weekday 타입으로 반환
export function getCurrentWeekday(): Weekday {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
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
    return schedule.selectedDates.some(date => 
      date.toDateString() === today.toDateString()
    );
  }

  // 반복 일정인 경우
  if (schedule.weekdays && schedule.weekdays.length > 0) {
    return schedule.weekdays.includes(currentWeekday);
  }

  return false;
}

// 다음 알람 시간 계산
export function getNextAlarmTime(schedule: Schedule): { preparation: Date | null; departure: Date | null } {
  if (!isScheduleActiveToday(schedule)) {
    return { preparation: null, departure: null };
  }

  const now = new Date();
  const today = new Date();
  
  // 준비 시작 시간
  const preparationTime = timeStringToDateOnDate(schedule.preparationStartTime, today);
  // 출발 시간
  const departureTime = timeStringToDateOnDate(schedule.departureTime, today);

  return {
    preparation: preparationTime > now ? preparationTime : null,
    departure: departureTime > now ? departureTime : null
  };
}

// 알람 메시지 생성
export function createAlarmMessage(schedule: Schedule, type: 'preparation' | 'departure'): string {
  const time = type === 'preparation' ? schedule.preparationStartTime : schedule.departureTime;
  const action = type === 'preparation' ? '준비를 시작하세요' : '출발하세요';
  
  return `⏰ ${schedule.destination} ${action}!\n시간: ${time}\n이동수단: ${getTransportLabel(schedule.transportType)}`;
}

// 교통수단 라벨
function getTransportLabel(transportType: string): string {
  const labels = {
    subway: '지하철',
    bus: '버스',
    car: '자동차',
    bicycle: '자전거',
    walk: '도보'
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
export function showNotification(title: string, body: string): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    // 알림 권한이 없으면 alert로 대체
    alert(`${title}\n${body}`);
    return;
  }

  new Notification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    requireInteraction: true,
    silent: false
  });
}

// 오디오 알람 재생
export function playAlarmSound(): void {
  try {
    const audio = new Audio();
    // 간단한 비프음 생성 (Web Audio API 사용)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.log('오디오 재생에 실패했습니다:', error);
  }
} 