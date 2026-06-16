import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { exportInvoicePDF } from '../utils/exportPDF';
import { useNotification } from '../components/NotificationBell';


const Transactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const searchInputRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      applyFilters();
    }, 300);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchTerm, typeFilter, statusFilter, transactions]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/transactions/');
      const data = response.data.results || [];
      setTransactions(data);
      setFilteredTransactions(data);
    } catch (error) {
      console.error('Erreur:', error);
      const demoData = [
        { id: 1, transaction_id: 'TX89210', client_name: 'Jean Dupont', transaction_type: 'SELL', type_display: 'Vente', amount_from: 1085, status: 'COMPLETED', status_display: 'Complétée', created_at: '2024-04-03T10:30:00Z', from_currency_code: 'EUR', to_currency_code: 'USD', rate_applied: 1.0850 },
        { id: 2, transaction_id: 'TX89209', client_name: 'Sarah Smith', transaction_type: 'BUY', type_display: 'Achat', amount_from: 921.60, status: 'COMPLETED', status_display: 'Complétée', created_at: '2024-04-03T09:15:00Z', from_currency_code: 'USD', to_currency_code: 'GBP', rate_applied: 0.7845 },
        { id: 3, transaction_id: 'TX89208', client_name: 'Marc Lambert', transaction_type: 'SELL', type_display: 'Vente', amount_from: 14920, status: 'PENDING', status_display: 'En attente', created_at: '2024-04-02T14:20:00Z', from_currency_code: 'USD', to_currency_code: 'JPY', rate_applied: 149.20 },
        { id: 4, transaction_id: 'TX100004', client_name: 'Client Test', transaction_type: 'SELL', type_display: 'Vente', amount_from: 50000000, status: 'PENDING', status_display: 'En attente', created_at: '2026-04-28T10:00:00Z', from_currency_code: 'EUR', to_currency_code: 'USD', rate_applied: 1.0850 },
      ];
      setTransactions(demoData);
      setFilteredTransactions(demoData);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.transaction_id?.toLowerCase().includes(term) ||
        t.client_name?.toLowerCase().includes(term)
      );
    }
    
    if (typeFilter) {
      filtered = filtered.filter(t => t.transaction_type === typeFilter);
    }
    
    if (statusFilter) {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    
    setFilteredTransactions(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTypeFilterChange = (e) => {
    setTypeFilter(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setStatusFilter('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    toast.info('Filtres réinitialisés');
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleExportInvoice = (transaction) => {
    exportInvoicePDF(transaction, { name: transaction.client_name, email: `${transaction.client_name}@email.com` });
    toast.success('Facture exportée en PDF');
  };

  const getTypeStyle = (type) => {
    if (type === 'BUY') {
      return { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: 'shopping_cart', label: 'Achat' };
    }
    return { bg: 'bg-amber-100', text: 'text-amber-800', icon: 'sell', label: 'Vente' };
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'COMPLETED':
        return { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: 'check_circle', label: 'Complétée' };
      case 'PENDING':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'pending', label: 'En attente' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: 'help', label: status };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-500">Chargement des transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transactions</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Historique des opérations de change</p>
        </div>
        <button
          onClick={() => navigate('/transactions/new')}
          className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/90 flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Nouvelle transaction
        </button>
      </div>

      {/* Panneau de filtres */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Rechercher par ID ou client..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
            />
          </div>
          
          <select
            value={typeFilter}
            onChange={handleTypeFilterChange}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white dark:bg-slate-900"
          >
            <option value="">Tous les types</option>
            <option value="BUY">Achat</option>
            <option value="SELL">Vente</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white dark:bg-slate-900"
          >
            <option value="">Tous les statuts</option>
            <option value="COMPLETED">Complétée</option>
            <option value="PENDING">En attente</option>
          </select>
          
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Effacer les filtres
          </button>
        </div>
        
        <div className="mt-3 text-sm text-slate-500">
          {filteredTransactions.length} transaction(s) trouvée(s)
        </div>
      </div>

      {/* Tableau des transactions - Version corrigée */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.map((transaction) => {
                const typeStyle = getTypeStyle(transaction.transaction_type);
                const statusStyle = getStatusStyle(transaction.status);
                
                return (
                  <tr key={transaction.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <span className="font-mono text-primary font-medium text-sm">
                        {transaction.transaction_id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 dark:text-white text-sm">
                          {transaction.client_name}
                        </span>
                        <span className="text-xs text-slate-400">ID: {transaction.client_id || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${typeStyle.bg} ${typeStyle.text}`}>
                        <span className="material-symbols-outlined text-sm">{typeStyle.icon}</span>
                        {typeStyle.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatAmount(transaction.amount_from)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                        <span className="material-symbols-outlined text-sm">{statusStyle.icon}</span>
                        {statusStyle.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500">{formatDate(transaction.created_at)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(transaction)}
                          className="p-1.5 text-slate-400 hover:text-primary rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <span className="material-symbols-outlined text-base">visibility</span>
                        </button>
                        <button
                          onClick={() => handleExportInvoice(transaction)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Exporter la facture"
                        >
                          <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredTransactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">receipt_long</span>
            <p className="text-slate-500 text-center">Aucune transaction trouvée</p>
            <button
              onClick={() => navigate('/transactions/new')}
              className="mt-4 text-primary hover:underline text-sm"
            >
              Créer votre première transaction
            </button>
          </div>
        )}
      </div>

      {/* Modal des détails */}
      {showDetailModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Détails de la transaction</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-primary/5 rounded-lg p-4 text-center">
                <p className="text-sm text-slate-500">Transaction</p>
                <p className="text-2xl font-bold text-primary mt-1">{selectedTransaction.transaction_id}</p>
                <p className="text-sm text-slate-500 mt-1">{formatDate(selectedTransaction.created_at)} à {new Date(selectedTransaction.created_at).toLocaleTimeString('fr-FR')}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Client</p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-1">{selectedTransaction.client_name}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Type</p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-1">{selectedTransaction.type_display}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Montant</p>
                  <p className="font-semibold text-green-600 mt-1">{formatAmount(selectedTransaction.amount_from)}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Statut</p>
                  <p className={`font-semibold mt-1 ${selectedTransaction.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {selectedTransaction.status_display}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Devise source</p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-1">{selectedTransaction.from_currency_code || 'EUR'}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Devise cible</p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-1">{selectedTransaction.to_currency_code || 'USD'}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Taux appliqué</p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-1">{selectedTransaction.rate_applied || '1.0850'}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Montant reçu</p>
                  <p className="font-semibold text-green-600 mt-1">{formatAmount(selectedTransaction.amount_to || (selectedTransaction.amount_from * 1.085))}</p>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleExportInvoice(selectedTransaction)}
                  className="flex-1 border border-primary text-primary px-4 py-2.5 rounded-lg hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                  Exporter la facture
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;