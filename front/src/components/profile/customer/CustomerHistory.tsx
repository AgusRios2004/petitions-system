'use client';

import React from 'react';
import { ICustomer } from '@/types/common'; // Import ICustomer

interface CustomerHistoryProps {
  customer: ICustomer; // Now receives the detailed ICustomer object
}

const CustomerHistory: React.FC<CustomerHistoryProps> = ({ customer }) => {
  return (
    <div className="p-4">
      <h3 className="text-2xl font-bold text-white mb-4">Historial y Calificaciones</h3>
    </div>
  );
};

export default CustomerHistory;
