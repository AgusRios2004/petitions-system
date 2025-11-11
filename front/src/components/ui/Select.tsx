'use client';

import React from 'react';
import ReactSelect, { Props as SelectProps, StylesConfig } from 'react-select';

// Interfaz para las opciones que espera el Select
export interface SelectOption {
  value: number | string;
  label: string;
}

// Props personalizadas para nuestro componente Select
interface CustomSelectProps
  extends Omit<SelectProps<SelectOption, false>, 'options' | 'value' | 'onChange' | 'isDisabled'> {
  label: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  value?: number | string | null; // <-- el value viene como primitivo de RHF
  onChange?: (value: number | string | null) => void; // <-- también ajustamos el tipo
}

// Estilos personalizados para react-select
const customStyles: StylesConfig<SelectOption, false> = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: '#1f2937',
    borderColor: state.isFocused ? '#3b82f6' : '#4b5563',
    boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
    '&:hover': { borderColor: '#6b7280' },
    borderRadius: '0.375rem',
    padding: '0.25rem',
  }),
  singleValue: (provided) => ({ ...provided, color: '#d1d5db' }),
  input: (provided) => ({ ...provided, color: '#f9fafb' }),
  placeholder: (provided) => ({ ...provided, color: '#9ca3af' }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#1f2937',
    border: '1px solid #4b5563',
    borderRadius: '0.375rem',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#3b82f6'
      : state.isFocused
      ? '#374151'
      : 'transparent',
    color: state.isSelected ? '#ffffff' : '#d1d5db',
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: '#9ca3af',
    '&:hover': { color: '#d1d5db' },
  }),
};

export const Select: React.FC<CustomSelectProps> = ({
  label,
  options,
  error,
  id,
  value,
  onChange,
  disabled,
  ...rest
}) => {
  // Convertimos el valor primitivo en un objeto SelectOption
  const selectedOption =
    options.find((option) => option.value === value) || null;

  const handleChange = (option: SelectOption | null) => {
    onChange?.(option ? option.value : null);
  };

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <ReactSelect
        {...rest}
        id={id}
        options={options}
        styles={customStyles}
        value={selectedOption}
        onChange={handleChange}
        placeholder={rest.placeholder || 'Seleccionar...'}
        isDisabled={disabled}
        noOptionsMessage={() => 'No hay opciones'}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
