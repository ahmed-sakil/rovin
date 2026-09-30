import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface BrandLogoProps {
  variant?: 'icon' | 'full' | 'horizontal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'icon',
  size = 'md',
  className = '',
  showTagline = true,
}) => {
  const { theme } = useTheme();

  // Size dimensions
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const fullSizes = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-12',
    xl: 'h-16',
  };

  if (variant === 'full') {
    const logoSrc = theme === 'light' ? '/brand/rovin-logo-light.svg' : '/brand/rovin-logo-dark.svg';
    return (
      <div className={`inline-flex items-center ${className}`}>
        <img
          src={logoSrc}
          alt="ROVIN - Precision RC & Tech"
          className={`${fullSizes[size]} object-contain select-none`}
        />
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${iconSizes[size]}`}>
          <img
            src="/brand/rovin-icon.svg"
            alt="ROVIN Emblem"
            className="w-full h-full object-contain select-none"
          />
        </div>
        <div>
          <span className="font-orbitron font-black text-lg tracking-[0.2em] text-machined-titanium block leading-none">
            ROVIN
          </span>
          {showTagline && (
            <span className="text-[9px] font-mono tracking-widest block text-nitro-amber mt-0.5">
              PRECISION RC & TECH
            </span>
          )}
        </div>
      </div>
    );
  }

  // Variant === 'icon'
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${iconSizes[size]} ${className}`}
    >
      <img
        src="/brand/rovin-icon.svg"
        alt="ROVIN Emblem"
        className="w-full h-full object-contain filter drop-shadow select-none"
      />
    </div>
  );
};
