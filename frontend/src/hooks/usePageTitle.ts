import { useEffect } from 'react';

export function usePageTitle(title: string, subtitle?: string) {
  useEffect(() => {
    document.title = `${title} | ROVIN — Precision RC & Tech`;
  }, [title]);
}
