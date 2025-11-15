import React from 'react';
import { IconType } from 'react-icons';

interface InfoRowProps {
  icon: IconType;
  label: string;
  children: React.ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon: Icon, label, children }) => (
  <div className="flex items-center gap-2 mb-2">
    <Icon className="text-blue-400" size={20} />
    <span className="font-bold text-gray-200">{label}:</span>
    <div className="text-gray-300">{children}</div>
  </div>
);

export default InfoRow;
