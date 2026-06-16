import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RoleBasedMenu = () => {
  const { user } = useAuth();
  const role = user?.role || 'TELLER';

  // Menus différents selon le rôle
  const menus = {
    SUPER_ADMIN: [
      { name: 'Tableau de bord', href: '/dashboard', icon: 'dashboard' },
      { name: 'Transactions', href: '/transactions', icon: 'history' },
      { name: 'Taux de change', href: '/rates', icon: 'currency_exchange' },
      { name: 'Utilisateurs', href: '/users', icon: 'group' },
      { name: 'Rapports', href: '/reports', icon: 'description' },
      { name: 'Audit', href: '/audit', icon: 'verified' },
      { name: 'Paramètres', href: '/settings', icon: 'settings' },
    ],
    ADMIN: [
      { name: 'Tableau de bord', href: '/dashboard', icon: 'dashboard' },
      { name: 'Transactions', href: '/transactions', icon: 'history' },
      { name: 'Taux de change', href: '/rates', icon: 'currency_exchange' },
      { name: 'Utilisateurs', href: '/users', icon: 'group' },
      { name: 'Rapports', href: '/reports', icon: 'description' },
    ],
    MANAGER: [
      { name: 'Tableau de bord', href: '/dashboard', icon: 'dashboard' },
      { name: 'Transactions', href: '/transactions', icon: 'history' },
      { name: 'Taux de change', href: '/rates', icon: 'currency_exchange' },
      { name: 'Rapports', href: '/reports', icon: 'description' },
    ],
    TELLER: [
      { name: 'Tableau de bord', href: '/dashboard', icon: 'dashboard' },
      { name: 'Transactions', href: '/transactions', icon: 'history' },
      { name: 'Nouvelle transaction', href: '/transactions/new', icon: 'add_circle' },
    ],
  };

  const userMenus = menus[role] || menus.TELLER;

  return (
    <nav className="flex-1 px-4 space-y-1 mt-4">
      {userMenus.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
            ${isActive 
              ? 'bg-primary text-white' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }
          `}
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <span className="text-sm font-medium">{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default RoleBasedMenu;