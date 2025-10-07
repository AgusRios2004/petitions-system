import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// Crear una instancia de Axios para nuestra API
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

export const CustomerCompletionForm = () => {
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    dni: '',
    phone: '',
    country: '', // Placeholder
    city: '',    // Placeholder
    street: '',  // Placeholder
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        dni: formData.dni,
        phone: formData.phone,
        id_user: user.id_user, // Associate with the current user
        // TODO: Enviar el ID de la dirección cuando los selects estén implementados
      };

      // Use POST to create the customer profile, as it doesn't exist yet
      await api.post('/customer', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('¡Perfil de cliente completado con éxito! Recarga la página para ver los cambios.');
      // TODO: Idealmente, se debería refrescar el estado del usuario en AuthContext aquí
      // para que la UI se actualice sin necesidad de recargar la página.

    } catch (err: any) {
      console.error('Error creating customer profile:', err);
      setError(err.response?.data?.message || 'Ocurrió un error al guardar. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg text-white">
      <h2 className="text-2xl font-bold mb-4">Completar Perfil de Cliente</h2>
      <p className="mb-6 text-gray-400">Necesitamos algunos datos adicionales para completar tu perfil de cliente.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="dni" className="block text-sm font-medium text-gray-300 mb-1">
            DNI o Documento de Identidad
          </label>
          <Input
            id="dni"
            name="dni"
            value={formData.dni}
            onChange={handleChange}
            placeholder="Ingresa tu número de documento"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
            Teléfono
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Ingresa tu número de teléfono"
            required
            disabled={isLoading}
          />
        </div>
        
        <h3 className="text-lg font-semibold pt-4 border-t border-gray-700">Dirección</h3>
        
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-1">País</label>
          <select id="country" name="country" disabled={isLoading} className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            <option value="">Selecciona un país...</option>
            <option value="AR">Argentina</option>
            <option value="CO">Colombia</option>
            <option value="MX">México</option>
          </select>
        </div>

        <div>
          <label htmlFor="province" className="block text-sm font-medium text-gray-300 mb-1">Provincia / Estado</label>
          <select id="province" name="province" disabled={isLoading} className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            <option value="">Selecciona una provincia...</option>
            <option value="B">Buenos Aires</option>
            <option value="C">Córdoba</option>
          </select>
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">Ciudad</label>
          <select id="city" name="city" disabled={isLoading} className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            <option value="">Selecciona una ciudad...</option>
            <option value="CABA">Ciudad Autónoma de Buenos Aires</option>
            <option value="LP">La Plata</option>
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
