'use client';

interface StarRatingDisplayProps {
  rating: number;
  totalStars?: number;
  size?: number;
}

const StarRatingDisplay: React.FC<StarRatingDisplayProps> = ({ rating, totalStars = 5, size = 16 }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0; // Muestra una estrella completa si hay decimales
  const emptyStars = totalStars - fullStars - (halfStar ? 1 : 0);

  const starStyle = { fontSize: `${size}px` };

  return (
    <div className="flex items-center" style={{ lineHeight: 1 }}>
      {[...Array(fullStars)].map((_, i) => <span key={`full-${i}`} className="text-yellow-400" style={starStyle}>★</span>)}
      {halfStar && <span key="half" className="text-yellow-400" style={starStyle}>★</span>}
      {[...Array(emptyStars)].map((_, i) => <span key={`empty-${i}`} className="text-gray-400" style={starStyle}>☆</span>)}
    </div>
  );
};

export default StarRatingDisplay;