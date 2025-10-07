'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export const CustomerCompletionForm = () => {
  const [formData, setFormData] = useState({
    dni: '',
    phone: '',
    // Por ahora, campos de dirección simples. Luego los conectaremos a la API.
    country: '',
    city: '',
    street: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí irá la lógica para enviar los datos a la API
    console.log('Customer data to submit:', formData);
    alert('Formulario de cliente enviado (revisar consola)');
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg text-white">
      <h2 className="text-2xl font-bold mb-4">Completar Perfil de Cliente</h2>
      <p className="mb-6 text-gray-400">Necesitamos algunos datos adicionales para completar tu perfil de cliente.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="DNI o Documento de Identidad"
          name="dni"
          value={formData.dni}
          onChange={handleChange}
          placeholder="Ingresa tu número de documento"
          required
        />
        <Input
          label="Teléfono"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Ingresa tu número de teléfono"
          required
        />
        <h3 className="text-lg font-semibold pt-4 border-t border-gray-700">Dirección</h3>
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
