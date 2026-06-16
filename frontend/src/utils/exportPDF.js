import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Exporter les transactions en PDF
export const exportTransactionsToPDF = (transactions, title = 'Rapport des transactions') => {
  try {
    if (!transactions || transactions.length === 0) {
      console.error('Aucune transaction à exporter');
      return false;
    }

    console.log('Export PDF - Transactions:', transactions.length);
    
    // Créer un nouveau document PDF en mode paysage
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // En-tête avec logo
    doc.setFillColor(15, 73, 189);
    doc.rect(0, 0, 297, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('GlobalBank Exchange', 14, 18);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Rapport d\'activité - Transactions', 14, 32);
    
    // Réinitialiser la couleur
    doc.setTextColor(0, 0, 0);
    
    // Titre du rapport
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 55);
    
    // Date et heure
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const now = new Date();
    doc.text(`Généré le : ${now.toLocaleString('fr-FR')}`, 14, 65);
    
    // Métadonnées
    const totalVolume = transactions.reduce((sum, t) => sum + (t.amount_from || 0), 0);
    const averageAmount = transactions.length > 0 ? totalVolume / transactions.length : 0;
    
    doc.setFontSize(10);
    doc.text(`Total transactions : ${transactions.length}`, 14, 77);
    doc.text(`Volume total : ${totalVolume.toLocaleString()} €`, 14, 85);
    doc.text(`Moyenne : ${averageAmount.toLocaleString()} €`, 14, 93);
    
    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 100, 283, 100);
    
    // Préparer les données du tableau
    const tableColumn = ["ID", "Client", "Type", "Montant", "Statut", "Date"];
    const tableRows = [];
    
    transactions.forEach(transaction => {
      const transactionData = [
        transaction.transaction_id || 'N/A',
        transaction.client_name || 'N/A',
        transaction.type_display || transaction.transaction_type || 'N/A',
        `${(transaction.amount_from || 0).toLocaleString()} €`,
        transaction.status_display || transaction.status || 'N/A',
        transaction.created_at ? new Date(transaction.created_at).toLocaleDateString('fr-FR') : 'N/A'
      ];
      tableRows.push(transactionData);
    });
    
    // Créer le tableau
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 105,
      theme: 'striped',
      headStyles: { 
        fillColor: [15, 73, 189], 
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        halign: 'center'
      },
      alternateRowStyles: { 
        fillColor: [245, 245, 245] 
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 40 },
        2: { cellWidth: 25 },
        3: { cellWidth: 35 },
        4: { cellWidth: 30 },
        5: { cellWidth: 35 }
      },
      margin: { left: 14, right: 14 }
    });
    
    // Pied de page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} sur ${pageCount}`, 14, doc.internal.pageSize.height - 10);
      doc.text('GlobalBank Exchange - Rapport confidentiel', doc.internal.pageSize.width - 60, doc.internal.pageSize.height - 10);
    }
    
    // Sauvegarder
    const filename = `rapport_transactions_${now.toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    console.log('PDF généré avec succès:', filename);
    return true;
    
  } catch (error) {
    console.error('Erreur détaillée PDF:', error);
    return false;
  }
};

// Exporter une facture PDF
export const exportInvoicePDF = (transaction, clientInfo) => {
  try {
    if (!transaction) {
      console.error('Aucune transaction à exporter');
      return false;
    }

    console.log('Export Facture PDF - Transaction:', transaction.transaction_id);
    
    const doc = new jsPDF();
    
    // En-tête
    doc.setFillColor(15, 73, 189);
    doc.rect(0, 0, 210, 50, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURE', 14, 25);
    
    doc.setFontSize(10);
    doc.text('GlobalBank Exchange - Service des changes', 14, 40);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Facture N°: ${transaction.transaction_id || 'N/A'}`, 14, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 14, 75);
    doc.text(`Heure: ${new Date().toLocaleTimeString('fr-FR')}`, 14, 83);
    
    // Cadre informations client
    doc.setDrawColor(200, 200, 200);
    doc.rect(14, 95, 182, 45);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Informations client', 20, 110);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nom: ${clientInfo?.name || transaction.client_name || 'N/A'}`, 20, 122);
    doc.text(`Email: ${clientInfo?.email || 'N/A'}`, 20, 132);
    
    // Cadre détails transaction
    doc.rect(14, 150, 182, 70);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Détails de la transaction', 20, 165);
    
    const tableRows = [
      ["Type de transaction", transaction.type_display || transaction.transaction_type || 'N/A'],
      ["Devise source", transaction.from_currency_code || 'EUR'],
      ["Devise cible", transaction.to_currency_code || 'USD'],
      ["Montant", `${(transaction.amount_from || 0).toLocaleString()} €`],
      ["Taux appliqué", transaction.rate_applied || '1.0850'],
      ["Montant reçu", `${(transaction.amount_to || (transaction.amount_from * 1.085)).toLocaleString()} €`],
      ["Statut", transaction.status_display || transaction.status || 'Complétée']
    ];
    
    doc.autoTable({
      body: tableRows,
      startY: 172,
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 }, 1: { cellWidth: 100 } },
      margin: { left: 20, right: 20 }
    });
    
    // Pied de page
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Merci de votre confiance - GlobalBank Exchange', 105, 285, { align: 'center' });
    
    const filename = `facture_${transaction.transaction_id || 'facture'}.pdf`;
    doc.save(filename);
    console.log('Facture PDF générée:', filename);
    return true;
    
  } catch (error) {
    console.error('Erreur facture PDF:', error);
    return false;
  }
};

