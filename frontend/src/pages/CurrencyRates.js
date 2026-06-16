import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const CurrencyRates = () => {
  const navigate = useNavigate();
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/currencies/rates/current/');
      console.log('Taux reçus:', response.data);
      setRates(response.data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur chargement taux:', error);
      toast.error('Erreur de chargement des taux');
      // Données de secours pour éviter l'écran blanc
      setRates([
        { id: 1, pair: 'EUR/USD', buy_rate: 1.0831, sell_rate: 1.0850, change: '+0.12%', trend: 'up' },
        { id: 2, pair: 'GBP/USD', buy_rate: 1.2631, sell_rate: 1.2650, change: '-0.05%', trend: 'down' },
        { id: 3, pair: 'USD/JPY', buy_rate: 148.21, sell_rate: 148.35, change: '+0.44%', trend: 'up' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    toast.loading('Mise à jour...', { id: 'refresh' });
    await fetchRates();
    toast.success('Taux mis à jour', { id: 'refresh', duration: 2000 });
  };

  const handleManageCurrencies = () => {
    navigate('/currencies/manage');
  };

  const getChangeColor = (change) => {
    if (!change) return 'text-slate-500';
    return change.startsWith('+') ? 'text-green-600' : 'text-red-600';
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? 'trending_up' : 'trending_down';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-500">Chargement des taux de change...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Taux de change</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Taux de change en temps réel</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg">
            <span className="material-symbols-outlined text-slate-400 text-sm">schedule</span>
            <span className="text-xs text-slate-500">
              {lastUpdate ? lastUpdate.toLocaleTimeString('fr-FR') : '--:--:--'}
            </span>
          </div>
          
          <button
            onClick={handleRefresh}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Actualiser
          </button>

          <button
            onClick={handleManageCurrencies}
            className="bg-primary/10 text-primary px-4 py-2 rounded-lg hover:bg-primary/20 flex items-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">manage_accounts</span>
            Gérer les devises
          </button>
        </div>
      </div>

      {/* Cartes de taux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rates.map((rate) => (
          <div
            key={rate.id}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-slate-500">Paire de devises</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{rate.pair}</p>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getChangeColor(rate.change)}`}>
                  <span className="material-symbols-outlined text-sm">{getTrendIcon(rate.trend)}</span>
                  <span className="text-sm font-medium">{rate.change}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-slate-500">Taux acheteur</p>
                  <p className="text-lg font-semibold text-green-600">{rate.buy_rate}</p>
                </div>
                <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-xs text-slate-500">Taux vendeur</p>
                  <p className="text-lg font-semibold text-red-600">{rate.sell_rate}</p>
                </div>
              </div>
              
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  Spread: {((rate.sell_rate - rate.buy_rate) / rate.buy_rate * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message si aucune donnée */}
      {rates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">Aucun taux de change disponible</p>
        </div>
      )}
    </div>
  );
};

export default CurrencyRates;