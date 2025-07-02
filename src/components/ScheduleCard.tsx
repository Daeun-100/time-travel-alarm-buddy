import React, { useState } from 'react';
import {
  Trash2,
  Edit,
  MapPin,
  Bus,
  Car,
  Bike,
  Calendar,
  Clock,
  Bell,
  Volume2,
  ChevronDown,
  Info,
  ChevronRight,
} from 'lucide-react';
import { Schedule, WEEKDAY_LABELS } from '@/types/schedule';
import TimeDisplay from './TimeDisplay';
import TrafficDetailBox from './TrafficDetailBox';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getTrafficTime } from '@/utils/timeCalculator';
import { TRANSPORT_LABELS } from '@/mocks/trafficData';

interface ScheduleCardProps {
  schedule: Schedule;
  onDelete: (id: string) => void;
  onEdit: (schedule: Schedule) => void;
  onToggleActive: (id: string) => void;
  onTestAlarm?: (
    schedule: Schedule,
    type: 'preparation' | 'departure' | 'advance' | 'preparation-advance'
  ) => Promise<void>;
  className?: string;
}

const transportIcons = {
  subway: Bus, // Using Bus icon for subway since Subway doesn't exist
  bus: Bus,
  car: Car,
  bicycle: Bike,
  walk: MapPin, // Using MapPin for walk since it's more appropriate
};

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  onDelete,
  onEdit,
  onToggleActive,
  onTestAlarm,
}) => {
  const [showTrafficDetail, setShowTrafficDetail] = useState(false);
  const TransportIcon = transportIcons[schedule.transportType];

  // 교통 시간 계산
  const [hour] = schedule.arrivalTime.split(':').map(Number);
  const trafficDuration = getTrafficTime(
    schedule.origin,
    schedule.destination,
    schedule.transportType,
    hour
  );

  const formatWeekdays = (weekdays: string[]) => {
    if (weekdays.length === 7) return '매일';
    if (
      weekdays.length === 5 &&
      weekdays.includes('monday') &&
      weekdays.includes('tuesday') &&
      weekdays.includes('wednesday') &&
      weekdays.includes('thursday') &&
      weekdays.includes('friday')
    ) {
      return '평일';
    }
    if (
      weekdays.length === 2 &&
      weekdays.includes('saturday') &&
      weekdays.includes('sunday')
    ) {
      return '주말';
    }
    return weekdays
      .map((day) => WEEKDAY_LABELS[day as keyof typeof WEEKDAY_LABELS])
      .join(', ');
  };

  const formatSelectedDates = (dates: Date[]) => {
    if (dates.length === 1) {
      return format(dates[0], 'MM/dd (E)', { locale: ko });
    }
    return `${dates.length}개 날짜`;
  };

  const getScheduleTypeInfo = () => {
    if (schedule.selectedDates && schedule.selectedDates.length > 0) {
      return {
        type: 'one-time',
        icon: Calendar,
        label: '일회성',
        detail: formatSelectedDates(schedule.selectedDates),
      };
    } else if (schedule.weekdays && schedule.weekdays.length > 0) {
      return {
        type: 'recurring',
        icon: Clock,
        label: '반복',
        detail: formatWeekdays(schedule.weekdays),
      };
    }
    return null;
  };

  const scheduleInfo = getScheduleTypeInfo();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* 🎯 최우선 정보 - 항상 표시 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          <MapPin className="text-blue-600" size={18} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {schedule.destination}
              </h3>
              <span className="text-blue-600 font-medium text-sm">
                {schedule.arrivalTime}
              </span>
            </div>
            <div className="text-sm text-gray-600 truncate">
              {schedule.origin} → {schedule.destination}
            </div>
          </div>
        </div>

        {/* 액션 버튼들 - 알람 아이콘 포함 */}
        <div className="flex items-center space-x-1 ml-2">
          {/* 알람 활성화 아이콘 */}
          {onToggleActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleActive(schedule.id)}
              className={`p-1 ${
                schedule.isActive !== false
                  ? 'text-green-600 hover:text-green-700'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title={
                schedule.isActive !== false
                  ? '알람 활성화됨'
                  : '알람 비활성화됨'
              }
            >
              <Bell size={14} />
            </Button>
          )}

          {/* 편집 버튼 */}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(schedule)}
              className="text-gray-600 hover:text-blue-600 p-1"
            >
              <Edit size={14} />
            </Button>
          )}

          {/* 삭제 버튼 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(schedule.id)}
            className="text-gray-600 hover:text-red-600 p-1"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {/* ⚡ 중요 정보 - 간단히 표시 */}
      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
        <div className="flex items-center space-x-3">
          {/* 일정 유형과 날짜 정보를 먼저 표시 */}
          {scheduleInfo && (
            <>
              <div className="flex items-center space-x-1">
                <scheduleInfo.icon size={12} />
                <span className="text-blue-600">{scheduleInfo.label}</span>
              </div>
              <span>•</span>
              <span>{scheduleInfo.detail}</span>
              <span>•</span>
            </>
          )}

          {/* 이동 수단과 준비 시간 */}
          <div className="flex items-center space-x-1">
            <TransportIcon size={14} />
            <span>{TRANSPORT_LABELS[schedule.transportType]}</span>
          </div>
          <span>•</span>
          <span>준비 {schedule.preparationTime}분</span>
        </div>

        {/* 사전 알람 상태 표시 */}
        <div className="flex items-center space-x-1">
          {(schedule.preparationAdvanceAlarm?.enabled ||
            schedule.advanceAlarm?.enabled) && (
            <Bell size={12} className="text-orange-500" />
          )}
        </div>
      </div>

      {/* 📝 메모 - 있을 때만 간단히 표시 */}
      {schedule.memo && (
        <div className="text-xs text-gray-600 mb-3 p-2 bg-gray-50 rounded">
          📝{' '}
          {schedule.memo.length > 50
            ? `${schedule.memo.substring(0, 50)}...`
            : schedule.memo}
        </div>
      )}

      {/* 시간 정보 - 항상 표시 */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <TimeDisplay
          preparationStartTime={schedule.preparationStartTime}
          departureTime={schedule.departureTime}
          arrivalTime={schedule.arrivalTime}
        />
      </div>

      {/* 알람 설정 정보 - 있을 때만 표시 */}
      {(schedule.preparationAdvanceAlarm?.enabled ||
        schedule.advanceAlarm?.enabled) && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
          {schedule.preparationAdvanceAlarm?.enabled && (
            <div className="flex items-center space-x-2 text-xs text-green-600">
              <Bell size={12} />
              <span>
                준비 사전 알림 {schedule.preparationAdvanceAlarm.minutes}분 전
              </span>
            </div>
          )}
          {schedule.advanceAlarm?.enabled && (
            <div className="flex items-center space-x-2 text-xs text-orange-600">
              <Bell size={12} />
              <span>출발 사전 알림 {schedule.advanceAlarm.minutes}분 전</span>
            </div>
          )}
        </div>
      )}

      {/* 알람 테스트 - 있을 때만 표시 */}
      {onTestAlarm && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-gray-600 hover:text-orange-600"
              >
                <Volume2 size={12} className="mr-1" />
                알람 테스트
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onTestAlarm(schedule, 'preparation')}
              >
                <Clock size={12} className="mr-2" />
                준비 알람 테스트
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onTestAlarm(schedule, 'departure')}
              >
                <MapPin size={12} className="mr-2" />
                출발 알람 테스트
              </DropdownMenuItem>
              {schedule.preparationAdvanceAlarm?.enabled && (
                <DropdownMenuItem
                  onClick={() => onTestAlarm(schedule, 'preparation-advance')}
                >
                  <Bell size={12} className="mr-2" />
                  준비 사전 알림 테스트
                </DropdownMenuItem>
              )}
              {schedule.advanceAlarm?.enabled && (
                <DropdownMenuItem
                  onClick={() => onTestAlarm(schedule, 'advance')}
                >
                  <Bell size={12} className="mr-2" />
                  출발 사전 알림 테스트
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* 교통 상세 정보 토글 - 맨 아래 */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowTrafficDetail(!showTrafficDetail)}
          className="text-blue-600 hover:text-blue-700 text-xs p-1"
        >
          {showTrafficDetail ? (
            <>
              <ChevronDown size={12} className="mr-1" />
              교통 상세 정보 접기
            </>
          ) : (
            <>
              <ChevronRight size={12} className="mr-1" />
              교통 상세 정보 보기
            </>
          )}
        </Button>
      </div>

      {/* 교통 상세 정보 */}
      {showTrafficDetail && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <TrafficDetailBox
            origin={schedule.origin}
            destination={schedule.destination}
            transportType={schedule.transportType}
            arrivalTime={schedule.arrivalTime}
            trafficDuration={trafficDuration}
          />
        </div>
      )}
    </div>
  );
};

export default ScheduleCard;
