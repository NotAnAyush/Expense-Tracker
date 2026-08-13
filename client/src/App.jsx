import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Shell/Sidebar';
import { Header } from './components/Shell/Header';
import { CopilotDrawer } from './components/Copilot/CopilotDrawer';
import { ExpenseFormModal } from './components/Expenses/ExpenseFormModal';

import { DashboardPage } from './pages/DashboardPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { GoalsPage } from './pages/GoalsPage';
import { RecurringPage } from './pages/RecurringPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuthPage } from './pages/AuthPage';
import { apiFetch } from './api/client';

const MainApp = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (user) {
      apiFetch('/categories')
        .then((res) => setCategories(res || []))
        .catch(() => {});
    }
  }, [user, refreshKey]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-soft)', color: 'var(--mute)' }}>
        Initializing Personal Finance Intelligence Platform...
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (val && activeTab !== 'expenses') {
      setActiveTab('expenses');
    }
  };

  const handleSaveExpense = async (expenseData) => {
    await apiFetch('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCopilot={() => setCopilotOpen(true)}
      />

      <div className="main-wrapper">
        <Header
          onAddExpense={() => setExpenseModalOpen(true)}
          onOpenCopilot={() => setCopilotOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
        />

        <main className="main-content">
          {activeTab === 'dashboard' && (
            <DashboardPage
              key={refreshKey}
              onOpenCopilot={() => setCopilotOpen(true)}
              onAddExpense={() => setExpenseModalOpen(true)}
            />
          )}
          {activeTab === 'expenses' && (
            <ExpensesPage
              key={refreshKey}
              onAddExpense={() => setExpenseModalOpen(true)}
              externalSearch={searchQuery}
              onClearExternalSearch={() => setSearchQuery('')}
              categories={categories}
            />
          )}
          {activeTab === 'budgets' && <BudgetsPage key={refreshKey} categories={categories} />}
          {activeTab === 'goals' && <GoalsPage key={refreshKey} />}
          {activeTab === 'recurring' && <RecurringPage key={refreshKey} categories={categories} />}
          {activeTab === 'analytics' && <AnalyticsPage key={refreshKey} />}
        </main>
      </div>

      <CopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
      />

      <ExpenseFormModal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        onSave={handleSaveExpense}
        categories={categories}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
