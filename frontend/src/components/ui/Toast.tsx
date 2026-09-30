import { Toaster as SonnerToaster } from 'sonner';

export const Toaster = () => {
  return (
    <SonnerToaster
      theme="dark"
      position="top-right"
      toastOptions={{
        style: {
          background: '#14161F',
          border: '1px solid #3A4054',
          color: '#FFFFFF',
          fontFamily: 'Inter, sans-serif',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8)',
        },
        className: 'rovin-toast font-inter text-sm',
      }}
    />
  );
};
