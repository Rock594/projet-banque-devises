import React from 'react';
import { useParams, Link } from 'react-router-dom';

const TransactionDetail = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Détail de la transaction #{id}</h1>
        <Link to="/transactions" className="text-primary hover:underline">
          ← Retour aux transactions
        </Link>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <p className="text-slate-500">Page en construction - Détails de la transaction</p>
      </div>
    </div>
  );
};

export default TransactionDetail;