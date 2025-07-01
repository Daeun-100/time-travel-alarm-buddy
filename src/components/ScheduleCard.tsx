
import React from 'react';
import { Trash2, Edit, MapPin, Subway, Bus, Car, Bike, FootPrints } from 'lucide-react';
import { Schedule } from '@/types/schedule';
import TimeDisplay from './TimeDisplay';
import { Button } from '@/components/ui/button';

interface ScheduleCardProps {
  schedule: Schedule;
  onDelete: (id: string) => void;
  onEdit?: (schedule: Schedule) => void;
}

const transportIcons = {
  subway: Subway,
  bus: Bus,
  car: Car,
  bicycle: Bike,
  walk: FootPrints
};

const transportLabels = {
  subway: '지하철',
  bus: '버스',
  car: '자동차',
  bicycle: '자전거',
  walk: '도보'
};

const ScheduleCard: React.FC<ScheduleCardProps> = ({ schedule, onDelete, onEdit }) => {
  const TransportIcon = transportIcons[schedule.transportType];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <MapPin className="text-green-600" size={20} />
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{schedule.destination}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
              <TransportIcon size={16} />
              <span>{transportLabels[schedule.transportType]}</span>
              <span>•</span>
              <span>준비시간 {schedule.preparationTime}분</span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
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
    </div>
  );
};

export default ScheduleCard;
