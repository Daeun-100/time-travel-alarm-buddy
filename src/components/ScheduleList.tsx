import React, { useState, useMemo } from 'react';
import { Schedule, Weekday, WEEKDAY_LABELS } from '@/types/schedule';
import ScheduleCard from './ScheduleCard';
import GroupActionBar from './GroupActionBar';
import { Calendar, Filter, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface ScheduleListProps {
  schedules: Schedule[];
  onDeleteSchedule: (id: string) => void;
  onEditSchedule: (schedule: Schedule) => void;
  onToggleActive: (id: string) => void;
  onToggleGroupActive: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onTestAlarm?: (
    schedule: Schedule,
    type: 'preparation' | 'departure' | 'advance' | 'preparation-advance'
  ) => Promise<void>;
}

type FilterType = 'all' | 'destination' | 'weekday';

const ScheduleList: React.FC<ScheduleListProps> = ({
  schedules,
  onDeleteSchedule,
  onEditSchedule,
  onToggleActive,
  onTestAlarm,
  onToggleGroupActive,
  onDeleteGroup,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedDestination, setSelectedDestination] = useState<string>('all');
  const [selectedWeekday, setSelectedWeekday] = useState<Weekday | 'all'>(
    'all'
  );

  // 목적지 목록 추출
  const destinations = useMemo(() => {
    const destSet = new Set(schedules.map((s) => s.destination));
    return Array.from(destSet).sort();
  }, [schedules]);

  // 요일별 일정 분류 (반복 + 일회성 일정 모두 포함)
  const weekdayGroups = useMemo(() => {
    const groups: Record<Weekday, Schedule[]> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    };

    schedules.forEach((schedule) => {
      // 반복 일정 처리
      if (schedule.weekdays) {
        schedule.weekdays.forEach((weekday) => {
          groups[weekday].push(schedule);
        });
      }

      // 일회성 일정 처리
      if (schedule.selectedDates) {
        schedule.selectedDates.forEach((date) => {
          const dayOfWeek = date.getDay();
          const weekdayMap = [
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
          ];
          const weekday = weekdayMap[dayOfWeek] as Weekday;
          groups[weekday].push(schedule);
        });
      }
    });

    return groups;
  }, [schedules]);

  // 필터링된 일정 (시간 순서대로 정렬)
  const filteredSchedules = useMemo(() => {
    let filtered = schedules;

    if (activeFilter === 'destination' && selectedDestination !== 'all') {
      filtered = filtered.filter((s) => s.destination === selectedDestination);
    } else if (activeFilter === 'weekday' && selectedWeekday !== 'all') {
      filtered = filtered.filter((s) => {
        // 반복 일정 체크
        if (s.weekdays?.includes(selectedWeekday)) {
          return true;
        }

        // 일회성 일정 체크
        if (s.selectedDates) {
          return s.selectedDates.some((date) => {
            const dayOfWeek = date.getDay();
            const weekdayMap = [
              'sunday',
              'monday',
              'tuesday',
              'wednesday',
              'thursday',
              'friday',
              'saturday',
            ];
            return weekdayMap[dayOfWeek] === selectedWeekday;
          });
        }

        return false;
      });
    }

    // 날짜 + 출발 시간 순서대로 정렬 (오름차순)
    return filtered.sort((a, b) => {
      // 각 일정의 다음 실행 날짜와 시간을 계산
      const getNextExecutionDateTime = (schedule: Schedule): Date => {
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        // 일회성 일정인 경우
        if (schedule.selectedDates && schedule.selectedDates.length > 0) {
          // 오늘 이후의 가장 가까운 날짜 찾기
          const futureDates = schedule.selectedDates
            .map(
              (date) =>
                new Date(date.getFullYear(), date.getMonth(), date.getDate())
            )
            .filter((date) => date >= today)
            .sort((a, b) => a.getTime() - b.getTime());

          if (futureDates.length > 0) {
            const [hours, minutes] = schedule.departureTime
              .split(':')
              .map(Number);
            const nextDate = new Date(futureDates[0]);
            nextDate.setHours(hours, minutes, 0, 0);
            return nextDate;
          }
        }

        // 반복 일정인 경우
        if (schedule.weekdays && schedule.weekdays.length > 0) {
          const [hours, minutes] = schedule.departureTime
            .split(':')
            .map(Number);

          // 오늘부터 7일 내에서 다음 실행 날짜 찾기
          for (let i = 0; i < 7; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() + i);
            const dayOfWeek = checkDate.getDay();
            const weekdayMap = [
              'sunday',
              'monday',
              'tuesday',
              'wednesday',
              'thursday',
              'friday',
              'saturday',
            ];
            const weekday = weekdayMap[dayOfWeek];

            if (schedule.weekdays.includes(weekday as Weekday)) {
              const nextDate = new Date(checkDate);
              nextDate.setHours(hours, minutes, 0, 0);

              // 오늘이고 이미 시간이 지났다면 다음 주로
              if (i === 0 && nextDate <= now) {
                continue;
              }

              return nextDate;
            }
          }
        }

        // 기본값: 오늘 날짜에 출발 시간
        const [hours, minutes] = schedule.departureTime.split(':').map(Number);
        const defaultDate = new Date(today);
        defaultDate.setHours(hours, minutes, 0, 0);
        return defaultDate;
      };

      const dateTimeA = getNextExecutionDateTime(a);
      const dateTimeB = getNextExecutionDateTime(b);

      return dateTimeA.getTime() - dateTimeB.getTime();
    });
  }, [schedules, activeFilter, selectedDestination, selectedWeekday]);

  if (schedules.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          등록된 일정이 없습니다
        </h3>
        <p className="text-gray-600">
          새 일정을 등록하여 지각 방지 알람을 받아보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">내 일정</h2>
        <div className="flex items-center space-x-2">
          <Filter className="text-gray-600" size={16} />
          <span className="text-sm text-gray-600">분류:</span>
        </div>
      </div>

      {/* 분류 탭 */}
      <div className="flex space-x-2 border-b border-gray-200">
        <Button
          variant={activeFilter === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveFilter('all')}
          className="flex items-center space-x-2"
        >
          <Calendar size={14} />
          <span>전체</span>
          <Badge variant="secondary" className="ml-1">
            {schedules.length}
          </Badge>
        </Button>

        <Button
          variant={activeFilter === 'destination' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveFilter('destination')}
          className="flex items-center space-x-2"
        >
          <MapPin size={14} />
          <span>목적지별</span>
          <Badge variant="secondary" className="ml-1">
            {destinations.length}
          </Badge>
        </Button>

        <Button
          variant={activeFilter === 'weekday' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveFilter('weekday')}
          className="flex items-center space-x-2"
        >
          <Clock size={14} />
          <span>요일별</span>
          <Badge variant="secondary" className="ml-1">
            {
              Object.values(weekdayGroups).filter((group) => group.length > 0)
                .length
            }
          </Badge>
        </Button>
      </div>

      {/* 필터 선택 */}
      {activeFilter === 'destination' && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">목적지:</span>
          <Select
            value={selectedDestination}
            onValueChange={setSelectedDestination}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 목적지</SelectItem>
              {destinations.map((dest) => (
                <SelectItem key={dest} value={dest}>
                  {dest} (
                  {schedules.filter((s) => s.destination === dest).length}개)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {activeFilter === 'weekday' && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">요일:</span>
          <Select
            value={selectedWeekday}
            onValueChange={(value: Weekday | 'all') =>
              setSelectedWeekday(value)
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 요일</SelectItem>
              {Object.entries(weekdayGroups).map(
                ([weekday, schedules]) =>
                  schedules.length > 0 && (
                    <SelectItem key={weekday} value={weekday}>
                      {WEEKDAY_LABELS[weekday as Weekday]} ({schedules.length}
                      개)
                    </SelectItem>
                  )
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 그룹 액션 바 */}
      {activeFilter === 'destination' &&
        selectedDestination !== 'all' &&
        onToggleGroupActive &&
        onDeleteGroup && (
          <GroupActionBar
            groupName={selectedDestination}
            schedules={filteredSchedules}
            onToggleGroupActive={onToggleGroupActive}
            onDeleteGroup={onDeleteGroup}
          />
        )}

      {activeFilter === 'weekday' &&
        selectedWeekday !== 'all' &&
        onToggleGroupActive &&
        onDeleteGroup && (
          <GroupActionBar
            groupName={`${WEEKDAY_LABELS[selectedWeekday]} 일정`}
            schedules={filteredSchedules}
            onToggleGroupActive={onToggleGroupActive}
            onDeleteGroup={onDeleteGroup}
          />
        )}

      {/* 일정 목록 */}
      <div className="space-y-4">
        {filteredSchedules.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-600 text-sm">
              {activeFilter === 'destination' && selectedDestination !== 'all'
                ? `${selectedDestination}에 해당하는 일정이 없습니다.`
                : activeFilter === 'weekday' && selectedWeekday !== 'all'
                ? `${WEEKDAY_LABELS[selectedWeekday]}에 해당하는 일정이 없습니다.`
                : '필터링된 일정이 없습니다.'}
            </p>
          </div>
        ) : (
          filteredSchedules.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              onDelete={onDeleteSchedule}
              onEdit={onEditSchedule}
              onToggleActive={onToggleActive}
              onTestAlarm={onTestAlarm}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ScheduleList;
