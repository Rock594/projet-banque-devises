import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Dashboard = () => {
  const [summary, setSummary] = useState({
    today: { total_volume: 0, count: 0, completed: 0 },
    yesterday: { total_volume: 0, count: 0 },
    variation: 0,
    by_currency: []
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  // Données pour le graphique
  const volumeData = [
    { name: 'Lun', volume: 4000, transactions: 24 },
    { name: 'Mar', volume: 3000, transactions: 18 },
    { name: 'Mer', volume: 5000, transactions: 32 },
    { name: 'Jeu', volume: 2780, transactions: 15 },
    { name: 'Ven', volume: 6890, transactions: 45 },
    { name: 'Sam', volume: 2390, transactions: 12 },
    { name: 'Dim', volume: 3490, transactions: 20 },
  ];

  const pieData = [
    { name: 'USD', value: 45, color: '#0f49bd' },
    { name: 'EUR', value: 30, color: '#10b981' },
    { name: 'GBP', value: 15, color: '#f59e0b' },
    { name: 'JPY', value: 10, color: '#ef4444' },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, transactionsRes] = await Promise.all([
        api.get('/transactions/summary/'),
        api.get('/transactions/?limit=5')
      ]);
      
      setSummary(summaryRes.data);
      setRecentTransactions(transactionsRes.data.results || []);
      
      // Générer des données pour le graphique
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push({
          date: format(date, 'EEEE', { locale: fr }),
          volume: Math.floor(Math.random() * 5000) + 2000,
          transactions: Math.floor(Math.random() * 30) + 10
        });
      }
      setChartData(last7Days);
    } catch (error) {
      console.error('Erreur:', error);
      setChartData(volumeData);
    } finally {
      setLoading(false);
    }
  };

  const getVariationColor = (value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-slate-500';
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-slate-500 mt-1">Bienvenue sur votre espace de gestion</p>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border p-6">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-slate-500">Volume total</p>
            <span className="material-symbols-outlined text-primary">payments</span>
          </div>
          <p className="text-3xl font-bold">{summary.today.total_volume.toLocaleString()} €</p>
          <div className={`flex items-center gap-1 text-sm font-medium ${getVariationColor(summary.variation)} mt-2`}>
            <span className="material-symbols-outlined text-sm">
              {summary.variation > 0 ? 'trending_up' : 'trending_down'}
            </span>
            <span>{Math.abs(summary.variation)}% vs hier</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border p-6">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-slate-500">Transactions</p>
            <span className="material-symbols-outlined text-primary">receipt_long</span>
          </div>
          <p className="text-3xl font-bold">{summary.today.count}</p>
          <p className="text-sm text-green-600 mt-2">+5% aujourd'hui</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border p-6">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-slate-500">Taux moyen</p>
            <span className="material-symbols-outlined text-primary">trending_up</span>
          </div>
          <p className="text-3xl font-bold">1.0841</p>
          <p className="text-sm text-green-600 mt-2">EUR/USD</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border p-6">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-slate-500">Clients actifs</p>
            <span className="material-symbols-outlined text-primary">group</span>
          </div>
          <p className="text-3xl font-bold">128</p>
          <p className="text-sm text-green-600 mt-2">+12 nouveaux</p>
        </div>
      </div>

      {/* Graphique en ligne */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Évolution du volume</h2>
          <select className="text-sm bg-slate-50 dark:bg-slate-800 border rounded-lg px-3 py-1">
            <option>7 derniers jours</option>
            <option>30 derniers jours</option>
            <option>Cette année</option>
          </select>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}
              />
              <Legend />
              <Line type="monotone" dataKey="volume" stroke="#0f49bd" strokeWidth={2} name="Volume (€)" />
              <Line type="monotone" dataKey="transactions" stroke="#10b981" strokeWidth={2} name="Transactions" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Graphique camembert et barres */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border p-6">
          <h2 className="text-lg font-bold mb-4">Répartition par devise</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border p-6">
          <h2 className="text-lg font-bold mb-4">Transactions par type</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { type: 'Achat', count: 45 },
                { type: 'Vente', count: 55 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0f49bd" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transactions récentes */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold">Transactions récentes</h2>
        </div>
        <div className="divide-y">
          {recentTransactions.map((tx, index) => (
            <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
              <div>
                <p className="font-medium">Transaction #{tx.transaction_id || index + 1}</p>
                <p className="text-sm text-slate-500">{tx.client_name}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{tx.amount_from?.toLocaleString() || '0'} €</p>
                <p className="text-sm text-green-600">{tx.status_display || 'Complétée'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;