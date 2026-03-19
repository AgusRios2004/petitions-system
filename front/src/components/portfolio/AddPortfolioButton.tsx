'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import AddPortfolioModal from './AddModalPortfolio';

interface AddPortfolioButtonProps {
    providerId: number;
}

export default function AddPortfolioButton({ providerId }: AddPortfolioButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <Button
                onClick={() => setIsModalOpen(true)}
                className="w-full !bg-emerald-600 !hover:bg-emerald-700 !text-white font-black text-xs uppercase tracking-[0.2em] h-12 rounded-2xl shadow-xl shadow-emerald-900/40 border-none transition-all hover:scale-[1.02]"
            >
                Agregar Portfolio
            </Button>
            {isModalOpen && (
                <AddPortfolioModal
                    onClose={() => setIsModalOpen(false)}
                    providerId={providerId}
                />
            )}
        </>
    );
}
