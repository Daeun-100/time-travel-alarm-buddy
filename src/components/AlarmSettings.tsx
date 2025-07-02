import React from 'react';
import { Bell, Clock, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface AlarmSettingsProps {
  advanceAlarm: {
    enabled: boolean;
    minutes: number;
  };
  preparationAdvanceAlarm: {
    enabled: boolean;
    minutes: number;
  };
  onAdvanceAlarmChange: (enabled: boolean, minutes: number) => void;
  onPreparationAdvanceAlarmChange: (enabled: boolean, minutes: number) => void;
  onTestAlarm?: () => Promise<void>;
  className?: string;
}

const AlarmSettings: React.FC<AlarmSettingsProps> = ({
  advanceAlarm,
  preparationAdvanceAlarm,
  onAdvanceAlarmChange,
  onPreparationAdvanceAlarmChange,
  onTestAlarm,
  className = '',
}) => {
  const handleAdvanceAlarmToggle = (enabled: boolean) => {
    onAdvanceAlarmChange(enabled, advanceAlarm.minutes);
  };

  const handleAdvanceAlarmMinutesChange = (minutes: number) => {
    onAdvanceAlarmChange(advanceAlarm.enabled, minutes);
  };

  const handlePreparationAdvanceAlarmToggle = (enabled: boolean) => {
    onPreparationAdvanceAlarmChange(enabled, preparationAdvanceAlarm.minutes);
  };

  const handlePreparationAdvanceAlarmMinutesChange = (minutes: number) => {
    onPreparationAdvanceAlarmChange(preparationAdvanceAlarm.enabled, minutes);
  };

  return (
    <Card className={`bg-white border border-gray-200 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Bell className="text-blue-600" size={20} />
          <span>알람 설정</span>
        </CardTitle>
        <CardDescription>
          일정별 알람을 어떻게 받을지 설정하세요
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 기본 알람 정보 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Clock className="text-green-600" size={16} />
            <span className="font-medium text-gray-900">기본 알람</span>
          </div>
          <div className="ml-6 space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>준비 시작 시간 알람</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>출발 시간 알람</span>
            </div>
          </div>
        </div>

        {/* 준비 사전 알림 설정 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-green-600" size={16} />
            <span className="font-medium text-gray-900">준비 사전 알림</span>
          </div>

          <div className="ml-6 space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="preparationAdvanceAlarm"
                checked={preparationAdvanceAlarm.enabled}
                onCheckedChange={handlePreparationAdvanceAlarmToggle}
              />
              <Label
                htmlFor="preparationAdvanceAlarm"
                className="cursor-pointer text-sm"
              >
                준비 시작 시간보다 미리 알림받기
              </Label>
            </div>

            {preparationAdvanceAlarm.enabled && (
              <div className="space-y-2 pl-6">
                <Label
                  htmlFor="preparationAdvanceAlarmMinutes"
                  className="text-sm"
                >
                  몇 분 전에 알림받을까요?
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="preparationAdvanceAlarmMinutes"
                    type="number"
                    min="5"
                    max="60"
                    step="5"
                    value={preparationAdvanceAlarm.minutes}
                    onChange={(e) =>
                      handlePreparationAdvanceAlarmMinutesChange(
                        Number(e.target.value)
                      )
                    }
                    className="w-20"
                  />
                  <span className="text-sm text-gray-600">분 전</span>
                </div>
                <p className="text-xs text-gray-500">
                  💡 준비 시작 전에 미리 알림을 받아 여유있게 준비하세요
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 사전 알림 설정 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-orange-600" size={16} />
            <span className="font-medium text-gray-900">출발 사전 알림</span>
          </div>

          <div className="ml-6 space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="advanceAlarm"
                checked={advanceAlarm.enabled}
                onCheckedChange={handleAdvanceAlarmToggle}
              />
              <Label htmlFor="advanceAlarm" className="cursor-pointer text-sm">
                출발 시간보다 미리 알림받기
              </Label>
            </div>

            {advanceAlarm.enabled && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="advanceAlarmMinutes" className="text-sm">
                  몇 분 전에 알림받을까요?
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="advanceAlarmMinutes"
                    type="number"
                    min="5"
                    max="60"
                    step="5"
                    value={advanceAlarm.minutes}
                    onChange={(e) =>
                      handleAdvanceAlarmMinutesChange(Number(e.target.value))
                    }
                    className="w-20"
                  />
                  <span className="text-sm text-gray-600">분 전</span>
                </div>
                <p className="text-xs text-gray-500">
                  💡 출발 전에 미리 알림을 받아 여유있게 준비하세요
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 알림 방식 정보 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Info className="text-purple-600" size={16} />
            <span className="font-medium text-gray-900">알림 방식</span>
          </div>
          <div className="ml-6 space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>브라우저 알림</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>알람 소리</span>
            </div>
          </div>
        </div>

        {/* 테스트 버튼 */}
        {onTestAlarm && (
          <div className="pt-4 border-t border-gray-100">
            <Button
              onClick={onTestAlarm}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Bell size={14} className="mr-2" />
              알람 테스트
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlarmSettings;
