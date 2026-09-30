import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { Toaster } from './components/ui/Toast';
import './index.css';

// Support production API URL when frontend (Vercel) & backend (Render) are hosted separately
let rawApiUrl = ((import.meta as any).env?.VITE_API_URL as string || '').trim().replace(/\/+$/, '');
// Strip trailing /api if the user provided https://rovin-api.onrender.com/api
if (rawApiUrl.endsWith('/api')) {
  rawApiUrl = rawApiUrl.slice(0, -4);
}
const apiBase = rawApiUrl;

if (apiBase) {
  const originalFetch = window.fetch;
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === 'string' && input.startsWith('/api')) {
      input = `${apiBase}${input}`;
    } else if (input instanceof URL && input.pathname.startsWith('/api') && input.origin === window.location.origin) {
      input = new URL(`${apiBase}${input.pathname}${input.search}`);
    }
    return originalFetch(input, init);
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
      <Toaster />
    </BrowserRouter>
  </React.StrictMode>
);
