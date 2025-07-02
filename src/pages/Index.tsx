import React, { useState } from 'react';
import { Clock, Plus, Bell } from 'lucide-react';
import { useSchedule } from '@/hooks/useSchedule';
import { useAlarm } from '@/hooks/useAlarm';
import ScheduleForm from '@/components/ScheduleForm';
import ScheduleList from '@/components/ScheduleList';
import AlarmSettings from '@/components/AlarmSettings';
import { Button } from '@/components/ui/button';
import { TransportType, Weekday, Schedule } from '@/types/schedule';

const Index = () => {
  const { schedules, addSchedule, deleteSchedule, updateSchedule, toggleScheduleActive, toggleGroupActive, deleteGroup } = useSchedule();
  const { testAlarm } = useAlarm(schedules);
  const [showForm, setShowForm] = useState(false);
  const [showAlarmSettings, setShowAlarmSettings] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  
  // 전역 알람 설정 (모든 일정에 적용)
  const [globalAdvanceAlarm, setGlobalAdvanceAlarm] = useState({
    enabled: false,
    minutes: 10
  });
  
  const [globalPreparationAdvanceAlarm, setGlobalPreparationAdvanceAlarm] = useState({
    enabled: false,
    minutes: 15
  });

  const handleAddSchedule = (
    origin: string,
    destination: string,
    arrivalTime: string,
    transportType: TransportType,
    preparationTime: number,
    weekdays?: Weekday[],
    selectedDates?: Date[]
  ) => {
    if (editingSchedule) {
      updateSchedule(editingSchedule.id, origin, destination, arrivalTime, transportType, preparationTime, weekdays, selectedDates);
      setEditingSchedule(null);
    } else {
      // 전역 알람 설정을 적용하여 일정 생성
      addSchedule(
        origin, 
        destination, 
        arrivalTime, 
        transportType, 
        preparationTime, 
        weekdays, 
        selectedDates, 
        globalAdvanceAlarm.enabled ? globalAdvanceAlarm : undefined,
        globalPreparationAdvanceAlarm.enabled ? globalPreparationAdvanceAlarm : undefined
      );
    }
    setShowForm(false);
  };

  const handleAdvanceAlarmChange = (enabled: boolean, minutes: number) => {
    setGlobalAdvanceAlarm({ enabled, minutes });
  };

  const handlePreparationAdvanceAlarmChange = (enabled: boolean, minutes: number) => {
    setGlobalPreparationAdvanceAlarm({ enabled, minutes });
  };

  const handleTestAlarm = (schedule: Schedule, type: 'preparation' | 'departure' | 'advance' | 'preparation-advance') => {
    testAlarm(schedule, type);
  };



  const handleTestGlobalAlarm = () => {
    // 임시 일정으로 전역 알람 테스트
    const testSchedule: Schedule = {
      id: 'test',
      origin: '잠실 루터회관',
      destination: '테스트 목적지',
      arrivalTime: '09:00',
      transportType: 'subway',
      preparationTime: 30,
      departureTime: '08:30',
      preparationStartTime: '08:00',
      advanceAlarm: globalAdvanceAlarm.enabled ? globalAdvanceAlarm : undefined,
      preparationAdvanceAlarm: globalPreparationAdvanceAlarm.enabled ? globalPreparationAdvanceAlarm : undefined,
      isActive: true,
      createdAt: new Date()
    };
    
    if (globalPreparationAdvanceAlarm.enabled) {
      testAlarm(testSchedule, 'preparation-advance');
    } else if (globalAdvanceAlarm.enabled) {
      testAlarm(testSchedule, 'advance');
    } else {
      testAlarm(testSchedule, 'departure');
    }
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingSchedule(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Clock className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">지각 방지 알람</h1>
                <p className="text-gray-600 text-sm">도착 시간만 입력하면 출발 알람을 자동 계산</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAlarmSettings(!showAlarmSettings)}
                className="text-xs"
              >
                <Bell size={14} className="mr-1" />
                {showAlarmSettings ? '알람 설정 닫기' : '알람 설정'}
              </Button>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Bell size={16} />
                <span>총 {schedules.length}개 일정</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Form & Settings */}
          <div className="space-y-6">
            {/* 알람 설정 섹션 */}
            {showAlarmSettings && (
              <AlarmSettings
                advanceAlarm={globalAdvanceAlarm}
                preparationAdvanceAlarm={globalPreparationAdvanceAlarm}
                onAdvanceAlarmChange={handleAdvanceAlarmChange}
                onPreparationAdvanceAlarmChange={handlePreparationAdvanceAlarmChange}
                onTestAlarm={handleTestGlobalAlarm}
              />
            )}
            {!showForm ? (
              <div className="text-center py-8">
                <Button 
                  onClick={() => setShowForm(true)}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  새 일정 등록
                </Button>
                <p className="text-gray-600 mt-4 text-sm">
                  도착지와 시간을 입력하면<br />
                  자동으로 출발 시간을 계산해드려요
                </p>
              </div>
            ) : (
              <div>
                <ScheduleForm 
                  onSubmit={handleAddSchedule}
                  initialData={editingSchedule ? {
                    origin: editingSchedule.origin,
                    destination: editingSchedule.destination,
                    arrivalTime: editingSchedule.arrivalTime,
                    transportType: editingSchedule.transportType,
                    preparationTime: editingSchedule.preparationTime,
                    weekdays: editingSchedule.weekdays,
                    selectedDates: editingSchedule.selectedDates,
                    advanceAlarm: editingSchedule.advanceAlarm,
                    advanceAlarm: editingSchedule.advanceAlarm
                  } : undefined}
                  submitLabel={editingSchedule ? '일정 수정' : '일정 등록'}
                />
                <Button 
                  variant="ghost" 
                  onClick={handleCancelEdit}
                  className="w-full mt-4 text-gray-600"
                >
                  취소
                </Button>
              </div>
            )}

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📍 현재 위치</h3>
              <p className="text-blue-800 text-sm">잠실 루터회관</p>
              <p className="text-blue-600 text-xs mt-1">
                이 위치에서 출발하는 것으로 계산됩니다
              </p>
            </div>

            {/* Traffic Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">🚇 교통 정보</h3>
              <div className="text-green-800 text-xs space-y-1">
                <div>• 실시간 교통상황 반영</div>
                <div>• 아침/저녁 러시아워 고려</div>
                <div>• 지연 시간 자동 추가</div>
              </div>
            </div>

            {/* 알람 설정 안내 */}
            {!showAlarmSettings && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-900 mb-2">🔔 알람 설정</h3>
                <div className="text-orange-800 text-xs space-y-1">
                  <div>• 기본 알람: 준비 시작, 출발 시간</div>
                  <div>• 준비 사전 알림: 준비 시작 전 미리 알림</div>
                  <div>• 출발 사전 알림: 출발 전 미리 알림</div>
                  <div>• 브라우저 알림 + 소리</div>
                  <div>• 각 일정별 활성화/비활성화</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAlarmSettings(true)}
                  className="mt-3 w-full text-xs"
                >
                  <Bell size={12} className="mr-1" />
                  알람 설정하기
                </Button>
              </div>
            )}
          </div>

          {/* Right Column - Schedule List */}
          <div>
            <ScheduleList 
              schedules={schedules}
              onDeleteSchedule={deleteSchedule}
              onEditSchedule={handleEditSchedule}
              onToggleActive={toggleScheduleActive}
              onTestAlarm={handleTestAlarm}
              onToggleGroupActive={toggleGroupActive}
              onDeleteGroup={deleteGroup}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-600 text-sm">
          <p>⏰ 더 이상 지각하지 마세요! 스마트한 교통 알람으로 시간을 정확히 관리하세요.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
