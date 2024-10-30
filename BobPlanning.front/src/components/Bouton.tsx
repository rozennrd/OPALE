// Bouton.tsx
import React from 'react';
import './Bouton.css'; // Importation du fichier CSS personnalisé

interface BoutonProps {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;   
  variant?: 'contained' | 'outlined' | 'text';

}

const Bouton: React.FC<BoutonProps> = ({
  onClick,
  disabled = false,
  children,
  className = '',
  variant = 'contained',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`bouton ${variant} ${className} `}
    >
      {children}
    </button>
  );
};

export default Bouton;
