import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login/', { username, password });
      
      const { access, refresh, user: userData } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      setUser(userData);
      toast.success(`Bienvenue ${userData.full_name || userData.username} !`);
      
      // Redirection manuelle au lieu de useNavigate
      window.location.href = '/dashboard';
      return { success: true };
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Mode démo - accepter admin/Admin123!
      if (username === 'admin' && password === 'Admin123!') {
        const demoUser = {
          id: 1,
          username: 'admin',
          email: 'rabobasonmarius@gmail.com',
          first_name: 'Admin',
          last_name: 'System',
          full_name: 'Admin System',
          role: 'SUPER_ADMIN',
          role_display: 'Super Administrateur',
          is_active: true,
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
        };
        
        localStorage.setItem('user', JSON.stringify(demoUser));
        localStorage.setItem('access_token', 'demo-token');
        setUser(demoUser);
        toast.success('Bienvenue Admin (mode démo) !');
        window.location.href = '/dashboard';
        return { success: true };
      }
      
      toast.error('Identifiants incorrects. Utilisez admin / Admin123!');
      return { success: false, error: 'Identifiants incorrects' };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Déconnexion réussie');
    window.location.href = '/login';
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};