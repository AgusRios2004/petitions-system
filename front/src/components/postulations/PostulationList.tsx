import React from 'react';
import PostulationCard from './PostulationCard';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Postulation {
  id_postulation: number;
  proposal: string;
  cost: number;
  winner: boolean;
  date_create: string;
  providers: {
    id_provider: number;
    users: {
      name: string;
      lastname: string;
    };
  };
  states: {
    state: string;
  };
  petition: {
    id_petition: number;
    description: string;
  };
}

interface PostulationListProps {
  postulations: Postulation[];
  role: 'provider' | 'customer';
}

const PostulationList: React.FC<PostulationListProps> = ({ postulations, role }) => {
  if (postulations.length === 0) {
    const message = role === 'provider' 
      ? "No hay postulaciones realizadas."
      : "No hay postulaciones para esta petición.";
    return <p className="text-gray-500">{message}</p>;
  }

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Postulaciones</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {postulations.map((postulation) => (
          <PostulationCard key={postulation.id_postulation} postulation={postulation} />
        ))}
      </div>
    </div>
  );
};

export default PostulationList;
