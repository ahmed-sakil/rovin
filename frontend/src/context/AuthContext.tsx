import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface UserAddress {
  id: string;
  title: string;
  recipientName: string;
  phoneNumber: string;
  district: string;
  thana: string;
  addressLine: string;
  isDefault: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  dateOfBirth?: string;
  profileImageUrl?: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  addresses?: UserAddress[];
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  sendRegisterOtp: (email: string, phone: string) => Promise<boolean>;
  verifyAndRegister: (data: any) => Promise<boolean>;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('rovin_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const sendRegisterOtp = async (email: string, phone: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error('Registration Code Error', { description: data.message || 'Failed to dispatch OTP.' });
        return false;
      }
      toast.success('OTP Sent', { description: data.message });
      return true;
    } catch {
      toast.error('Network Error', { description: 'Could not connect to authentication gateway.' });
      return false;
    }
  };

  const verifyAndRegister = async (formData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error('Registration Failed', { description: data.message || 'Invalid registration payload.' });
        return false;
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('rovin_token', data.token);
      toast.success('Registration Complete', { description: `Welcome, ${data.user.name}!` });
      return true;
    } catch {
      toast.error('Registration Error', { description: 'Network issue during registration.' });
      return false;
    }
  };

  const login = async (identifier: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.isBanned) {
          toast.error('Account Suspended', { description: data.message });
        } else {
          toast.error('Login Failed', { description: data.message || 'Invalid credentials.' });
        }
        return false;
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('rovin_token', data.token);
      toast.success('Access Granted', { description: `Logged in as ${data.user.name} (${data.user.role})` });
      return true;
    } catch {
      toast.error('Connection Error', { description: 'Unable to reach authentication server.' });
      return false;
    }
  };

  const updateProfile = async (formData: Partial<UserProfile>): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error('Update Failed', { description: data.message || 'Could not update profile.' });
        return false;
      }
      setUser(data.user);
      toast.success('Profile Saved', { description: data.message || 'Your personal telemetry has been updated.' });
      return true;
    } catch {
      toast.error('Network Error', { description: 'Could not connect to authentication gateway.' });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('rovin_token');
    toast.info('Signed Out', { description: 'Telemetry session concluded.' });
  };

  const refreshProfile = async () => {
    if (token) await fetchProfile(token);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        loading,
        sendRegisterOtp,
        verifyAndRegister,
        login,
        updateProfile,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
