
import React from 'react';
import { Clock, Coffee, ArrowRight } from 'lucide-react';

interface TimeDisplayProps {
  preparationStartTime: string;
  departureTime: string;
  arrivalTime: string;
  className?: string;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({
  preparationStartTime,
  departureTime,
  arrivalTime,
  className = ''
}) => {
  return (
    <div className={`bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border ${className}`}>
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-2 text-amber-700">
          <Coffee size={16} />
          <div className="text-center">
            <div className="text-xs text-gray-600">준비 시작</div>
            <div className="font-bold text-lg">{preparationStartTime}</div>
          </div>
        </div>
        
        <ArrowRight size={16} className="text-gray-400" />
        
        <div className="flex items-center space-x-2 text-blue-700">
          <Clock size={16} />
          <div className="text-center">
            <div className="text-xs text-gray-600">출발</div>
            <div className="font-bold text-lg">{departureTime}</div>
          </div>
        </div>
        
        <ArrowRight size={16} className="text-gray-400" />
        
        <div className="flex items-center space-x-2 text-green-700">
          <Clock size={16} />
          <div className="text-center">
            <div className="text-xs text-gray-600">도착</div>
            <div className="font-bold text-lg">{arrivalTime}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeDisplay;
