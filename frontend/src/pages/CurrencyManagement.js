import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const CurrencyManagement = () => {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    symbol: '',
    is_base_currency: false
  });

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/currencies/');
      console.log('Devises chargées:', response.data);
      setCurrencies(response.data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des devises');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (currency = null) => {
    if (currency) {
      setEditingCurrency(currency);
      setFormData({
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
        is_base_currency: currency.is_base_currency || false
      });
    } else {
      setEditingCurrency(null);
      setFormData({
        code: '',
        name: '',
        symbol: '',
        is_base_currency: false
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCurrency(null);
    setFormData({
      code: '',
      name: '',
      symbol: '',
      is_base_currency: false
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value.toUpperCase()
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.code || !formData.name || !formData.symbol) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      if (editingCurrency) {
        await api.put(`/currencies/${editingCurrency.id}/`, formData);
        toast.success('Devise modifiée avec succès');
      } else {
        await api.post('/currencies/', formData);
        toast.success('Devise ajoutée avec succès');
      }
      handleCloseModal();
      fetchCurrencies();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de l\'opération');
    }
  };

  const handleDelete = async (currency) => {
    if (currency.is_base_currency) {
      toast.error('Impossible de supprimer la devise de base');
      return;
    }
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la devise ${currency.code} ?`)) {
      try {
        await api.delete(`/currencies/${currency.id}/`);
        toast.success(`Devise ${currency.code} supprimée`);
        fetchCurrencies();
      } catch (error) {
        console.error('Erreur:', error);
        toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-500">Chargement des devises...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des devises</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Ajoutez, modifiez ou supprimez les devises disponibles</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2">
          <span className="material-symbols-outlined">add</span>
          Ajouter une devise
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border p-4">
          <p className="text-slate-500 text-sm">Total devises</p>
          <p className="text-2xl font-bold">{currencies.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border p-4">
          <p className="text-slate-500 text-sm">Devise de base</p>
          <p className="text-2xl font-bold">{currencies.find(c => c.is_base_currency)?.code || 'Aucune'}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border p-4">
          <p className="text-slate-500 text-sm">Devises actives</p>
          <p className="text-2xl font-bold">{currencies.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border p-4">
          <p className="text-slate-500 text-sm">Dernière mise à jour</p>
          <p className="text-sm font-medium">{new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Symbole</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {currencies.map((currency) => (
                <tr key={currency.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary text-lg">{currency.code}</span>
                      {currency.is_base_currency && <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full">Base</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">{currency.name}</td>
                  <td className="px-6 py-4 text-xl">{currency.symbol}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Actif</span></td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenModal(currency)} className="p-1.5 text-slate-400 hover:text-primary rounded-lg" title="Modifier">
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button onClick={() => handleDelete(currency)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg" title="Supprimer" disabled={currency.is_base_currency}>
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleCloseModal}>
          <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingCurrency ? 'Modifier la devise' : 'Ajouter une devise'}</h2>
              <button onClick={handleCloseModal} className="p-1"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Code devise (ISO) *</label>
                <input type="text" name="code" value={formData.code} onChange={handleChange} placeholder="EUR, USD, GBP..." maxLength="3" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary uppercase" required />
                <p className="text-xs text-slate-500 mt-1">Code ISO à 3 lettres</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nom de la devise *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Euro, Dollar US..." className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Symbole *</label>
                <input type="text" name="symbol" value={formData.symbol} onChange={handleChange} placeholder="€, $, £..." className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary" required />
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <input type="checkbox" name="is_base_currency" checked={formData.is_base_currency} onChange={handleChange} id="is_base_currency" className="w-4 h-4 text-primary rounded" />
                <label htmlFor="is_base_currency" className="text-sm font-medium">Devise de base</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary/90">{editingCurrency ? 'Modifier' : 'Ajouter'}</button>
                <button type="button" onClick={handleCloseModal} className="flex-1 border rounded-lg py-2">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyManagement;