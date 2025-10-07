'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export const ProviderCompletionForm = () => {
  const [formData, setFormData] = useState({
    type_provider: '', // Será un select
    profession: '', // Será un select
    description: '',
    // Campos de dirección
    country: '',
    city: '',
    street: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para enviar datos a la API
    console.log('Provider data to submit:', formData);
    alert('Formulario de proveedor enviado (revisar consola)');
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg text-white">
      <h2 className="text-2xl font-bold mb-4">Completar Perfil de Proveedor</h2>
      <p className="mb-6 text-gray-400">Completa tu perfil para que los clientes puedan encontrarte.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Estos serán reemplazados por Selects más adelante */}
        <Input
          label="Tipo de Proveedor"
          name="type_provider"
          value={formData.type_provider}
          onChange={handleChange}
          placeholder="Ej: Profesional, Técnico, Oficio"
          required
        />
        <Input
          label="Profesión"
          name="profession"
          value={formData.profession}
          onChange={handleChange}
          placeholder="Ej: Plomero, Abogado, Diseñador Gráfico"
          required
        />
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
          ></textarea>
        </div>

        <h3 className="text-lg font-semibold pt-4 border-t border-gray-700">Dirección de Trabajo</h3>
        <Input
          label="País"
          name="country"
          value={formData.country}
          onChange={handleChange}
          placeholder="Ej: Argentina"
          required
        />
        <Input
          label="Ciudad"
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="Ej: Buenos Aires"
          required
        />
        <Input
          label="Calle y Número"
          name="street"
          value={formData.street}
          onChange={handleChange}
          placeholder="Ej: Av. Corrientes 1234"
          required
        />
        <div className="pt-4">
          <Button type="submit">Guardar y Continuar</Button>
        </div>
      </form>
    </div>
  );
};
