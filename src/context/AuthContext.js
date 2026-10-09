'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    // Re-validate the stored session against the server. This catches expired
    // tokens and deactivated accounts, which would otherwise leave the UI in a
    // misleading "logged in" state.
    const bootstrap = async () => {
      const cachedUser = authService.getCurrentUser();
      if (!cachedUser) {
        if (!cancelled) setLoading(false);
        return;
      }

      // Optimistically restore the cached user for instant paint.
      if (!cancelled) setUser(cachedUser);

      const freshUser = await authService.getSession();
      if (cancelled) return;

      if (freshUser) {
        setUser(freshUser);
      } else {
        // Token invalid/expired — clear the stale session.
        authService.logout();
        setUser(null);
      }
      setLoading(false);
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const data = await authService.login(email, password);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const data = await authService.register(userData);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isDriver: user?.role === 'DRIVER',
    isPassenger: user?.role === 'PASSENGER',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
