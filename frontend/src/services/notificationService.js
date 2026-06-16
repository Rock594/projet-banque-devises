import api from './api';

class NotificationService {
  // Ajouter une notification
  static async add(message, type = 'info', userId = 1) {
    try {
      await api.post('/notifications/add/', { user_id: userId, message, type });
      return true;
    } catch (error) {
      console.error('Erreur ajout notification:', error);
      return false;
    }
  }

  // Récupérer toutes les notifications
  static async getAll(userId = 1) {
    try {
      const response = await api.get('/notifications/', { params: { user_id: userId } });
      return response.data;
    } catch (error) {
      console.error('Erreur récupération:', error);
      return [];
    }
  }

  // Récupérer le compteur
  static async getUnreadCount(userId = 1) {
    try {
      const response = await api.get('/notifications/count/', { params: { user_id: userId } });
      return response.data.count;
    } catch (error) {
      console.error('Erreur compteur:', error);
      return 0;
    }
  }

  // Marquer comme lue
  static async markAsRead(notificationId) {
    try {
      await api.post(`/notifications/${notificationId}/read/`);
      return true;
    } catch (error) {
      console.error('Erreur:', error);
      return false;
    }
  }

  // Marquer toutes comme lues
  static async markAllAsRead(userId = 1) {
    try {
      await api.post('/notifications/read-all/', { user_id: userId });
      return true;
    } catch (error) {
      console.error('Erreur:', error);
      return false;
    }
  }

  // Notifications prédéfinies
  static async notifyTransactionCreated(transactionId) {
    return this.add(`Nouvelle transaction ${transactionId} créée`, 'success');
  }

  static async notifyUserCreated(username) {
    return this.add(`Utilisateur ${username} ajouté avec succès`, 'success');
  }

  static async notifyUserUpdated(username) {
    return this.add(`Utilisateur ${username} modifié avec succès`, 'info');
  }

  static async notifyRateUpdated(pair) {
    return this.add(`Taux de change ${pair} mis à jour`, 'rate');
  }

  static async notifyExportCompleted(format) {
    return this.add(`Export ${format.toUpperCase()} complété avec succès`, 'success');
  }
}

export default NotificationService;