// precache manifest 주입용
import { precacheAndRoute } from 'workbox-precaching';
precacheAndRoute(self.__WB_MANIFEST);

// 알람 저장소
const CACHE_NAME = 'time-travel-alarm-v1';
const alarms = new Map();

// 설치 시 캐시 생성
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker 설치됨');
  self.skipWaiting();
});

// 활성화 시 이전 캐시 정리
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker 활성화됨');
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

// 메시지 핸들링
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || !data.type) return;

  switch (data.type) {
    case 'SET_ALARM':
      setAlarm(
        data.scheduleId,
        data.alarmTime,
        data.alarmType,
        data.scheduleData
      );
      break;
    case 'CLEAR_ALARM':
      clearAlarm(data.scheduleId, data.alarmType);
      break;
    case 'CLEAR_ALL_ALARMS':
      clearAllAlarms();
      break;
  }
});

// 알람 설정
function setAlarm(scheduleId, alarmTime, alarmType, scheduleData) {
  const alarmKey = `${scheduleId}-${alarmType}`;
  const now = Date.now();
  const delay = alarmTime - now;

  if (delay <= 0) {
    console.log('❌ 알람 시간이 지났습니다:', alarmKey);
    return;
  }

  clearAlarm(scheduleId, alarmType);

  const timeoutId = setTimeout(() => {
    console.log('🔔 알람 시간 도달:', alarmKey);
    triggerAlarm(scheduleId, alarmType, scheduleData);
  }, delay);

  alarms.set(alarmKey, { timeoutId, scheduleData, alarmTime });
  console.log(
    `✅ 알람 설정됨: ${alarmKey} at ${new Date(alarmTime).toLocaleString()}`
  );
}

// 알람 제거
function clearAlarm(scheduleId, alarmType) {
  const alarmKey = `${scheduleId}-${alarmType}`;
  const alarm = alarms.get(alarmKey);
  if (alarm) {
    clearTimeout(alarm.timeoutId);
    alarms.delete(alarmKey);
    console.log(`🗑️ 알람 제거됨: ${alarmKey}`);
  }
}

// 모든 알람 제거
function clearAllAlarms() {
  alarms.forEach((alarm) => clearTimeout(alarm.timeoutId));
  alarms.clear();
  console.log('🗑️ 모든 알람 제거됨');
}

// 알람 실행
async function triggerAlarm(scheduleId, alarmType, scheduleData) {
  const title = getAlarmTitle(alarmType);
  const body = createAlarmMessage(scheduleData, alarmType);

  try {
    const clients = await self.clients.matchAll();
    for (const client of clients) {
      client.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        body,
        scheduleId,
        alarmType,
        scheduleData,
      });
      client.postMessage({ type: 'PLAY_ALARM_SOUND' });
      client.postMessage({
        type: 'ALARM_TRIGGERED',
        scheduleId,
        alarmType,
        scheduleData,
      });
    }
  } catch (error) {
    console.error('❌ 클라이언트 메시지 전송 실패:', error);
  }
}

// 알람 제목
function getAlarmTitle(type) {
  switch (type) {
    case 'preparation':
      return '준비 알람';
    case 'departure':
      return '출발 알람';
    case 'advance':
      return '사전 알림';
    case 'preparation-advance':
      return '준비 사전 알림';
    default:
      return '알람';
  }
}

// 알람 메시지
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
      const min = schedule.advanceAlarm?.minutes || 0;
      action = `${min}분 후 출발 예정입니다`;
      break;
    case 'preparation-advance':
      time = schedule.preparationStartTime;
      const pmin = schedule.preparationAdvanceAlarm?.minutes || 0;
      action = `${pmin}분 후 준비 시작 예정입니다`;
      break;
  }

  let msg = `⏰ ${
    schedule.destination
  } ${action}!\n시간: ${time}\n이동수단: ${getTransportLabel(
    schedule.transportType
  )}`;
  if (!['advance', 'preparation-advance'].includes(type) && schedule.memo) {
    msg += `\n\n📝 메모: ${schedule.memo}`;
  }

  return msg;
}

// 교통수단 라벨
function getTransportLabel(type) {
  return (
    {
      subway: '지하철',
      bus: '버스',
      car: '자동차',
      bicycle: '자전거',
      walk: '도보',
    }[type] || type
  );
}
