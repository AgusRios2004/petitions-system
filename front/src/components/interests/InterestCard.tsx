'use client';

import React from 'react';
import { cn } from '@/lib/utils'; // Asumo que tienes una utilidad para clases condicionales como en shadcn/ui

interface InterestCardProps {
  name: string;
  isSelected: boolean;
  onClick: () => void;
}

export const InterestCard: React.FC<InterestCardProps> = ({ name, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 border-2 rounded-lg cursor-pointer transition-all duration-200',
        'bg-gray-700 hover:bg-gray-600',
        isSelected
          ? 'border-sky-500 ring-2 ring-sky-500'
          : 'border-gray-600 hover:border-gray-500'
      )}
    >
      <h4 className="text-md font-semibold text-white text-center">{name}</h4>
    </div>
  );
};
