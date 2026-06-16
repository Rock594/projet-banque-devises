import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    institution_name: 'GlobalBank',
    contact_email: 'rabobasonmarius@gmail.com',
    default_fee_percentage: 0.5,
    currency_base: 'USD',
    timezone: 'Indian/Antananarivo',
    date_format: 'DD/MM/YYYY',
    language: 'fr',
    notification_email: true,
    auto_refresh_rates: true,
    low_balance_alert: 1000,
    max_transaction_amount: 1000000
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/settings/');
      setSettings(prev => ({ ...prev, ...response.data }));
    } catch (error) {
      console.error('Erreur chargement settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      await api.put('/settings/', newSettings);
      setSettings(newSettings);
      toast.success('Paramètres mis à jour avec succès');
      
      // Appliquer les changements immédiats
      applySettingsChanges(newSettings);
      return true;
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
      return false;
    }
  };

  const applySettingsChanges = (newSettings) => {
    // Appliquer le nom de l'institution au titre de la page
    if (newSettings.institution_name) {
      document.title = `${newSettings.institution_name} - Gestion des devises`;
    }
    
    // Appliquer le format de date
    if (newSettings.date_format) {
      localStorage.setItem('date_format', newSettings.date_format);
    }
    
    // Appliquer la langue
    if (newSettings.language) {
      localStorage.setItem('language', newSettings.language);
    }
    
    // Appliquer le fuseau horaire
    if (newSettings.timezone) {
      localStorage.setItem('timezone', newSettings.timezone);
    }
  };

  const formatDate = (date, format = null) => {
    const useFormat = format || settings.date_format;
    const d = new Date(date);
    
    if (useFormat === 'DD/MM/YYYY') {
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    } else if (useFormat === 'MM/DD/YYYY') {
      return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`;
    } else {
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    }
  };

  const formatCurrency = (amount, currency = null) => {
    const useCurrency = currency || settings.currency_base;
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: useCurrency }).format(amount);
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      loading,
      updateSettings,
      formatDate,
      formatCurrency,
      refreshSettings: loadSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
};