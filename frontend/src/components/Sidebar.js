import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

const Sidebar = () => {
  const { user } = useAuth();
  const { settings } = useSettings();

  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: 'dashboard', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'TELLER'] },
    { name: 'Transactions', href: '/transactions', icon: 'history', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'TELLER'] },
    { name: 'Taux de change', href: '/rates', icon: 'currency_exchange', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
    { name: 'Utilisateurs', href: '/users', icon: 'group', roles: ['SUPER_ADMIN', 'ADMIN'] },
    { name: 'Rapports', href: '/reports', icon: 'description', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
    { name: 'Audit', href: '/audit', icon: 'verified', roles: ['SUPER_ADMIN'] },
    { name: 'Paramètres', href: '/settings', icon: 'settings', roles: ['SUPER_ADMIN'] },
    { name: 'Gestion devises', href: '/currencies/manage', icon: 'manage_accounts', roles: ['SUPER_ADMIN', 'ADMIN'] },
  ];

  const filteredNav = navigation.filter(item => 
    item.roles.includes(user?.role || 'TELLER')
  );

  return (
    <aside className="w-64 fixed h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined">account_balance</span>
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white text-lg">
              {settings.institution_name || 'ExchangePro'}
            </h1>
            <p className="text-xs text-slate-500">{user?.role_display || 'Banque Centrale'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {filteredNav.map((item) => (
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

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold text-lg">
                {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.full_name || user?.username}</p>
            <p className="text-xs text-slate-500 truncate">{user?.role_display}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;