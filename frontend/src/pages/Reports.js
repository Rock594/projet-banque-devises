import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { exportTransactionsToPDF, exportUsersToPDF, exportRatesToPDF } from '../utils/exportPDF';

const Reports = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [reportData, setReportData] = useState(null);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Statistiques
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalVolume: 0,
    averageAmount: 0,
    completedCount: 0,
    pendingCount: 0,
    buyCount: 0,
    sellCount: 0
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchTerm, dateFrom, dateTo, typeFilter, statusFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/transactions/');
      const data = response.data.results || [];
      setTransactions(data);
    } catch (error) {
      console.error('Erreur:', error);
      // Données de démonstration
      const demoData = [
        { id: 1, transaction_id: 'TX89210', client_name: 'Jean Dupont', transaction_type: 'SELL', type_display: 'Vente', amount_from: 1085, status: 'COMPLETED', status_display: 'Complétée', created_at: '2024-04-03T10:30:00Z', from_currency_code: 'EUR', to_currency_code: 'USD' },
        { id: 2, transaction_id: 'TX89209', client_name: 'Sarah Smith', transaction_type: 'BUY', type_display: 'Achat', amount_from: 921.60, status: 'COMPLETED', status_display: 'Complétée', created_at: '2024-04-03T09:15:00Z', from_currency_code: 'USD', to_currency_code: 'GBP' },
        { id: 3, transaction_id: 'TX89208', client_name: 'Marc Lambert', transaction_type: 'SELL', type_display: 'Vente', amount_from: 14920, status: 'PENDING', status_display: 'En attente', created_at: '2024-04-02T14:20:00Z', from_currency_code: 'USD', to_currency_code: 'JPY' },
        { id: 4, transaction_id: 'TX100004', client_name: 'Client Test', transaction_type: 'SELL', type_display: 'Vente', amount_from: 50000000, status: 'PENDING', status_display: 'En attente', created_at: '2026-04-28T10:00:00Z', from_currency_code: 'EUR', to_currency_code: 'USD' },
      ];
      setTransactions(demoData);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];
    
    // Recherche par texte
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtre par date de début
    if (dateFrom) {
      filtered = filtered.filter(t => new Date(t.created_at) >= new Date(dateFrom));
    }
    
    // Filtre par date de fin
    if (dateTo) {
      filtered = filtered.filter(t => new Date(t.created_at) <= new Date(dateTo));
    }
    
    // Filtre par type
    if (typeFilter) {
      filtered = filtered.filter(t => t.transaction_type === typeFilter);
    }
    
    // Filtre par statut
    if (statusFilter) {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    
    setFilteredTransactions(filtered);
    calculateStats(filtered);
  };

  const calculateStats = (data) => {
    const totalVolume = data.reduce((sum, t) => sum + (t.amount_from || 0), 0);
    const completedCount = data.filter(t => t.status === 'COMPLETED').length;
    const pendingCount = data.filter(t => t.status === 'PENDING').length;
    const buyCount = data.filter(t => t.transaction_type === 'BUY').length;
    const sellCount = data.filter(t => t.transaction_type === 'SELL').length;
    
    setStats({
      totalTransactions: data.length,
      totalVolume: totalVolume,
      averageAmount: data.length > 0 ? totalVolume / data.length : 0,
      completedCount,
      pendingCount,
      buyCount,
      sellCount
    });
  };

  const generateReport = async () => {
    if (filteredTransactions.length === 0) {
      toast.error('Aucune transaction à générer');
      return;
    }
    
    setGenerating(true);
    try {
      setReportData({
        generated_at: new Date().toISOString(),
        total_transactions: stats.totalTransactions,
        total_volume: stats.totalVolume,
        average_amount: stats.averageAmount,
        completed_count: stats.completedCount,
        pending_count: stats.pendingCount,
        buy_count: stats.buyCount,
        sell_count: stats.sellCount,
        transactions: filteredTransactions,
        filters: { searchTerm, dateFrom, dateTo, typeFilter, statusFilter }
      });
      toast.success('Rapport généré avec succès');
    } catch (error) {
      toast.error('Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportPDF = async () => {
  if (!reportData || !reportData.transactions || reportData.transactions.length === 0) {
    toast.error('Générez d\'abord un rapport');
    return;
  }
  
  setExporting(true);
  try {
    console.log('Export PDF - Transactions à exporter:', reportData.transactions.length);
    
    // Utiliser la fonction d'export
    const success = await exportTransactionsToPDF(reportData.transactions, 'Rapport des transactions GlobalBank');
    
    if (success) {
      toast.success('PDF exporté avec succès ! Vérifiez votre dossier Téléchargements');
    } else {
      toast.error('Erreur lors de l\'export PDF');
    }
  } catch (error) {
    console.error('Erreur détaillée export:', error);
    toast.error('Une erreur est survenue: ' + error.message);
  } finally {
    setExporting(false);
  }
};

  const exportCSV = () => {
    if (!reportData || reportData.transactions.length === 0) {
      toast.error('Générez d\'abord un rapport');
      return;
    }
    
    try {
      const headers = ['ID', 'Client', 'Type', 'Montant (€)', 'Statut', 'Date'];
      const rows = reportData.transactions.map(t => [
        t.transaction_id || '',
        t.client_name || '',
        t.type_display || '',
        (t.amount_from || 0).toLocaleString(),
        t.status_display || '',
        t.created_at ? new Date(t.created_at).toLocaleDateString('fr-FR') : ''
      ]);
      
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(';'))
        .join('\n');
      
      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_transactions_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export CSV réussi');
    } catch (error) {
      toast.error('Erreur lors de l\'export CSV');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setTypeFilter('');
    setStatusFilter('');
    setReportData(null);
    toast.info('Filtres réinitialisés');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Rapports</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Générez et exportez des rapports d'activité professionnels</p>
      </div>

      {/* Panneau de filtres */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">filter_alt</span>
          Filtres de recherche
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Recherche
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ID transaction, client..."
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Date de début
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Date de fin
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Type de transaction
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="">Tous les types</option>
              <option value="BUY">Achat</option>
              <option value="SELL">Vente</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Statut
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="">Tous les statuts</option>
              <option value="COMPLETED">Complétée</option>
              <option value="PENDING">En attente</option>
              <option value="CANCELLED">Annulée</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>
        
        {/* Résultats des filtres */}
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-semibold">{filteredTransactions.length}</span> transaction(s) trouvée(s)
          </p>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <p className="text-sm opacity-90">Total transactions</p>
          <p className="text-2xl font-bold">{stats.totalTransactions}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <p className="text-sm opacity-90">Volume total</p>
          <p className="text-2xl font-bold">{stats.totalVolume.toLocaleString()} €</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <p className="text-sm opacity-90">Moyenne</p>
          <p className="text-2xl font-bold">{stats.averageAmount.toLocaleString()} €</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <p className="text-sm opacity-90">Taux complétion</p>
          <p className="text-2xl font-bold">
            {stats.totalTransactions > 0 ? Math.round((stats.completedCount / stats.totalTransactions) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Section génération de rapport */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">receipt_long</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Rapport des transactions</h3>
              <p className="text-sm text-slate-500">Générer un rapport détaillé basé sur les filtres sélectionnés</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {reportData && (
            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Transactions</p>
                  <p className="text-xl font-bold text-primary">{reportData.total_transactions}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Volume total</p>
                  <p className="text-xl font-bold text-green-600">{reportData.total_volume.toLocaleString()} €</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Moyenne</p>
                  <p className="text-lg font-semibold">{reportData.average_amount.toLocaleString()} €</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Généré le</p>
                  <p className="text-sm font-medium">{new Date(reportData.generated_at).toLocaleString('fr-FR')}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={generateReport}
              disabled={generating || filteredTransactions.length === 0}
              className="bg-primary text-white px-6 py-2.5 rounded-lg disabled:opacity-50 flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              {generating ? 'Génération...' : 'Générer le rapport'}
            </button>
            
            {reportData && (
              <>
                <button
                  onClick={handleExportPDF}
                  disabled={exporting}
                  className="border border-red-500 text-red-500 px-6 py-2.5 rounded-lg hover:bg-red-50 flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                  {exporting ? 'Export...' : 'Export PDF'}
                </button>
                <button
                  onClick={exportCSV}
                  className="border border-green-500 text-green-500 px-6 py-2.5 rounded-lg hover:bg-green-50 flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">table_rows</span>
                  Export CSV
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Aperçu des données */}
      {filteredTransactions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-semibold">Aperçu des données ({filteredTransactions.length} transactions)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Client</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-right">Montant</th>
                  <th className="px-4 py-3 text-left">Statut</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTransactions.slice(0, 5).map(t => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono">{t.transaction_id}</td>
                    <td className="px-4 py-3">{t.client_name}</td>
                    <td className="px-4 py-3">{t.type_display}</td>
                    <td className="px-4 py-3 text-right font-semibold">{t.amount_from.toLocaleString()} €</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${t.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {t.status_display}
                      </span>
                    </td>
                    <td className="px-4 py-3">{new Date(t.created_at).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;