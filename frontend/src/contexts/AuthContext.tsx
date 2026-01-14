import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import type { User, LoginCredentials } from '../services/authService';
import { AuthContext } from './AuthContextDefinition';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService
        .getProfile()
        .then(setUser)
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      // Defer setLoading to avoid cascading renders
      Promise.resolve().then(() => setLoading(false));
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const { access_token, user } = await authService.login(credentials);
    localStorage.setItem('token', access_token);
    setUser(user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// useAuth hook moved to src/hooks/useAuth.ts for fast refresh compatibility

