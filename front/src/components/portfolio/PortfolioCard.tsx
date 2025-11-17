'use client';

import React from 'react';
import { FiFileText, FiDownload, FiTrash2 } from 'react-icons/fi';
import { IPortfolioItem } from '@/types/common';
import { Button } from '@/components/ui/Button';

interface PortfolioCardProps {
  item: IPortfolioItem;
  isOwner: boolean;
  onDelete: (id_portfolio: number) => void;
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({ item, isOwner, onDelete }) => {
  return (
    <div className="bg-gray-700/90 backdrop-blur-md shadow-lg shadow-black/40 rounded-2xl p-6 mb-8 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-white text-lg">{item.name}</h3>
          <p className="text-gray-400 mb-2">{item.description}</p>
        </div>
        {isOwner && (
          <Button
            onClick={() => onDelete(item.id_portfolio)}
            variant="destructive"
            size="sm"
            fullWidth={false}
            className="!px-3 !py-2 rounded-md w-auto h-auto flex items-center justify-center"
          >
            <FiTrash2 size={18} />
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {item.attachments && item.attachments.length > 0 ? (
          item.attachments.map((file, fileIndex) => (
            <a
              key={fileIndex}
              href={`http://localhost:3001/uploads/${file.path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-700 hover:bg-slate-600 text-cyan-400 px-3 py-1 rounded text-sm flex items-center gap-2 transition-colors"
            >
              <FiFileText />
              {file.name}
              <FiDownload className="ml-2" />
            </a>
          ))
        ) : (
          <span className="text-gray-500 text-xs italic">Sin archivos adjuntos</span>
        )}
      </div>
    </div>
  );
};

export default PortfolioCard;
