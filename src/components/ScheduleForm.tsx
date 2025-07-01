import React, { useState } from 'react';
import { Plus, Bus, Car, Bike, MapPin, Calendar, Clock } from 'lucide-react';
import { TransportType, Weekday, WEEKDAY_LABELS } from '@/types/schedule';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ScheduleFormProps {
  onSubmit: (destination: string, arrivalTime: string, transportType: TransportType, preparationTime: number, weekdays?: Weekday[], selectedDates?: Date[]) => void;
  initialData?: {
    destination: string;
    arrivalTime: string;
    transportType: TransportType;
    preparationTime: number;
    weekdays?: Weekday[];
    selectedDates?: Date[];
  };
  submitLabel?: string;
}

const transportOptions = [
  { value: 'subway' as TransportType, label: '지하철', icon: Bus }, // Using Bus icon for subway
  { value: 'bus' as TransportType, label: '버스', icon: Bus },
  { value: 'car' as TransportType, label: '자동차', icon: Car },
  { value: 'bicycle' as TransportType, label: '자전거', icon: Bike },
  { value: 'walk' as TransportType, label: '도보', icon: MapPin }, // Using MapPin for walk
];

const popularDestinations = [
  '행성대학교',
  '강남역',
  '홍대입구',
  '신촌'
];

const ScheduleForm: React.FC<ScheduleFormProps> = ({ 
  onSubmit, 
  initialData,
  submitLabel = '일정 등록'
}) => {
  const [destination, setDestination] = useState(initialData?.destination || '');
  const [arrivalTime, setArrivalTime] = useState(initialData?.arrivalTime || '');
  const [transportType, setTransportType] = useState<TransportType>(initialData?.transportType || 'subway');
  const [preparationTime, setPreparationTime] = useState(initialData?.preparationTime || 30);
  const [selectedWeekdays, setSelectedWeekdays] = useState<Weekday[]>(initialData?.weekdays || []);
  const [selectedDates, setSelectedDates] = useState<Date[]>(initialData?.selectedDates || []);
  const [scheduleType, setScheduleType] = useState<'one-time' | 'recurring'>('one-time');

  const handleWeekdayToggle = (weekday: Weekday) => {
    setSelectedWeekdays(prev => 
      prev.includes(weekday)
        ? prev.filter(w => w !== weekday)
        : [...prev, weekday]
    );
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    setSelectedDates(prev => {
      const dateStr = date.toDateString();
      const exists = prev.some(d => d.toDateString() === dateStr);
      
      if (exists) {
        return prev.filter(d => d.toDateString() !== dateStr);
      } else {
        return [...prev, date];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!destination.trim() || !arrivalTime) {
      alert('도착지와 도착 시간을 모두 입력해주세요.');
      return;
    }

    // 일회성 일정인 경우 날짜 선택 필수
    if (scheduleType === 'one-time' && selectedDates.length === 0) {
      alert('일정 날짜를 선택해주세요.');
      return;
    }

    // 반복 일정인 경우 요일 선택 필수
    if (scheduleType === 'recurring' && selectedWeekdays.length === 0) {
      alert('반복할 요일을 선택해주세요.');
      return;
    }

    console.log('Form submitted:', { 
      destination, 
      arrivalTime, 
      transportType, 
      preparationTime, 
      weekdays: scheduleType === 'recurring' ? selectedWeekdays : undefined,
      selectedDates: scheduleType === 'one-time' ? selectedDates : undefined
    });
    
    onSubmit(
      destination.trim(), 
      arrivalTime, 
      transportType, 
      preparationTime, 
      scheduleType === 'recurring' ? selectedWeekdays : undefined,
      scheduleType === 'one-time' ? selectedDates : undefined
    );
    
    // Reset form if it's not editing
    if (!initialData) {
      setDestination('');
      setArrivalTime('');
      setTransportType('subway');
      setPreparationTime(30);
      setSelectedWeekdays([]);
      setSelectedDates([]);
      setScheduleType('one-time');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">새 일정 등록</h2>
      
      <div className="space-y-2">
        <Label htmlFor="destination">도착지</Label>
        <Input
          id="destination"
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="예: 행성대학교, 강남역"
          className="w-full"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {popularDestinations.map((place) => (
            <Button
              key={place}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDestination(place)}
              className="text-xs"
            >
              {place}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="arrivalTime">도착 시간</Label>
        <Input
          id="arrivalTime"
          type="time"
          value={arrivalTime}
          onChange={(e) => setArrivalTime(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label>이동 수단</Label>
        <Select value={transportType} onValueChange={(value: TransportType) => setTransportType(value)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {transportOptions.map((option) => {
              const Icon = option.icon;
              return (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center space-x-2">
                    <Icon size={16} />
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="preparationTime">준비 시간 (분)</Label>
        <Input
          id="preparationTime"
          type="number"
          min="5"
          max="120"
          step="5"
          value={preparationTime}
          onChange={(e) => setPreparationTime(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="space-y-4">
        <Label>일정 유형</Label>
        <div className="flex gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="one-time"
              name="scheduleType"
              value="one-time"
              checked={scheduleType === 'one-time'}
              onChange={(e) => setScheduleType(e.target.value as 'one-time' | 'recurring')}
              className="text-blue-600"
            />
            <Label htmlFor="one-time" className="cursor-pointer">일회성</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="recurring"
              name="scheduleType"
              value="recurring"
              checked={scheduleType === 'recurring'}
              onChange={(e) => setScheduleType(e.target.value as 'one-time' | 'recurring')}
              className="text-blue-600"
            />
            <Label htmlFor="recurring" className="cursor-pointer">반복</Label>
          </div>
        </div>
      </div>

      {scheduleType === 'one-time' && (
        <div className="space-y-2">
          <Label>일정 날짜</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {selectedDates.length > 0 
                  ? `${selectedDates.length}개 날짜 선택됨`
                  : "날짜를 선택하세요"
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="multiple"
                selected={selectedDates}
                onSelect={(dates) => {
                  if (dates) {
                    setSelectedDates(Array.isArray(dates) ? dates : [dates]);
                  }
                }}
                initialFocus
                locale={ko}
                className="rounded-md border"
              />
            </PopoverContent>
          </Popover>
          {selectedDates.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedDates.map((date, index) => (
                <div key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {format(date, 'MM/dd (E)', { locale: ko })}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {scheduleType === 'recurring' && (
        <div className="space-y-2">
          <Label>반복 요일</Label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(WEEKDAY_LABELS) as Weekday[]).map((weekday) => (
              <div key={weekday} className="flex items-center space-x-2">
                <Checkbox
                  id={weekday}
                  checked={selectedWeekdays.includes(weekday)}
                  onCheckedChange={() => handleWeekdayToggle(weekday)}
                />
                <Label htmlFor={weekday} className="text-sm cursor-pointer">
                  {WEEKDAY_LABELS[weekday]}
                </Label>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedWeekdays(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'])}
              className="text-xs"
            >
              평일
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedWeekdays(['saturday', 'sunday'])}
              className="text-xs"
            >
              주말
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedWeekdays(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])}
              className="text-xs"
            >
              매일
            </Button>
          </div>
        </div>
      )}

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
        <Plus className="w-4 h-4 mr-2" />
        {submitLabel}
      </Button>
    </form>
  );
};

export default ScheduleForm;
