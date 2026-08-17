import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiFetch } from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const userData = await apiFetch('/auth/me');
          setUser(userData);
        } catch (err) {
          console.error('Failed to load user session:', err);
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const saveAuthTokens = (data) => {
    if (data.token) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
    }
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    setUser(data);
  };

  const login = async (email, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    saveAuthTokens(data);
    return data;
  };

  const register = async (name, email, password, preferredCurrency = '₹') => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, preferredCurrency }),
    });
    saveAuthTokens(data);
    return data;
  };

  const loginDemo = async () => {
    const data = await apiFetch('/auth/demo', {
      method: 'POST',
      body: JSON.stringify({ forceRefresh: false }),
    });
    saveAuthTokens(data);
    return data;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await apiFetch('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      } catch (e) {
        // Ignore network errors on logout
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const userData = await apiFetch('/auth/me');
        setUser(userData);
        return userData;
      } catch (err) {
        console.error('Failed to refresh user:', err);
      }
    }
    return null;
  };

  const updateUserProfile = async (updates) => {
    const data = await apiFetch('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (data.user) {
      setUser((prev) => ({ ...prev, ...data.user }));
    }
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, loading, login, register, loginDemo, logout, refreshUser, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
