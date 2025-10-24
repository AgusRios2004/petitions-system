import React from 'react';
import PostulationCard from './PostulationCard';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { IPostulation } from '@/types/common';

interface PostulationListProps {
  postulations: IPostulation[];
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {postulations.map((postulation) => (
          <PostulationCard key={postulation.id_postulation} postulation={postulation} role={role} />
        ))}
      </div>
    </div>
  );
};

export default PostulationList;