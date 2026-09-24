import React from 'react';

interface SenaLogoProps {
  className?: string;
  size?: number;
}

export const SenaLogo: React.FC<SenaLogoProps> = ({ className = 'w-7 h-7', size }) => {
  return (
    <img
      src="/sena-logo.svg"
      alt="Logo Oficial SENA"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      loading="eager"
    />
  );
};
