import React from 'react';
import { Button } from '@/components/ui/Button'; // Import the Button component

interface Petition {
  id_petition: number;
  description: string;
  date_create: string;
  date_update: string;
  date_since: string;
  date_until: string;
  id_state: number;
  id_type_petition: number;
  id_type_provider: number;
  id_profession: number;
  id_customer: number;
  id_user_create: number;
  id_user_update: number;
  is_deleted: boolean;

  customers: {
    id_customer: number;
    user_id: number;
    dni: string;
    phone: string;
    address_id: number;
  };

  profession: {
    id_profession: number;
    name: string;
  };

  states: {
    id_state: number;
    state: string;
    description: string;
    code: string;
  };

  typePetitions: {
    id_type_petition: number;
    name: string;
  };

  typeProvider: {
    id_type_provider: number;
    name: string;
  };

  attachments?: {
    id_attachment: number;
    name: string;
    path: string;
  }[];
}

interface PetitionDetailProps {
  petition: Petition;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}
const PetitionDetail: React.FC<PetitionDetailProps> = ({ petition, onEdit, onDelete }) => {
  console.log('PetitionDetail Props:', petition);
  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Título y Estado */}
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            {petition.profession?.name || 'Sin título'}
          </h1>
          <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
            {petition.states?.state || 'Sin Estado'}
          </span>
        </div>

        {/* Descripción */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Descripción</h2>
          <p className="text-gray-600 whitespace-pre-wrap">{petition.description}</p>
        </div>

        {/* Información general */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-500">Tipo de Petición: </span>
            <span className="text-gray-800">{petition.typePetitions?.name}</span>
          </div>
          <div>
            <span className="font-medium text-gray-500">Tipo de Proveedor: </span>
            <span className="text-gray-800">{petition.typeProvider?.name}</span>
          </div>
          <div>
            <span className="font-medium text-gray-500">Desde: </span>
            <span className="text-gray-800">{new Date(petition.date_since).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="font-medium text-gray-500">Hasta: </span>
            <span className="text-gray-800">{new Date(petition.date_until).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="font-medium text-gray-500">Cliente DNI: </span>
            <span className="text-gray-800">{petition.customers?.dni}</span>
          </div>
          <div>
            <span className="font-medium text-gray-500">Teléfono: </span>
            <span className="text-gray-800">{petition.customers?.phone}</span>
          </div>
          <div>
            <span className="font-medium text-gray-500">Fecha de Creación: </span>
            <span className="text-gray-800">{new Date(petition.date_create).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="font-medium text-gray-500">Última Actualización: </span>
            <span className="text-gray-800">{new Date(petition.date_update).toLocaleDateString()}</span>
          </div>
          {petition.states?.description && (
            <div>
              <span className="font-medium text-gray-500">Descripción del Estado: </span>
              <span className="text-gray-800">{petition.states.description}</span>
            </div>
          )}
        </div>

        {/* Adjuntos */}
        {petition.attachments && petition.attachments.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-semibold text-gray-700 mb-2">Adjuntos</h3>
            <ul className="list-disc pl-6 text-gray-600">
              {petition.attachments.map((file) => (
                <li key={file.id_attachment}>
                  <a
                    href={file.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {file.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="mt-6 flex justify-end space-x-4">
          <Button
            onClick={() => onEdit(petition.id_petition)}
            variant="primary"
            className="bg-yellow-500 hover:bg-yellow-600"
            fullWidth={false}
          >
            Editar
          </Button>
          <Button
            onClick={() => onDelete(petition.id_petition)}
            variant="primary"
            className="bg-red-500 hover:bg-red-600"
            fullWidth={false}
          >
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PetitionDetail;