import { createContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getStoredAuth().user);
  const [token, setToken] = useState(() => authService.getStoredAuth().token);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setStatus('anonymous');
        return;
      }

      try {
        setStatus('loading');
        const currentUser = await authService.me();
        setUser(currentUser);
        setStatus('authenticated');
      } catch {
        setUser(null);
        setToken(null);
        setStatus('anonymous');
      }
    };

    bootstrap();
  }, [token]);

  const login = async (credentials) => {
    setError(null);
    const response = await authService.login(credentials);
    setUser(response.user);
    setToken(response.accessToken);
    setStatus('authenticated');
    return response.user;
  };

  const register = async (payload) => {
    setError(null);
    const response = await authService.register(payload);
    setUser(response.user);
    setToken(response.accessToken);
    setStatus('authenticated');
    return response.user;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
    setStatus('anonymous');
  };

  const value = useMemo(
    () => ({
      user,
      token,
      status,
      error,
      setError,
      login,
      register,
      logout,
      isAuthenticated: Boolean(user && token),
      isAdmin: user?.role === 'admin',
    }),
    [error, token, user, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};