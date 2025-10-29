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
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const AvailabilityCard: React.FC<AvailabilityCardProps> = ({ availability, onEdit, onDelete }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col justify-between transition-all duration-200 ease-in-out hover:bg-gray-700 hover:scale-105">
      <div>
        <p className="font-bold text-lg text-white">{availability.week.name}</p>
        <p className="text-gray-300 mt-1">
          <strong>Hora desde: </strong> {availability.fromHour.name}
        </p>
        <p className="text-gray-300 mt-1">
          <strong>Hora hasta: </strong> {availability.untilHour.name}
        </p>
      </div>
      <div className="flex justify-end mt-4 space-x-2">
        <Button 
          onClick={() => onEdit(availability.id_availability)}
          variant="primary"
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
    </div>
  );
};

export default AvailabilityCard;
