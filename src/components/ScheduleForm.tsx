
import React, { useState } from 'react';
import { Plus, Subway, Bus, Car, Bike, FootPrints } from 'lucide-react';
import { TransportType } from '@/types/schedule';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ScheduleFormProps {
  onSubmit: (destination: string, arrivalTime: string, transportType: TransportType, preparationTime: number) => void;
  initialData?: {
    destination: string;
    arrivalTime: string;
    transportType: TransportType;
    preparationTime: number;
  };
  submitLabel?: string;
}

const transportOptions = [
  { value: 'subway' as TransportType, label: '지하철', icon: Subway },
  { value: 'bus' as TransportType, label: '버스', icon: Bus },
  { value: 'car' as TransportType, label: '자동차', icon: Car },
  { value: 'bicycle' as TransportType, label: '자전거', icon: Bike },
  { value: 'walk' as TransportType, label: '도보', icon: FootPrints },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!destination.trim() || !arrivalTime) {
      alert('도착지와 도착 시간을 모두 입력해주세요.');
      return;
    }

    console.log('Form submitted:', { destination, arrivalTime, transportType, preparationTime });
    onSubmit(destination.trim(), arrivalTime, transportType, preparationTime);
    
    // Reset form if it's not editing
    if (!initialData) {
      setDestination('');
      setArrivalTime('');
      setTransportType('subway');
      setPreparationTime(30);
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

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
        <Plus className="w-4 h-4 mr-2" />
        {submitLabel}
      </Button>
    </form>
  );
};

export default ScheduleForm;
