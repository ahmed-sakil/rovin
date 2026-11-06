import React, { createContext, useContext, useEffect, useState } from 'react';

export interface FontOption {
  name: string;
  category: 'Modern Sans' | 'Friendly & Geometric' | 'Universal' | 'Futuristic / Tech';
  description: string;
}

export const HEADING_FONT_OPTIONS: FontOption[] = [
  { name: 'Plus Jakarta Sans', category: 'Modern Sans', description: 'Clean, elegant, highly readable contemporary sans-serif (Recommended)' },
  { name: 'Poppins', category: 'Friendly & Geometric', description: 'Friendly, modern rounded geometric sans with high visual appeal' },
  { name: 'Inter', category: 'Modern Sans', description: 'Clean, neutral, and exceptionally legible modern design' },
  { name: 'Outfit', category: 'Friendly & Geometric', description: 'Crisp, contemporary geometric display font' },
  { name: 'Roboto', category: 'Universal', description: 'Balanced, universally familiar, and comfortable to read' },
  { name: 'Montserrat', category: 'Modern Sans', description: 'Bold, distinctive architectural typography' },
  { name: 'Space Grotesk', category: 'Futuristic / Tech', description: 'Subtle technical feel without sacrificing legibility' },
  { name: 'Orbitron', category: 'Futuristic / Tech', description: 'High-tech robotic display font (Original)' },
];

export const BODY_FONT_OPTIONS: FontOption[] = [
  { name: 'Inter', category: 'Modern Sans', description: 'Industry-standard readability for UI and long paragraphs (Recommended)' },
  { name: 'Plus Jakarta Sans', category: 'Modern Sans', description: 'Crisp, balanced, and modern for all screen sizes' },
  { name: 'Roboto', category: 'Universal', description: 'Classic neutral font with smooth readability' },
  { name: 'Poppins', category: 'Friendly & Geometric', description: 'Warm and friendly body text' },
];

interface FontContextType {
  fontHeading: string;
  fontBody: string;
  setFonts: (heading: string, body: string) => void;
  availableHeadingFonts: FontOption[];
  availableBodyFonts: FontOption[];
}

const FontContext = createContext<FontContextType>({
  fontHeading: 'Plus Jakarta Sans',
  fontBody: 'Inter',
  setFonts: () => {},
  availableHeadingFonts: HEADING_FONT_OPTIONS,
  availableBodyFonts: BODY_FONT_OPTIONS,
});

export const useFonts = () => useContext(FontContext);

const applyFontVariables = (heading: string, body: string) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--font-heading', `'${heading}', sans-serif`);
  root.style.setProperty('--font-body', `'${body}', sans-serif`);
};

export const FontProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontHeading, setFontHeadingState] = useState<string>(() => {
    return localStorage.getItem('rovin_font_heading') || 'Plus Jakarta Sans';
  });

  const [fontBody, setFontBodyState] = useState<string>(() => {
    return localStorage.getItem('rovin_font_body') || 'Inter';
  });

  const setFonts = (heading: string, body: string) => {
    setFontHeadingState(heading);
    setFontBodyState(body);
    localStorage.setItem('rovin_font_heading', heading);
    localStorage.setItem('rovin_font_body', body);
    applyFontVariables(heading, body);
  };

  // 1. Initial CSS variable application
  useEffect(() => {
    applyFontVariables(fontHeading, fontBody);
  }, [fontHeading, fontBody]);

  // 2. Fetch server-configured settings on mount
  useEffect(() => {
    let isMounted = true;
    const fetchServerFonts = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (isMounted && data.success && data.settings) {
          const sHeading = data.settings.fontHeading || 'Plus Jakarta Sans';
          const sBody = data.settings.fontBody || 'Inter';
          setFontHeadingState(sHeading);
          setFontBodyState(sBody);
          localStorage.setItem('rovin_font_heading', sHeading);
          localStorage.setItem('rovin_font_body', sBody);
          applyFontVariables(sHeading, sBody);
        }
      } catch (err) {
        console.warn('[FontProvider] Could not sync font settings from server:', err);
      }
    };

    fetchServerFonts();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <FontContext.Provider
      value={{
        fontHeading,
        fontBody,
        setFonts,
        availableHeadingFonts: HEADING_FONT_OPTIONS,
        availableBodyFonts: BODY_FONT_OPTIONS,
      }}
    >
      {children}
    </FontContext.Provider>
  );
};
