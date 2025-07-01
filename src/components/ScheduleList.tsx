
import React from 'react';
import { Schedule } from '@/types/schedule';
import ScheduleCard from './ScheduleCard';
import { Calendar } from 'lucide-react';

interface ScheduleListProps {
  schedules: Schedule[];
  onDeleteSchedule: (id: string) => void;
  onEditSchedule?: (schedule: Schedule) => void;
}

const ScheduleList: React.FC<ScheduleListProps> = ({ 
  schedules, 
  onDeleteSchedule, 
  onEditSchedule 
}) => {
  if (schedules.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 일정이 없습니다</h3>
        <p className="text-gray-600">새 일정을 등록하여 지각 방지 알람을 받아보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">내 일정</h2>
      {schedules.map((schedule) => (
        <ScheduleCard
          key={schedule.id}
          schedule={schedule}
          onDelete={onDeleteSchedule}
          onEdit={onEditSchedule}
        />
      ))}
    </div>
  );
};

export default ScheduleList;
