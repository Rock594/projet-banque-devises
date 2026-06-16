import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import CurrencyManagement from './pages/CurrencyManagement';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Components
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import TransactionDetail from './pages/TransactionDetail';
import CurrencyRates from './pages/CurrencyRates';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NewTransaction from './pages/NewTransaction';
import Audit from './pages/Audit';

function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <Router>
          <AuthProvider>
            <Routes>
              {/* Routes publiques */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
              </Route>
              
              {/* Routes protégées */}
              <Route element={<PrivateRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/currencies/manage" element={<CurrencyManagement />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/transactions/:id" element={<TransactionDetail />} />
                  <Route path="/transactions/new" element={<NewTransaction />} />
                  <Route path="/rates" element={<CurrencyRates />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/audit" element={<Audit />} />
                </Route>
              </Route>
            </Routes>
          </AuthProvider>
        </Router>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;