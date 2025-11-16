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
                className="!bg-green-600 !hover:bg-green-700"
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
