import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Audit = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const response = await api.get('/audit/');
      setLogs(response.data);
    } catch (error) {
      console.error('Erreur:', error);
      // Données de démonstration avec IPs différentes
      const mockLogs = [];
      const actions = ['Connexion', 'Création transaction', 'Modification utilisateur', 'Export PDF'];
      const ips = ['192.168.1.101', '192.168.1.102', '192.168.1.103', '192.168.1.104', '10.0.0.1'];
      
      for (let i = 1; i <= 20; i++) {
        mockLogs.push({
          id: i,
          user: i % 2 === 0 ? 'admin' : 'manager',
          action: actions[Math.floor(Math.random() * actions.length)],
          details: `Action ${i} effectuée avec succès`,
          ip: ips[i % ips.length],
          timestamp: new Date(Date.now() - i * 86400000).toISOString()
        });
      }
      setLogs(mockLogs);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    const badges = {
      'Connexion': 'bg-green-100 text-green-800',
      'Création transaction': 'bg-blue-100 text-blue-800',
      'Modification utilisateur': 'bg-yellow-100 text-yellow-800',
      'Suppression': 'bg-red-100 text-red-800',
      'Export PDF': 'bg-purple-100 text-purple-800',
    };
    return badges[action] || 'bg-gray-100 text-gray-800';
  };

  const filteredLogs = logs.filter(log => {
    if (filter && !log.action.toLowerCase().includes(filter.toLowerCase())) return false;
    if (dateFilter) {
      const logDate = new Date(log.timestamp).toDateString();
      const filterDate = new Date(dateFilter).toDateString();
      if (logDate !== filterDate) return false;
    }
    return true;
  });

  // Fonction d'export PDF 
  const exportAuditToPDF = () => {
    if (!filteredLogs || filteredLogs.length === 0) {
      toast.error('Aucune donnée d\'audit à exporter');
      return;
    }
    
    try {
      const doc = new jsPDF('landscape');
      
      // En-tête
      doc.setFillColor(15, 73, 189);
      doc.rect(0, 0, 297, 35, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('GlobalBank Exchange', 14, 15);
      doc.setFontSize(12);
      doc.text('Journal d\'audit', 14, 28);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Historique des actions système', 14, 50);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Généré le : ${new Date().toLocaleString('fr-FR')}`, 14, 60);
      doc.text(`Total actions : ${filteredLogs.length}`, 14, 70);
      
      doc.line(14, 77, 283, 77);
      
      const tableColumn = ["Utilisateur", "Action", "Détails", "IP", "Date"];
      const tableRows = filteredLogs.map(log => [
        log.user || 'N/A',
        log.action || 'N/A',
        log.details || 'N/A',
        log.ip || 'N/A',
        new Date(log.timestamp).toLocaleString('fr-FR')
      ]);
      
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 82,
        theme: 'striped',
        headStyles: { fillColor: [15, 73, 189], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });
      
      doc.save(`rapport_audit_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF exporté avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'export PDF');
    }
  };

  // Calcul des statistiques
  const totalActions = logs.length;
  const uniqueUsers = new Set(logs.map(l => l.user)).size;
  const todayActions = logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length;

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Journal d'audit</h1>
        <p className="text-slate-500 mt-1">Historique complet des actions système</p>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">Action</label>
            <input
              type="text"
              placeholder="Filtrer par action..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setFilter(''); setDateFilter(''); }}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Effacer les filtres
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border p-4">
          <p className="text-slate-500 text-sm">Total actions</p>
          <p className="text-2xl font-bold">{totalActions}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border p-4">
          <p className="text-slate-500 text-sm">Utilisateurs actifs</p>
          <p className="text-2xl font-bold">{uniqueUsers}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border p-4">
          <p className="text-slate-500 text-sm">Aujourd'hui</p>
          <p className="text-2xl font-bold">{todayActions}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border p-4">
          <button
            onClick={exportAuditToPDF}
            className="w-full bg-primary text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
            Exporter PDF
          </button>
        </div>
      </div>

      {/* Tableau d'audit */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Détails</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">IP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium">{log.user}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{log.details}</td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      {log.ip}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(log.timestamp).toLocaleString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLogs.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500">Aucun log trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Audit;