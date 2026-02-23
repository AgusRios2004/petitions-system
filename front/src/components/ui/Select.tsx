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
  variant?: 'dark' | 'white';
}

// Función para generar estilos según la variante
const getStyles = (variant: 'dark' | 'white'): StylesConfig<SelectOption, false> => {
  const isDark = variant === 'dark';
  return {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      borderColor: state.isFocused ? '#3b82f6' : (isDark ? '#4b5563' : '#d1d5db'),
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
      '&:hover': { borderColor: isDark ? '#6b7280' : '#9ca3af' },
      borderRadius: '0.375rem',
      padding: '0.25rem',
    }),
    singleValue: (provided) => ({ ...provided, color: isDark ? '#d1d5db' : '#374151' }),
    input: (provided) => ({ ...provided, color: isDark ? '#f9fafb' : '#111827' }),
    placeholder: (provided) => ({ ...provided, color: isDark ? '#9ca3af' : '#6b7280' }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      border: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`,
      borderRadius: '0.375rem',
    }),
    // Estilo para el portal
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#3b82f6'
        : state.isFocused
        ? (isDark ? '#374151' : '#f3f4f6')
        : 'transparent',
      color: state.isSelected ? '#ffffff' : (isDark ? '#d1d5db' : '#1f2937'),
    }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: isDark ? '#9ca3af' : '#6b7280',
      '&:hover': { color: isDark ? '#d1d5db' : '#374151' },
    }),
  };
};

export const Select: React.FC<CustomSelectProps> = ({
  label,
  options,
  error,
  id,
  value,
  onChange,
  disabled,
  variant = 'dark', // Por defecto sigue siendo oscuro
  ...rest
}) => {
  // Convertimos el valor primitivo en un objeto SelectOption
  const selectedOption =
    options.find((option) => option.value === value) || null;

  const handleChange = (option: SelectOption | null) => {
    onChange?.(option ? option.value : null);
  };

  // Usamos un useEffect para renderizar en el cliente y evitar errores de SSR con document.body
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculamos los estilos según la variante
  const styles = React.useMemo(() => getStyles(variant), [variant]);

  return (
    <div className="w-full">
      <label htmlFor={id} className={`block text-sm font-medium mb-1 ${variant === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
        {label}
      </label>
      {isClient && (
        <ReactSelect
          {...rest}
          id={id}
          options={options}
          styles={styles}
          value={selectedOption}
          onChange={handleChange}
          placeholder={rest.placeholder || 'Seleccionar...'}
          isDisabled={disabled}
          noOptionsMessage={() => 'No hay opciones'}
          // Renderiza el menú en el body para evitar problemas de layout
          menuPortalTarget={document.body}
        />
      )}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
