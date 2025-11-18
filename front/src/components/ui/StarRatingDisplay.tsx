'use client';

import React from 'react';
import { FiStar } from 'react-icons/fi';

interface StarRatingDisplayProps {
  rating: number;
  totalStars?: number;
  size?: number;
}

const StarRatingDisplay: React.FC<StarRatingDisplayProps> = ({ rating, totalStars = 5, size = 20 }) => {
  return (
    <div className="flex items-center">
      {[...Array(totalStars)].map((_, index) => {
        const starNumber = index + 1;
        return (
          <FiStar key={starNumber} size={size} className={`transition-colors ${starNumber <= rating ? 'text-yellow-400 fill-current' : 'text-gray-500'}`} />
        );
      })}
    </div>
  );
};

export default StarRatingDisplay;