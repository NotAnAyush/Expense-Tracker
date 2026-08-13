import React, { useState } from 'react';
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0f19', color: 'var(--text-muted)' }}>
        Initializing Personal Finance Intelligence Platform...
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

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

      <main className="main-content">
        <Header
          onAddExpense={() => setExpenseModalOpen(true)}
          onOpenCopilot={() => setCopilotOpen(true)}
        />

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
          />
        )}
        {activeTab === 'budgets' && <BudgetsPage key={refreshKey} />}
        {activeTab === 'goals' && <GoalsPage key={refreshKey} />}
        {activeTab === 'recurring' && <RecurringPage key={refreshKey} />}
        {activeTab === 'analytics' && <AnalyticsPage key={refreshKey} />}
      </main>

      <CopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
      />

      <ExpenseFormModal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        onSave={handleSaveExpense}
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
