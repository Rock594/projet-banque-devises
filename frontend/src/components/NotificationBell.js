import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fonction pour récupérer les notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/notifications/');
      const data = response.data;
      setNotifications(data);
      const unread = data.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
      // Données de démonstration
      const mockNotifs = [
        { id: 1, message: 'Bienvenue sur GlobalBank Exchange', type: 'success', read: false, created_at: new Date().toISOString() },
        { id: 2, message: 'Cliquez pour commencer à utiliser l\'application', type: 'info', read: false, created_at: new Date().toISOString() },
      ];
      setNotifications(mockNotifs);
      setUnreadCount(mockNotifs.filter(n => !n.read).length);
    }
  }, []);

  // Récupérer le compteur de notifications non lues
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get('/notifications/count/');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Erreur compteur:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnreadCount]);

  // Marquer une notification comme lue
  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read/`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur:', error);
      // Mise à jour locale
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all/');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('Toutes les notifications ont été marquées comme lues', { icon: '✓' });
    } catch (error) {
      console.error('Erreur:', error);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('Toutes les notifications marquées comme lues');
    }
  };

  // Ajouter une notification (appelée depuis d'autres composants)
  const addNotification = async (message, type = 'info') => {
    try {
      await api.post('/notifications/add/', { message, type });
      fetchNotifications();
      fetchUnreadCount();
      // Afficher un toast
      if (type === 'success') {
        toast.success(message);
      } else if (type === 'error') {
        toast.error(message);
      } else {
        toast(message, { icon: '🔔' });
      }
    } catch (error) {
      console.error('Erreur ajout notification:', error);
      // Mode démo
      const newNotif = {
        id: Date.now(),
        message,
        type,
        read: false,
        created_at: new Date().toISOString()
      };
      setNotifications([newNotif, ...notifications]);
      setUnreadCount(prev => prev + 1);
      toast(message, { icon: '🔔' });
    }
  };

  // Gérer le clic sur une notification
  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    setShowDropdown(false);
    
    // Rediriger selon le type de notification
    if (notif.type === 'transaction') {
      window.location.href = '/transactions';
    } else if (notif.type === 'rate') {
      window.location.href = '/rates';
    } else if (notif.type === 'user') {
      window.location.href = '/users';
    }
  };

  // Obtenir l'icône selon le type
  const getIcon = (type) => {
    switch(type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'transaction': return '💰';
      case 'rate': return '📈';
      case 'user': return '👤';
      default: return '🔔';
    }
  };

  // Obtenir la couleur de fond selon le type
  const getBgColor = (type, read) => {
    if (read) return 'bg-white dark:bg-slate-800';
    switch(type) {
      case 'success': return 'bg-green-50 dark:bg-green-900/20';
      case 'error': return 'bg-red-50 dark:bg-red-900/20';
      case 'warning': return 'bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'bg-blue-50 dark:bg-blue-900/20';
    }
  };

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays === 1) return 'Hier';
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative transition-colors"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center px-1 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-20 overflow-hidden">
            {/* En-tête */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-primary/5">
              <div>
                <h3 className="font-semibold text-lg">Notifications</h3>
                <p className="text-xs text-slate-500">
                  {unreadCount === 0 ? 'Aucune notification non lue' : `${unreadCount} notification(s) non lue(s)`}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:underline"
                >
                  Tout marquer lu
                </button>
              )}
            </div>
            
            {/* Liste des notifications */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <span className="material-symbols-outlined text-4xl mb-2">notifications_off</span>
                  <p>Aucune notification</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 border-b border-slate-100 dark:border-slate-700 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50 ${getBgColor(notif.type, notif.read)} ${!notif.read ? 'border-l-4 border-l-primary' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getIcon(notif.type)}</span>
                      <div className="flex-1">
                        <p className={`text-sm ${!notif.read ? 'font-semibold' : ''}`}>
                          {notif.message}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatDate(notif.created_at)}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Pied de page */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-700 text-center bg-slate-50 dark:bg-slate-800/50">
              <button 
                onClick={() => setShowDropdown(false)}
                className="text-xs text-slate-500 hover:text-primary transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;