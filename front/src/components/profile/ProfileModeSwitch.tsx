'use client';

import React from 'react';
import { Mode } from '@/lib/roles';

interface ProfileModeSwitchProps {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

const OPTIONS: { id: Mode; label: string }[] = [
  { id: 'customer', label: 'Cliente' },
  { id: 'provider', label: 'Proveedor' },
];

// Selector de modo de /profile. Solo se muestra con los dos perfiles.
const ProfileModeSwitch: React.FC<ProfileModeSwitchProps> = ({ mode, onChange }) => (
  <div
    role="group"
    aria-label="Modo de perfil"
    className="flex items-center gap-1.5 p-1.5 bg-gray-950/40 rounded-2xl border border-white/5 w-fit"
  >
    {OPTIONS.map((opt) => (
      <button
        key={opt.id}
        type="button"
        aria-pressed={mode === opt.id}
        onClick={() => onChange(opt.id)}
        className={`py-2 px-5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 ${
          mode === opt.id
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
            : 'text-gray-500 hover:text-white hover:bg-white/5'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

export default ProfileModeSwitch;
