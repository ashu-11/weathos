import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [rm, setRm]         = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('wo_token');
    if (!token) { setLoading(false); return; }
    authAPI.me()
      .then(r => setRm(r.data))
      .catch(() => localStorage.removeItem('wo_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const r = await authAPI.login(email, password);
    localStorage.setItem('wo_token', r.data.token);
    setRm(r.data.rm);
    return r.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('wo_token');
    setRm(null);
  }, []);

  return (
    <AuthCtx.Provider value={{ rm, loading, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
