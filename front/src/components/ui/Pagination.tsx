'use client';

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, className = '' }) => {
  if (totalPages <= 1) {
    return null; // No mostrar paginación si solo hay una página
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className={`flex items-center justify-center gap-3 sm:gap-6 ${className} py-4`}>
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="flex items-center justify-center p-2 sm:px-4 sm:py-2 text-sm font-semibold text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm shadow-black/20"
        title="Anterior"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span className="hidden sm:inline">Anterior</span>
      </button>

      <div className="flex flex-col items-center">
        <span className="text-xs sm:text-sm font-medium text-gray-400">
          Página <span className="text-white font-bold">{currentPage}</span> de <span className="text-white font-bold">{totalPages}</span>
        </span>
      </div>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center p-2 sm:px-4 sm:py-2 text-sm font-semibold text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm shadow-black/20"
        title="Siguiente"
      >
        <span className="hidden sm:inline">Siguiente</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:ml-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
