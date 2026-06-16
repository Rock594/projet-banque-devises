import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const NewTransaction = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);  // Initialisé à [] (tableau vide)
  const [clients, setClients] = useState([]);        // Initialisé à [] (tableau vide)
  const [formData, setFormData] = useState({
    client: '',
    transaction_type: 'BUY',
    from_currency: '',
    to_currency: '',
    amount_from: '',
    rate_applied: '',
    notes: ''
  });

  useEffect(() => {
    fetchCurrencies();
    fetchClients();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const response = await api.get('/currencies/');
      // Vérifier que la réponse est un tableau
      if (Array.isArray(response.data)) {
        setCurrencies(response.data);
      } else if (response.data.results && Array.isArray(response.data.results)) {
        setCurrencies(response.data.results);
      } else {
        // Données par défaut
        setCurrencies([
          { id: 1, code: 'USD', name: 'Dollar US', symbol: '$' },
          { id: 2, code: 'EUR', name: 'Euro', symbol: '€' },
          { id: 3, code: 'GBP', name: 'Livre Sterling', symbol: '£' },
          { id: 4, code: 'JPY', name: 'Yen Japonais', symbol: '¥' },
          { id: 5, code: 'MGA', name: 'Ariary Malagasy', symbol: 'Ar' },
        ]);
      }
    } catch (error) {
      console.error('Erreur chargement devises:', error);
      // Données par défaut en cas d'erreur
      setCurrencies([
        { id: 1, code: 'USD', name: 'Dollar US', symbol: '$' },
        { id: 2, code: 'EUR', name: 'Euro', symbol: '€' },
        { id: 3, code: 'GBP', name: 'Livre Sterling', symbol: '£' },
        { id: 4, code: 'JPY', name: 'Yen Japonais', symbol: '¥' },
        { id: 5, code: 'MGA', name: 'Ariary Malagasy', symbol: 'Ar' },
      ]);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/users/');
      if (response.data.results && Array.isArray(response.data.results)) {
        setClients(response.data.results);
      } else if (Array.isArray(response.data)) {
        setClients(response.data);
      } else {
        setClients([
          { id: 1, username: 'Jean Dupont', email: 'jean@email.com' },
          { id: 2, username: 'Sarah Smith', email: 'sarah@email.com' },
          { id: 3, username: 'Marc Lambert', email: 'marc@email.com' },
        ]);
      }
    } catch (error) {
      console.error('Erreur chargement clients:', error);
      setClients([
        { id: 1, username: 'Jean Dupont', email: 'jean@email.com' },
        { id: 2, username: 'Sarah Smith', email: 'sarah@email.com' },
        { id: 3, username: 'Marc Lambert', email: 'marc@email.com' },
      ]);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.client) {
      toast.error('Veuillez sélectionner un client');
      return;
    }
    if (!formData.from_currency) {
      toast.error('Veuillez sélectionner une devise source');
      return;
    }
    if (!formData.to_currency) {
      toast.error('Veuillez sélectionner une devise cible');
      return;
    }
    if (!formData.amount_from || formData.amount_from <= 0) {
      toast.error('Veuillez saisir un montant valide');
      return;
    }
    if (!formData.rate_applied || formData.rate_applied <= 0) {
      toast.error('Veuillez saisir un taux valide');
      return;
    }

    setLoading(true);
    try {
      const transactionData = {
        ...formData,
        amount_from: parseFloat(formData.amount_from),
        rate_applied: parseFloat(formData.rate_applied)
      };
      
      await api.post('/transactions/', transactionData);
      toast.success('Transaction créée avec succès !');
      navigate('/transactions');
    } catch (error) {
      console.error('Erreur création:', error);
      toast.error('Erreur lors de la création de la transaction');
    } finally {
      setLoading(false);
    }
  };

  // Vérifier que currencies est bien un tableau avant d'appeler map
  if (!Array.isArray(currencies)) {
    return <div className="text-center py-8">Chargement des devises...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Nouvelle transaction
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Créez une nouvelle opération de change
          </p>
        </div>
        <button
          onClick={() => navigate('/transactions')}
          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          ← Retour
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
        {/* Client */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Client *
          </label>
          <select
            name="client"
            value={formData.client}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Sélectionner un client</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.username || client.full_name} - {client.email}
              </option>
            ))}
          </select>
        </div>

        {/* Type de transaction */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Type de transaction *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="transaction_type"
                value="BUY"
                checked={formData.transaction_type === 'BUY'}
                onChange={handleChange}
                className="text-primary"
              />
              <span>Achat (Buy)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="transaction_type"
                value="SELL"
                checked={formData.transaction_type === 'SELL'}
                onChange={handleChange}
                className="text-primary"
              />
              <span>Vente (Sell)</span>
            </label>
          </div>
        </div>

        {/* Devises */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Devise source *
            </label>
            <select
              name="from_currency"
              value={formData.from_currency}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              required
            >
              <option value="">Sélectionner</option>
              {currencies.map(currency => (
                <option key={currency.id} value={currency.id}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Devise cible *
            </label>
            <select
              name="to_currency"
              value={formData.to_currency}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              required
            >
              <option value="">Sélectionner</option>
              {currencies.map(currency => (
                <option key={currency.id} value={currency.id}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Montant et taux */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Montant *
            </label>
            <input
              type="number"
              name="amount_from"
              value={formData.amount_from}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Taux appliqué *
            </label>
            <input
              type="number"
              name="rate_applied"
              value={formData.rate_applied}
              onChange={handleChange}
              placeholder="0.0000"
              step="0.0001"
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              required
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Notes (optionnel)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            placeholder="Informations complémentaires..."
          />
        </div>

        {/* Boutons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Création en cours...' : 'Créer la transaction'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/transactions')}
            className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewTransaction;