'use client';

import React from 'react';
import Modal from './Modal';
import { Button } from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
  confirmButtonVariant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isConfirming = false,
  confirmButtonVariant = 'destructive',
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="p-6">
        <p className="text-gray-300">{message}</p>
      </div>
      <div className="bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <Button onClick={onConfirm} disabled={isConfirming} variant={confirmButtonVariant} fullWidth={false}>
          {isConfirming ? 'Confirmando...' : confirmText}
        </Button>
        <Button type="button" variant="secondary" onClick={onClose} className="mr-2" fullWidth={false} disabled={isConfirming}>
          {cancelText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;