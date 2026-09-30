import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`inline-flex items-center justify-center gap-2 p-2 rounded-lg border border-fastener-border bg-carbon-elevated hover:bg-carbon-hover text-machined-silver hover:text-nitro-amber transition-colors ${className}`}
      title={theme === 'dark' ? 'Switch to Precision Light Mode' : 'Switch to Tactical Dark Mode'}
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-nitro-amber" />
      ) : (
        <Moon className="w-4 h-4 text-machined-titanium" />
      )}
      {showLabel && (
        <span className="font-orbitron text-xs uppercase font-medium">
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};
