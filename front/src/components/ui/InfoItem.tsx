import React from 'react';

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

export const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => (
  <div className="flex items-start space-x-3">
    <div className="text-blue-400 mt-1">{icon}</div>
    <div>
      <p className="font-semibold text-gray-400">{label}</p>
      <p className="text-white">{value}</p>
    </div>
  </div>
);
