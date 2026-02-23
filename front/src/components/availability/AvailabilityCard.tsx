'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

// Asumimos una interfaz para la disponibilidad, ajústala si es necesario
interface Availability {
  id_availability: number;
  week: {
    name: string;
  };
  fromHour: {
    name: string;
  };
  untilHour: {
    name: string;
  };
}

interface AvailabilityCardProps {
  availability: Availability;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  showControls?: boolean;
}

const AvailabilityCard: React.FC<AvailabilityCardProps> = ({ availability, onEdit, onDelete, showControls = true }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl shadow-lg flex flex-col justify-between transition-transform duration-300 ease-in-out hover:scale-105 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-xl font-bold text-white ml-3">{availability.week.name}</h3>
        </div>
        <div className="space-y-2 text-gray-300">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Desde <span className="font-semibold text-white">{availability.fromHour.name}</span></span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Hasta <span className="font-semibold text-white">{availability.untilHour.name}</span></span>
          </div>
        </div>
      </div>
      {showControls && onEdit && onDelete && (
        <div className="bg-gray-900/30 px-6 py-4 flex justify-end space-x-3 border-t border-gray-700/50">
          <Button 
            onClick={() => onEdit(availability.id_availability)}
            size="sm"
          >
            Editar
          </Button>
          <Button 
            onClick={() => onDelete(availability.id_availability)}
            variant="destructive"
            size="sm"
          >
            Eliminar
          </Button>
        </div>
      )}
    </div>
  );
};

export default AvailabilityCard;