// Exporter les utilisateurs en PDF
export const exportUsersToPDF = (users) => {
  try {
    if (!users || users.length === 0) {
      console.error('Aucun utilisateur à exporter');
      return false;
    }

    const doc = new jsPDF();
    
    doc.setFillColor(15, 73, 189);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('GlobalBank Exchange', 14, 15);
    doc.setFontSize(12);
    doc.text('Liste des utilisateurs', 14, 28);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Rapport des utilisateurs', 14, 50);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Généré le : ${new Date().toLocaleString('fr-FR')}`, 14, 60);
    doc.text(`Total utilisateurs : ${users.length}`, 14, 70);
    
    doc.line(14, 77, 196, 77);
    
    const tableColumn = ["ID", "Nom", "Email", "Rôle", "Statut"];
    const tableRows = users.map(user => [
      user.id || 'N/A',
      user.full_name || user.username || 'N/A',
      user.email || 'N/A',
      user.role_display || user.role || 'N/A',
      user.is_active ? 'Actif' : 'Inactif'
    ]);
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 82,
      theme: 'striped',
      headStyles: { fillColor: [15, 73, 189], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });
    
    doc.save(`rapport_utilisateurs_${new Date().toISOString().split('T')[0]}.pdf`);
    return true;
  } catch (error) {
    console.error('Erreur PDF:', error);
    return false;
  }
};


// Exporter l'audit en PDF
export const exportAuditToPDF = (logs, title = 'Journal d\'audit') => {
  try {
    if (!logs || logs.length === 0) {
      console.error('Aucun log à exporter');
      return false;
    }

    const doc = new jsPDF('landscape');
    
    // En-tête
    doc.setFillColor(15, 73, 189);
    doc.rect(0, 0, 297, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('GlobalBank Exchange', 14, 15);
    doc.setFontSize(12);
    doc.text(title, 14, 28);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Historique des actions système', 14, 50);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Généré le : ${new Date().toLocaleString('fr-FR')}`, 14, 60);
    doc.text(`Total actions : ${logs.length}`, 14, 70);
    
    doc.line(14, 77, 283, 77);
    
    const tableColumn = ["Utilisateur", "Action", "Détails", "IP", "Date"];
    const tableRows = logs.map(log => [
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
    return true;
  } catch (error) {
    console.error('Erreur PDF:', error);
    return false;
  }
};



// Exporter les taux de change en PDF
export const exportRatesToPDF = (rates) => {
  try {
    if (!rates || rates.length === 0) {
      console.error('Aucun taux à exporter');
      return false;
    }

    const doc = new jsPDF();
    
    doc.setFillColor(15, 73, 189);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('GlobalBank Exchange', 14, 15);
    doc.setFontSize(12);
    doc.text('Taux de change en temps réel', 14, 28);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Rapport des taux de change', 14, 50);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Généré le : ${new Date().toLocaleString('fr-FR')}`, 14, 60);
    doc.text(`Nombre de paires : ${rates.length}`, 14, 70);
    
    doc.line(14, 77, 196, 77);
    
    const tableColumn = ["Paire", "Taux Achat", "Taux Vente", "Variation"];
    const tableRows = rates.map(rate => [
      rate.pair || 'N/A',
      rate.buy_rate || rate.achat || 'N/A',
      rate.sell_rate || rate.vente || 'N/A',
      rate.change || '0%'
    ]);
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 82,
      theme: 'striped',
      headStyles: { fillColor: [15, 73, 189], textColor: 255 }
    });
    
    doc.save(`rapport_taux_change_${new Date().toISOString().split('T')[0]}.pdf`);
    return true;
  } catch (error) {
    console.error('Erreur PDF:', error);
    return false;
  }
};