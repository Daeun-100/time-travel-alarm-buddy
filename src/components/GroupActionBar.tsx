import React from 'react';
import { Settings, Play, Pause, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Schedule } from '@/types/schedule';

interface GroupActionBarProps {
  groupName: string;
  schedules: Schedule[];
  onToggleGroupActive: (scheduleIds: string[], active: boolean) => void;
  onDeleteGroup: (scheduleIds: string[]) => void;
  className?: string;
}

const GroupActionBar: React.FC<GroupActionBarProps> = ({
  groupName,
  schedules,
  onToggleGroupActive,
  onDeleteGroup,
  className = ''
}) => {
  const activeCount = schedules.filter(s => s.isActive !== false).length;
  const totalCount = schedules.length;
  const isAllActive = activeCount === totalCount;
  const isAllInactive = activeCount === 0;

  const handleToggleAll = () => {
    const scheduleIds = schedules.map(s => s.id);
    onToggleGroupActive(scheduleIds, !isAllActive);
  };

  const handleDeleteAll = () => {
    if (window.confirm(`${groupName}의 모든 일정(${totalCount}개)을 삭제하시겠습니까?`)) {
      const scheduleIds = schedules.map(s => s.id);
      onDeleteGroup(scheduleIds);
    }
  };

  return (
    <div className={`flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
      <div className="flex items-center space-x-3">
        <Settings className="text-blue-600" size={16} />
        <div>
          <h4 className="text-sm font-medium text-blue-900">{groupName}</h4>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {activeCount}/{totalCount} 활성
            </Badge>
            <span className="text-xs text-blue-600">
              {schedules.length}개 일정
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleAll}
          className={`flex items-center space-x-1 ${
            isAllActive 
              ? 'text-orange-600 border-orange-200 hover:bg-orange-50' 
              : 'text-green-600 border-green-200 hover:bg-green-50'
          }`}
        >
          {isAllActive ? (
            <>
              <Pause size={14} />
              <span>전체 비활성화</span>
            </>
          ) : (
            <>
              <Play size={14} />
              <span>전체 활성화</span>
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDeleteAll}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <Trash2 size={14} />
          <span className="ml-1">전체 삭제</span>
        </Button>
      </div>
    </div>
  );
};

export default GroupActionBar; 