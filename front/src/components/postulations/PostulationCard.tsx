import React from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { IPostulation } from '@/types/common';

interface PostulationCardProps {
  postulation: IPostulation;  
}

const PostulationCard: React.FC<PostulationCardProps> = ({ postulation }) => {
  console.log(postulation)
  return (
    <div className="bg-gray-800 shadow-md rounded-lg p-4 border border-gray-700 text-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-lg font-semibold text-white">
            {postulation.createdBy.name} {postulation.createdBy.lastname}
          </p>
          <p className="text-sm text-gray-300 mt-2">{postulation.petition.description.substring(0, 50)}...</p>
          <p className="text-sm text-gray-200 mt-1">Propuesta: {postulation.proposal}</p>
          <p className="text-sm font-bold text-white mt-1">Costo: ${postulation.cost}</p>
        </div>
        <div className="text-right">
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${postulation.states.state === 'Activo' ? 'bg-green-700 text-green-100' : 'bg-yellow-700 text-yellow-100'}`}>
            {postulation.states.state}
          </span>
          {postulation.winner && (
            <span className="mt-2 inline-block text-sm font-semibold px-3 py-1 rounded-full bg-blue-700 text-blue-100">
              Ganador
            </span>
          )}
        </div>
      </div>
      <div className='flex justify-end mt-4'>
        <Link href={`/postulation/${postulation.id_postulation}`}>
          <Button variant='secondary' fullWidth={false} >Ver detalles</Button>
        </Link>
      </div>
      <div className="text-right text-xs text-gray-400 mt-4">
        Postulado el: {new Date(postulation.date_create).toLocaleDateString()}
      </div>
    </div>
  );
};

export default PostulationCard;
