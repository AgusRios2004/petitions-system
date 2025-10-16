'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { getProfessions } from '@/service/professionsService';
import { getTypePetitions } from '@/service/typePetitionsService';
import { getTypeProviders } from '@/service/typeProviderService';

// Helper to format date for input[type='date']
const formatDateForInput = (date: string | Date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (`0${d.getMonth() + 1}`).slice(-2);
  const day = (`0${d.getDate()}`).slice(-2);
  return `${year}-${month}-${day}`;
};

interface Petition {
  id_petition: number;
  description: string;
  date_since: string;
  date_until: string;
  id_profession: number;
  id_type_petition: number;
  id_type_provider: number;
  id_customer: number;
  id_state: number;
  // other fields...
}

interface PetitionEditFormProps {
  petition: Petition;
  onSave: (formData: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const PetitionEditForm: React.FC<PetitionEditFormProps> = ({ petition, onSave, onCancel, isLoading }) => {
const [description, setDescription] = useState(petition.description);
  const [id_profession, setProfessionId] = useState(petition.id_profession);
  const [id_type_petition, setTypePetitionId] = useState(petition.id_type_petition);
  const [id_type_provider, setTypeProviderId] = useState(petition.id_type_provider);
  const [date_since, setDateSince] = useState(formatDateForInput(petition.date_since));
  const [date_until, setDateUntil] = useState(formatDateForInput(petition.date_until));

  // Queries to fetch data for select options
  const { data: professionsData } = useQuery({ queryKey: ['professions'], queryFn: getProfessions });
  const { data: typePetitionsData } = useQuery({ queryKey: ['typePetitions'], queryFn: getTypePetitions });
  const { data: typeProvidersData } = useQuery({ queryKey: ['typeProviders'], queryFn: getTypeProviders });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      description,
      id_profession,
      id_type_petition,
      id_type_provider,
      date_since,
      date_until,
      id_customer: petition.id_customer, 
      id_state: petition.id_state,
    });
  };

  const selectClassName = "w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:shadow-outline";

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleSave} className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar Petición</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profession */}
          <div>
            <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">Profesión</label>
            <select id="profession" value={id_profession} onChange={(e) => setProfessionId(Number(e.target.value))} className={selectClassName}>
              {professionsData?.data?.map(p => (
                <option key={p.id_profession} value={p.id_profession}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Petition Type */}
          <div>
            <label htmlFor="type_petition" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Petición</label>
            <select id="type_petition" value={id_type_petition} onChange={(e) => setTypePetitionId(Number(e.target.value))} className={selectClassName}>
              {typePetitionsData?.data?.map(t => (
                <option key={t.id_type_petition} value={t.id_type_petition}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Provider Type */}
          <div>
            <label htmlFor="type_provider" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Proveedor</label>
            <select id="type_provider" value={id_type_provider} onChange={(e) => setTypeProviderId(Number(e.target.value))} className={selectClassName}>
              {typeProvidersData?.data?.map(t => (
                <option key={t.id_type_provider} value={t.id_type_provider}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Date Since */}
          <div>
            <label htmlFor="date_since" className="block text-sm font-medium text-gray-700 mb-1">Disponible Desde</label>
            <input type="date" id="date_since" value={date_since} onChange={(e) => setDateSince(e.target.value)} className={selectClassName} />
          </div>

          {/* Date Until */}
          <div>
            <label htmlFor="date_until" className="block text-sm font-medium text-gray-700 mb-1">Disponible Hasta</label>
            <input type="date" id="date_until" value={date_until} onChange={(e) => setDateUntil(e.target.value)} className={selectClassName} />
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:shadow-outline"
            rows={6}
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-4">
          <Button type="button" onClick={onCancel} variant="secondary" className="bg-gray-300 hover:bg-gray-400" fullWidth={false} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" className="bg-blue-500 hover:bg-blue-600" fullWidth={false} disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PetitionEditForm;