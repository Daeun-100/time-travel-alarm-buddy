import React, { useState } from 'react';
import { Trash2, Edit, MapPin, Bus, Car, Bike, Calendar, Clock, Bell, Volume2, ChevronDown, Info } from 'lucide-react';
import { Schedule, WEEKDAY_LABELS } from '@/types/schedule';
import TimeDisplay from './TimeDisplay';
import TrafficDetailBox from './TrafficDetailBox';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getTrafficTime } from '@/utils/timeCalculator';
import { TRANSPORT_LABELS } from '@/mocks/trafficData';

interface ScheduleCardProps {
  schedule: Schedule;
  onDelete: (id: string) => void;
  onEdit?: (schedule: Schedule) => void;
  onToggleActive?: (id: string) => void;
  onTestAlarm?: (schedule: Schedule, type: 'preparation' | 'departure' | 'advance' | 'preparation-advance') => void;
}

const transportIcons = {
  subway: Bus, // Using Bus icon for subway since Subway doesn't exist
  bus: Bus,
  car: Car,
  bicycle: Bike,
  walk: MapPin // Using MapPin for walk since it's more appropriate
};

const ScheduleCard: React.FC<ScheduleCardProps> = ({ 
  schedule, 
  onDelete, 
  onEdit, 
  onToggleActive,
  onTestAlarm 
}) => {
  const [showTrafficDetail, setShowTrafficDetail] = useState(false);
  const TransportIcon = transportIcons[schedule.transportType];
  
  // 교통 시간 계산
  const [hour] = schedule.arrivalTime.split(':').map(Number);
  const trafficDuration = getTrafficTime(schedule.origin, schedule.destination, schedule.transportType, hour);

  const formatWeekdays = (weekdays: string[]) => {
    if (weekdays.length === 7) return '매일';
    if (weekdays.length === 5 && 
        weekdays.includes('monday') && 
        weekdays.includes('tuesday') && 
        weekdays.includes('wednesday') && 
        weekdays.includes('thursday') && 
        weekdays.includes('friday')) {
      return '평일';
    }
    if (weekdays.length === 2 && 
        weekdays.includes('saturday') && 
        weekdays.includes('sunday')) {
      return '주말';
    }
    return weekdays.map(day => WEEKDAY_LABELS[day as keyof typeof WEEKDAY_LABELS]).join(', ');
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
        detail: formatSelectedDates(schedule.selectedDates)
      };
    } else if (schedule.weekdays && schedule.weekdays.length > 0) {
      return {
        type: 'recurring',
        icon: Clock,
        label: '반복',
        detail: formatWeekdays(schedule.weekdays)
      };
    }
    return null;
  };

  const scheduleInfo = getScheduleTypeInfo();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <MapPin className="text-green-600" size={20} />
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{schedule.destination}</h3>
            <div className="text-sm text-gray-600 mt-1">
              {schedule.origin} → {schedule.destination}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
              <TransportIcon size={16} />
              <span>{TRANSPORT_LABELS[schedule.transportType]}</span>
              <span>•</span>
              <span>준비시간 {schedule.preparationTime}분</span>
            </div>
            {schedule.preparationAdvanceAlarm?.enabled && (
              <div className="flex items-center space-x-2 text-sm text-green-600 mt-1">
                <Bell size={14} />
                <span className="font-medium">준비 사전 알림 {schedule.preparationAdvanceAlarm.minutes}분 전</span>
              </div>
            )}
            {schedule.advanceAlarm?.enabled && (
              <div className="flex items-center space-x-2 text-sm text-orange-600 mt-1">
                <Bell size={14} />
                <span className="font-medium">출발 사전 알림 {schedule.advanceAlarm.minutes}분 전</span>
              </div>
            )}
            {scheduleInfo && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                <scheduleInfo.icon size={14} />
                <span className="text-blue-600 font-medium">{scheduleInfo.label}</span>
                <span>•</span>
                <span>{scheduleInfo.detail}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          {onTestAlarm && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-orange-600"
                  title="알람 테스트"
                >
                  <Volume2 size={16} />
                  <ChevronDown size={12} className="ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onTestAlarm(schedule, 'preparation')}>
                  <Clock size={14} className="mr-2" />
                  준비 알람 테스트
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTestAlarm(schedule, 'departure')}>
                  <MapPin size={14} className="mr-2" />
                  출발 알람 테스트
                </DropdownMenuItem>
                {schedule.preparationAdvanceAlarm?.enabled && (
                  <DropdownMenuItem onClick={() => onTestAlarm(schedule, 'preparation-advance')}>
                    <Bell size={14} className="mr-2" />
                    준비 사전 알림 테스트 ({schedule.preparationAdvanceAlarm.minutes}분 전)
                  </DropdownMenuItem>
                )}
                {schedule.advanceAlarm?.enabled && (
                  <DropdownMenuItem onClick={() => onTestAlarm(schedule, 'advance')}>
                    <Bell size={14} className="mr-2" />
                    출발 사전 알림 테스트 ({schedule.advanceAlarm.minutes}분 전)
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(schedule)}
              className="text-gray-600 hover:text-blue-600"
            >
              <Edit size={16} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(schedule.id)}
            className="text-gray-600 hover:text-red-600"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      <TimeDisplay
        preparationStartTime={schedule.preparationStartTime}
        departureTime={schedule.departureTime}
        arrivalTime={schedule.arrivalTime}
      />

      {/* 교통 상세 정보 토글 버튼 */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <Info size={16} className="text-gray-600" />
          <span className="text-sm text-gray-700">교통 상세 정보</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowTrafficDetail(!showTrafficDetail)}
          className="text-blue-600 hover:text-blue-700"
        >
          {showTrafficDetail ? '접기' : '보기'}
        </Button>
      </div>

      {/* 교통 상세 정보 박스 */}
      {showTrafficDetail && (
        <div className="mt-4">
          <TrafficDetailBox
            origin={schedule.origin}
            destination={schedule.destination}
            transportType={schedule.transportType}
            arrivalTime={schedule.arrivalTime}
            trafficDuration={trafficDuration}
          />
        </div>
      )}

      {/* 알람 활성화 토글 */}
      {onToggleActive && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <Bell size={16} className="text-gray-600" />
            <span className="text-sm text-gray-700">알람 활성화</span>
          </div>
          <Switch
            checked={schedule.isActive !== false}
            onCheckedChange={() => onToggleActive(schedule.id)}
          />
        </div>
      )}
    </div>
  );
};

export default ScheduleCard;
