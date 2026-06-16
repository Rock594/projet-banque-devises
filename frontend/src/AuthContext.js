import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

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
  const [tokens, setTokens] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier la session au chargement
    const storedTokens = localStorage.getItem('tokens');
    const storedUser = localStorage.getItem('user');
    
    if (storedTokens && storedUser) {
      setTokens(JSON.parse(storedTokens));
      setUser(JSON.parse(storedUser));
      setupAxiosInterceptors(JSON.parse(storedTokens).access);
    }
    setLoading(false);
  }, []);

  const setupAxiosInterceptors = (token) => {
    axios.interceptors.request.use(
      (config) => {
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => Promise.reject(error)
    );
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/login/', {
        username,
        password,
      });

      const { access, refresh, user } = response.data;
      
      // ✅ Guidage: Message clair de succès
      toast.success('Connexion réussie !');
      
      setTokens({ access, refresh });
      setUser(user);
      
      localStorage.setItem('tokens', JSON.stringify({ access, refresh }));
      localStorage.setItem('user', JSON.stringify(user));
      
      setupAxiosInterceptors(access);
      
      navigate('/dashboard');
      
      return { success: true };
    } catch (error) {
      // ✅ Gestion des erreurs: Messages explicatifs
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Erreur de connexion. Vérifiez vos identifiants.';
      
      toast.error(errorMessage);
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    // ✅ Contrôle explicite: Confirmation avant déconnexion
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      setUser(null);
      setTokens(null);
      localStorage.removeItem('tokens');
      localStorage.removeItem('user');
      
      // ✅ Guidage: Message clair
      toast.success('Déconnexion réussie');
      
      navigate('/login');
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    tokens,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};