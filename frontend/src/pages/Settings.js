import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import toast from 'react-hot-toast';

const Settings = () => {
  const { settings: globalSettings, updateSettings, loading: settingsLoading, refreshSettings } = useSettings();
  
  const [settings, setSettings] = useState(globalSettings);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    setSettings(globalSettings);
  }, [globalSettings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
    if (successMessage) setSuccessMessage(null);
    if (error) setError(null);
  };

const testEmail = async () => {
  const email = settings.contact_email;
  if (!email) {
    toast.error('Veuillez configurer un email de contact');
    return;
  }
  
  toast.loading('Envoi du test...', { id: 'testEmail' });
  try {
    const response = await api.post('/email/test/', { email });
    if (response.data.success) {
      toast.success('Email de test envoyé ! Vérifiez votre boîte de réception', { id: 'testEmail' });
    } else {
      toast.error('Erreur lors de l\'envoi', { id: 'testEmail' });
    }
  } catch (error) {
    toast.error('Erreur de connexion au serveur', { id: 'testEmail' });
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    const success = await updateSettings(settings);
    
    if (success) {
      setSuccessMessage('Paramètres sauvegardés avec succès !');
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setError('Erreur lors de la sauvegarde des paramètres');
    }
    
    setSaving(false);
  };

  const resetToDefault = () => {
    const defaultSettings = {
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
    };
    setSettings(defaultSettings);
    updateSettings(defaultSettings);
    setSuccessMessage('Paramètres réinitialisés avec succès');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-500">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Paramètres</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configuration avancée de l'application</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-red-600">error</span>
            <div className="flex-1">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              <button 
                onClick={refreshSettings}
                className="text-xs text-red-600 hover:underline mt-1"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-green-600">check_circle</span>
            <p className="text-sm text-green-800 dark:text-green-300">{successMessage}</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Onglets */}
        <div className="border-b border-slate-200 dark:border-slate-800">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'general' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <span className="material-symbols-outlined text-sm align-middle mr-2">business</span>
              Général
            </button>
            <button
              onClick={() => setActiveTab('financial')}
              className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'financial' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <span className="material-symbols-outlined text-sm align-middle mr-2">payments</span>
              Financier
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'notifications' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <span className="material-symbols-outlined text-sm align-middle mr-2">notifications</span>
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'security' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <span className="material-symbols-outlined text-sm align-middle mr-2">security</span>
              Sécurité
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Onglet Général */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Nom de l'institution
                  </label>
                  <input
                    type="text"
                    name="institution_name"
                    value={settings.institution_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">Apparaît dans l'en-tête de l'application (raffraîchir la page pour voir le changement)</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Email de contact
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    value={settings.contact_email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Langue
                  </label>
                  <select
                    name="language"
                    value={settings.language}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-slate-900"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="mg">Malagasy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Fuseau horaire
                  </label>
                  <select
                    name="timezone"
                    value={settings.timezone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-slate-900"
                  >
                    <option value="Indian/Antananarivo">Afrique/Antananarivo (UTC+3)</option>
                    <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                    <option value="America/New_York">Amérique/New York (UTC-5)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Format de date
                  </label>
                  <select
                    name="date_format"
                    value={settings.date_format}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-slate-900"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Financier */}
          {activeTab === 'financial' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Devise de base
                  </label>
                  <select
                    name="currency_base"
                    value={settings.currency_base}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-slate-900"
                  >
                    <option value="USD">USD - Dollar US</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - Livre Sterling</option>
                    <option value="MGA">MGA - Ariary Malagasy</option>
                    <option value="JPY">JPY - Yen Japonais</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Taux de frais par défaut (%)
                  </label>
                  <input
                    type="number"
                    name="default_fee_percentage"
                    value={settings.default_fee_percentage}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    max="10"
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Montant maximum par transaction (€)
                  </label>
                  <input
                    type="number"
                    name="max_transaction_amount"
                    value={settings.max_transaction_amount}
                    onChange={handleChange}
                    step="1000"
                    min="0"
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Alerte seuil bas (€)
                  </label>
                  <input
                    type="number"
                    name="low_balance_alert"
                    value={settings.low_balance_alert}
                    onChange={handleChange}
                    step="100"
                    min="0"
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Onglet Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Notifications par email</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Recevoir des alertes par email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="notification_email"
                    checked={settings.notification_email}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Auto-refresh des taux</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Mise à jour automatique toutes les 30 secondes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="auto_refresh_rates"
                    checked={settings.auto_refresh_rates}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          )}

          {/* Onglet Sécurité */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-600">security</span>
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Paramètres de sécurité</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                      Modifiez vos paramètres de sécurité et de connexion
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Changer le mot de passe
                </label>
                <input
                  type="password"
                  placeholder="Ancien mot de passe"
                  className="w-full mb-3 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <input
                  type="password"
                  placeholder="Nouveau mot de passe"
                  className="w-full mb-3 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <input
                  type="password"
                  placeholder="Confirmer le nouveau mot de passe"
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <button type="button" className="mt-3 text-primary text-sm hover:underline">
                  Changer le mot de passe
                </button>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="font-medium text-slate-900 dark:text-white mb-3">Session active</h4>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Appareil actuel</p>
                    <p className="text-xs text-slate-500">Windows - Chrome - Localhost</p>
                  </div>
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    Actif
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-8 mt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  Sauvegarde...
                </span>
              ) : (
                'Sauvegarder les modifications'
              )}
            </button>
            <button
              type="button"
              onClick={resetToDefault}
              className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              Réinitialiser
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;