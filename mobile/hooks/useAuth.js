import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getItem, setItem, deleteItem } from '../utils/storage';
import api from '../utils/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getItem('token');
        const userData = await getItem('user');
        if (token && userData) {
          const decoded = jwtDecode(token);
          const now = Date.now() / 1000;
          if (decoded.exp > now) {
            setUser(JSON.parse(userData));
          } else {
            await deleteItem('token');
            await deleteItem('user');
          }
        }
      } catch {
        // Token invalid or missing
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData } = res.data;
    await setItem('token', token);
    await setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    await deleteItem('token');
    await deleteItem('user');
    setUser(null);
  }, []);

  return { user, loading, login, logout };
}
