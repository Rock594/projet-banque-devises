import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNotification } from '../components/NotificationBell';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Nouvel utilisateur
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'TELLER'
  });
  
  // Utilisateur en cours de modification
  const [editUser, setEditUser] = useState({
    id: null,
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: '',
    is_active: true
  });
  
  const searchInputRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    fetchUsers();
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
  }, [searchTerm, roleFilter, statusFilter, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/');
      const data = response.data.results || [];
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Erreur:', error);
      const demoData = [
        { id: 1, username: 'admin', email: 'admin@globalbank.com', first_name: 'Admin', last_name: 'System', full_name: 'Admin System', role: 'SUPER_ADMIN', role_display: 'Super Admin', is_active: true, avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
        { id: 2, username: 'Sophie Martin', email: 'manager@globalbank.com', first_name: 'Sophie', last_name: 'Martin', full_name: 'Sophie Martin', role: 'MANAGER', role_display: 'Manager', is_active: true, avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
        { id: 3, username: 'Jean Dupont', email: 'caissier@globalbank.com', first_name: 'Jean', last_name: 'Dupont', full_name: 'Jean Dupont', role: 'TELLER', role_display: 'Caissier', is_active: true, avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
        { id: 4, username: 'Marius Rabobason', email: 'marius@globalbank.com', first_name: 'Marius', last_name: 'Rabobason', full_name: 'Marius Rabobason', role: 'TELLER', role_display: 'Caissier', is_active: true, avatar: 'https://randomuser.me/api/portraits/men/4.jpg' },
      ];
      setUsers(demoData);
      setFilteredUsers(demoData);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.username?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.full_name?.toLowerCase().includes(term)
      );
    }
    
    if (roleFilter) {
      filtered = filtered.filter(u => u.role === roleFilter);
    }
    
    if (statusFilter) {
      const isActive = statusFilter === 'actif';
      filtered = filtered.filter(u => u.is_active === isActive);
    }
    
    setFilteredUsers(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    // Correction: utiliser toast.success au lieu de toast.info
    toast.success('Filtres réinitialisés', { icon: '🔍', duration: 2000 });
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditUser({
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      role: user.role,
      is_active: user.is_active
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      // Correction: Utiliser la bonne URL pour la mise à jour
      await api.patch(`/users/${editUser.id}/`, {
        username: editUser.username,
        email: editUser.email,
        first_name: editUser.first_name,
        last_name: editUser.last_name,
        role: editUser.role
      });
      
      const updatedUsers = users.map(u => 
        u.id === editUser.id ? { ...u, ...editUser, full_name: `${editUser.first_name} ${editUser.last_name}`.trim() || editUser.username } : u
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      
      toast.success('Utilisateur modifié avec succès');
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Erreur:', error);
      // Mise à jour locale même si l'API échoue (mode démo)
      const updatedUsers = users.map(u => 
        u.id === editUser.id ? { ...u, ...editUser, full_name: `${editUser.first_name} ${editUser.last_name}`.trim() || editUser.username } : u
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      toast.success('Utilisateur modifié (mode démo)');
      setShowEditModal(false);
      setSelectedUser(null);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/users/', newUser);
      setUsers([...users, response.data]);
      setFilteredUsers([...filteredUsers, response.data]);
      setShowAddModal(false);
      setNewUser({ username: '', email: '', first_name: '', last_name: '', role: 'TELLER' });
      toast.success('Utilisateur ajouté avec succès');
    } catch (error) {
      // Mode démo
      const newId = Math.max(...users.map(u => u.id), 0) + 1;
      const newUserData = {
        id: newId,
        ...newUser,
        full_name: `${newUser.first_name} ${newUser.last_name}`.trim() || newUser.username,
        role_display: newUser.role === 'SUPER_ADMIN' ? 'Super Admin' : newUser.role === 'ADMIN' ? 'Administrateur' : newUser.role === 'MANAGER' ? 'Manager' : 'Caissier',
        is_active: true
      };
      setUsers([...users, newUserData]);
      setFilteredUsers([...filteredUsers, newUserData]);
      setShowAddModal(false);
      setNewUser({ username: '', email: '', first_name: '', last_name: '', role: 'TELLER' });
      toast.success('Utilisateur ajouté avec succès (mode démo)');
    }
  };


  const handleToggleStatus = async (user) => {
    try {
      if (user.is_active) {
        await api.post(`/users/${user.id}/deactivate/`);
        toast.success(`Utilisateur ${user.username} désactivé`);
      } else {
        await api.post(`/users/${user.id}/activate/`);
        toast.success(`Utilisateur ${user.username} réactivé`);
      }
      fetchUsers();
    } catch (error) {
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, is_active: !u.is_active } : u
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      toast.success(`Utilisateur ${user.username} ${user.is_active ? 'désactivé' : 'réactivé'} (mode démo)`);
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      'SUPER_ADMIN': 'bg-purple-100 text-purple-800',
      'ADMIN': 'bg-blue-100 text-blue-800',
      'MANAGER': 'bg-green-100 text-green-800',
      'TELLER': 'bg-gray-100 text-gray-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleName = (role) => {
    const names = {
      'SUPER_ADMIN': 'Super Admin',
      'ADMIN': 'Administrateur',
      'MANAGER': 'Manager',
      'TELLER': 'Caissier',
    };
    return names[role] || role;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-500">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des utilisateurs</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gérez les accès et permissions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/90 flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
        >
          <span className="material-symbols-outlined text-lg">person_add</span>
          Ajouter un utilisateur
        </button>
      </div>

      {/* Panneau de filtres */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative md:col-span-2">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Rechercher par nom, email..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
            />
          </div>
          
          <select
            value={roleFilter}
            onChange={handleRoleFilterChange}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white dark:bg-slate-900"
          >
            <option value="">Tous les rôles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Administrateur</option>
            <option value="MANAGER">Manager</option>
            <option value="TELLER">Caissier</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white dark:bg-slate-900"
          >
            <option value="">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
          </select>
          
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Effacer les filtres
          </button>
        </div>
        
        <div className="mt-3 text-sm text-slate-500">
          {filteredUsers.length} utilisateur(s) trouvé(s)
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rôle</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-semibold text-sm">
                            {user.full_name?.charAt(0) || user.username?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white text-sm">
                          {user.full_name || user.username}
                        </p>
                        <p className="text-xs text-slate-400">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600 dark:text-slate-300">{user.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                      {getRoleName(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {user.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="p-1.5 text-slate-400 hover:text-primary rounded-lg transition-colors"
                        title="Modifier l'utilisateur"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`p-1.5 rounded-lg transition-colors ${user.is_active ? 'text-slate-400 hover:text-red-600' : 'text-slate-400 hover:text-green-600'}`}
                        title={user.is_active ? 'Désactiver' : 'Activer'}
                      >
                        <span className="material-symbols-outlined text-base">{user.is_active ? 'person_off' : 'person_check'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">group_off</span>
            <p className="text-slate-500 text-center">Aucun utilisateur trouvé</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-primary hover:underline text-sm"
            >
              Ajouter un utilisateur
            </button>
          </div>
        )}
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ajouter un utilisateur</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nom d'utilisateur *
                </label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={newUser.first_name}
                    onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={newUser.last_name}
                    onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Rôle
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white dark:bg-slate-900"
                >
                  <option value="TELLER">Caissier</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Administrateur</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowEditModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Modifier l'utilisateur
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nom d'utilisateur *
                </label>
                <input
                  type="text"
                  value={editUser.username}
                  onChange={(e) => setEditUser({...editUser, username: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={editUser.first_name}
                    onChange={(e) => setEditUser({...editUser, first_name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={editUser.last_name}
                    onChange={(e) => setEditUser({...editUser, last_name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Rôle
                </label>
                <select
                  value={editUser.role}
                  onChange={(e) => setEditUser({...editUser, role: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white dark:bg-slate-900"
                >
                  <option value="TELLER">Caissier</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Administrateur</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;