import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('sparehub_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('sparehub_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success) {
      setUser(res);
      localStorage.setItem('sparehub_user', JSON.stringify(res));
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success) {
      setUser(res);
      localStorage.setItem('sparehub_user', JSON.stringify(res));
    }
    return res;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sparehub_user');
  };

  const updateUserLocal = (updatedData) => {
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem('sparehub_user', JSON.stringify(updated));
  };

  // Demo Fast Role Switcher
  const switchDemoRole = async (roleType) => {
    try {
      let email = 'customer@sparehub.com';
      let password = 'customer123';
      if (roleType === 'SALES_STAFF') {
        email = 'sales@sparehub.com';
        password = 'sales123';
      } else if (roleType === 'MANAGER') {
        email = 'manager@sparehub.com';
        password = 'manager123';
      }
      return await login(email, password);
    } catch (e) {
      console.error("Failed to switch demo persona:", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserLocal, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
