// 서비스 워커 - 백그라운드 알람 처리
const CACHE_NAME = 'time-travel-alarm-v1';
const ALARM_CACHE = 'alarm-cache';

// 설치 시 캐시 생성
self.addEventListener('install', (event) => {
  console.log('Service Worker 설치됨');
  self.skipWaiting();
});

// 활성화 시 이전 캐시 정리
self.addEventListener('activate', (event) => {
  console.log('Service Worker 활성화됨');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 알람 설정 메시지 처리
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_ALARM') {
    const { scheduleId, alarmTime, alarmType, scheduleData } = event.data;
    setAlarm(scheduleId, alarmTime, alarmType, scheduleData);
  } else if (event.data && event.data.type === 'CLEAR_ALARM') {
    const { scheduleId, alarmType } = event.data;
    clearAlarm(scheduleId, alarmType);
  } else if (event.data && event.data.type === 'CLEAR_ALL_ALARMS') {
    clearAllAlarms();
  }
});

// 알람 저장소
const alarms = new Map();

// 알람 설정
function setAlarm(scheduleId, alarmTime, alarmType, scheduleData) {
  const alarmKey = `${scheduleId}-${alarmType}`;
  const now = Date.now();
  const delay = alarmTime - now;
  
  if (delay <= 0) {
    console.log('알람 시간이 이미 지났습니다:', alarmKey);
    return;
  }

  // 기존 알람 제거
  clearAlarm(scheduleId, alarmType);

  // 새 알람 설정
  const timeoutId = setTimeout(() => {
    triggerAlarm(scheduleId, alarmType, scheduleData);
  }, delay);

  alarms.set(alarmKey, {
    timeoutId,
    scheduleData,
    alarmTime
  });

  console.log(`알람 설정됨: ${alarmKey} at ${new Date(alarmTime).toLocaleString()}`);
}

// 알람 제거
function clearAlarm(scheduleId, alarmType) {
  const alarmKey = `${scheduleId}-${alarmType}`;
  const alarm = alarms.get(alarmKey);
  
  if (alarm) {
    clearTimeout(alarm.timeoutId);
    alarms.delete(alarmKey);
    console.log(`알람 제거됨: ${alarmKey}`);
  }
}

// 모든 알람 제거
function clearAllAlarms() {
  alarms.forEach((alarm, key) => {
    clearTimeout(alarm.timeoutId);
  });
  alarms.clear();
  console.log('모든 알람이 제거되었습니다.');
}

// 알람 실행
async function triggerAlarm(scheduleId, alarmType, scheduleData) {
  console.log(`알람 실행: ${scheduleId}-${alarmType}`);

  // 알람 데이터에서 제거
  alarms.delete(`${scheduleId}-${alarmType}`);

  // 알림 표시
  const title = getAlarmTitle(alarmType);
  const body = createAlarmMessage(scheduleData, alarmType);

  // 브라우저 알림 표시
  if ('Notification' in self && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      requireInteraction: true,
      silent: false,
      tag: `${scheduleId}-${alarmType}`,
      data: { scheduleId, alarmType, scheduleData }
    });

    // 알림 클릭 시 앱 열기
    notification.onclick = () => {
      notification.close();
      self.clients.openWindow('/');
    };
  }

  // 오디오 알람 재생
  playAlarmSound();

  // 모든 클라이언트에 알람 실행 메시지 전송
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'ALARM_TRIGGERED',
      scheduleId,
      alarmType,
      scheduleData
    });
  });
}

// 알람 제목 생성
function getAlarmTitle(alarmType) {
  switch (alarmType) {
    case 'preparation': return '준비 알람';
    case 'departure': return '출발 알람';
    case 'advance': return '사전 알림';
    case 'preparation-advance': return '준비 사전 알림';
    default: return '알람';
  }
}

// 알람 메시지 생성
function createAlarmMessage(schedule, type) {
  let time, action;
  
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
  
  let message = `⏰ ${schedule.destination} ${action}!\n시간: ${time}\n이동수단: ${getTransportLabel(schedule.transportType)}`;
  
  if (type !== 'advance' && type !== 'preparation-advance' && schedule.memo) {
    message += `\n\n📝 메모: ${schedule.memo}`;
  }
  
  return message;
}

// 교통수단 라벨
function getTransportLabel(transportType) {
  const labels = {
    subway: '지하철',
    bus: '버스',
    car: '자동차',
    bicycle: '자전거',
    walk: '도보'
  };
  return labels[transportType] || transportType;
}

// 오디오 알람 재생
function playAlarmSound() {
  try {
    // 간단한 비프음 생성
    const audioContext = new (self.AudioContext || self.webkitAudioContext)();
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