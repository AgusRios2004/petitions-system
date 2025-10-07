import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

export const ProviderCompletionForm = () => {
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    type_provider: '', // Placeholder
    profession: '',    // Placeholder
    description: '',
    country: '',       // Placeholder
    city: '',          // Placeholder
    street: '',        // Placeholder
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { // Check if user is logged in
      setError('Debes iniciar sesión para completar tu perfil.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const payload = {
        description: formData.description,
        id_user: user.id_user, // Associate with the current user
        id_type_provider: formData.type_provider,
        id_profession: formData.profession,
        // TODO: Enviar el ID de la dirección cuando los selects estén implementados
      };

      // Use POST to create the provider profile
      await api.post('/provider', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('¡Perfil de proveedor completado con éxito! Recarga la página para ver los cambios.');
      // TODO: Refresh user state in AuthContext

    } catch (err: any) {
      console.error('Error creating provider profile:', err);
      setError(err.response?.data?.message || 'Ocurrió un error al guardar. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg text-white">
      <h2 className="text-2xl font-bold mb-4">Completar Perfil de Proveedor</h2>
      <p className="mb-6 text-gray-400">Completa tu perfil para que los clientes puedan encontrarte.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="type_provider" className="block text-sm font-medium text-gray-300 mb-1">Tipo de Proveedor</label>
          <select id="type_provider" name="type_provider" disabled={isLoading} className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            <option value="">Selecciona un tipo...</option>
            <option value="1">Profesional</option>
            <option value="2">Técnico</option>
            <option value="3">Oficio</option>
          </select>
        </div>

        <div>
          <label htmlFor="profession" className="block text-sm font-medium text-gray-300 mb-1">Profesión</label>
          <select id="profession" name="profession" disabled={isLoading} className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            <option value="">Selecciona una profesión...</option>
            <option value="10">Abogado</option>
            <option value="11">Plomero</option>
            <option value="12">Diseñador Gráfico</option>
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Descripción de tus servicios</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe brevemente tu experiencia, qué servicios ofreces y qué te diferencia."
            disabled={isLoading}
          ></textarea>
        </div>

        <h3 className="text-lg font-semibold pt-4 border-t border-gray-700">Dirección de Trabajo</h3>
        
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-1">País</label>
          <select id="country" name="country" disabled={isLoading} className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            <option value="">Selecciona un país...</option>
            <option value="AR">Argentina</option>
          </select>
        </div>

        <div>
          <label htmlFor="province" className="block text-sm font-medium text-gray-300 mb-1">Provincia / Estado</label>
          <select id="province" name="province" disabled={isLoading} className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            <option value="">Selecciona una provincia...</option>
            <option value="B">Buenos Aires</option>
          </select>
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">Ciudad</label>
          <select id="city" name="city" disabled={isLoading} className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            <option value="">Selecciona una ciudad...</option>
            <option value="CABA">Ciudad Autónoma de Buenos Aires</option>
          </select>
        </div>

        <div>
          <label htmlFor="street" className="block text-sm font-medium text-gray-300 mb-1">Calle y Número</label>
          <Input
            id="street"
            name="street"
            value={formData.street}
            onChange={handleChange}
            placeholder="Ej: Av. Corrientes 1234"
            required
            disabled={isLoading}
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="pt-4">
          <Button type="submit" disabled={isLoading || authLoading}>
            {isLoading ? 'Guardando...' : 'Guardar y Continuar'}
          </Button>
        </div>
      </form>
    </div>
  );
};
