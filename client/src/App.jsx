import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PrivacyProvider } from './context/PrivacyContext';
import { Sidebar } from './components/Shell/Sidebar';
import { Header } from './components/Shell/Header';
import { CopilotDrawer } from './components/Copilot/CopilotDrawer';
import { ExpenseFormModal } from './components/Expenses/ExpenseFormModal';
import { IncomeFormModal } from './components/Expenses/IncomeFormModal';
import { ReceiptScanModal } from './components/Expenses/ReceiptScanModal';
import { VoiceQuickLogModal } from './components/Expenses/VoiceQuickLogModal';
import { BankStatementModal } from './components/Expenses/BankStatementModal';

import { DashboardPage } from './pages/DashboardPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { WealthSimulatorPage } from './pages/WealthSimulatorPage';
import { TripVaultPage } from './pages/TripVaultPage';
import { GroupSplitPage } from './pages/GroupSplitPage';
import { DebtPayoffPage } from './pages/DebtPayoffPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { GoalsPage } from './pages/GoalsPage';
import { RecurringPage } from './pages/RecurringPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { apiFetch } from './api/client';
import { WifiOff, Wifi } from 'lucide-react';

const VALID_TABS = ['dashboard', 'expenses', 'fire', 'trips', 'splits', 'debts', 'budgets', 'goals', 'recurring', 'analytics', 'settings'];

const getInitialTab = () => {
  const hash = window.location.hash.replace('#', '').trim();
  if (VALID_TABS.includes(hash)) {
    return hash;
  }
  const saved = localStorage.getItem('richy_active_tab');
  if (VALID_TABS.includes(saved)) {
    return saved;
  }
  return 'dashboard';
};

const MainApp = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTabState] = useState(getInitialTab);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [receiptScanModalOpen, setReceiptScanModalOpen] = useState(false);
  const [voiceLogModalOpen, setVoiceLogModalOpen] = useState(false);
  const [bankImportModalOpen, setBankImportModalOpen] = useState(false);
  const [prefilledExpenseData, setPrefilledExpenseData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOnlineToast, setShowOnlineToast] = useState(false);

  // Tab changer with Hash and LocalStorage synchronization
  const handleTabChange = useCallback((newTab) => {
    if (VALID_TABS.includes(newTab)) {
      setActiveTabState(newTab);
      localStorage.setItem('richy_active_tab', newTab);
      if (window.location.hash !== `#${newTab}`) {
        window.location.hash = newTab;
      }
    }
  }, []);

  // Listen to browser Back/Forward navigation (hashchange)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (VALID_TABS.includes(hash)) {
        setActiveTabState(hash);
        localStorage.setItem('richy_active_tab', hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    if (!window.location.hash) {
      window.location.hash = activeTab;
    }
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab]);

  // Online / Offline Connectivity Monitor
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineToast(true);
      const timer = setTimeout(() => setShowOnlineToast(false), 4000);
      return () => clearTimeout(timer);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineToast(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
      handleTabChange('expenses');
    }
  };

  const handleSaveExpense = async (expenseData) => {
    await apiFetch('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
    setPrefilledExpenseData(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleSaveIncome = async (incomeData) => {
    await apiFetch('/income', {
      method: 'POST',
      body: JSON.stringify(incomeData),
    });
    setRefreshKey((prev) => prev + 1);
  };

  const handleConfirmScan = (scannedData) => {
    setReceiptScanModalOpen(false);
    setPrefilledExpenseData(scannedData);
    setExpenseModalOpen(true);
  };

  const handleImportComplete = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="app-container">
      {/* Offline / Online Network Alert Pill */}
      {showOnlineToast && (
        <div
          style={{
            position: 'fixed',
            top: '16px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: 600,
            background: isOnline ? 'rgba(0, 255, 135, 0.15)' : 'rgba(255, 77, 77, 0.15)',
            border: `1px solid ${isOnline ? 'rgba(0, 255, 135, 0.4)' : 'rgba(255, 77, 77, 0.4)'}`,
            color: isOnline ? '#00FF87' : '#FF4D4D',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          }}
        >
          {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
          {isOnline ? 'Back Online — All data synced' : 'Working Offline — Drafts protected locally'}
        </div>
      )}

      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenCopilot={() => setCopilotOpen(true)}
      />

      <div className="main-wrapper">
        <Header
          onAddExpense={() => {
            setPrefilledExpenseData(null);
            setExpenseModalOpen(true);
          }}
          onAddIncome={() => setIncomeModalOpen(true)}
          onOpenReceiptScan={() => setReceiptScanModalOpen(true)}
          onOpenVoiceLog={() => setVoiceLogModalOpen(true)}
          onOpenBankImport={() => setBankImportModalOpen(true)}
          onOpenCopilot={() => setCopilotOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
        />

        <main className="main-content">
          {activeTab === 'dashboard' && (
            <DashboardPage
              key={refreshKey}
              onOpenCopilot={() => setCopilotOpen(true)}
              onAddExpense={() => {
                setPrefilledExpenseData(null);
                setExpenseModalOpen(true);
              }}
              onAddIncome={() => setIncomeModalOpen(true)}
              onOpenReceiptScan={() => setReceiptScanModalOpen(true)}
              onOpenVoiceLog={() => setVoiceLogModalOpen(true)}
              onOpenBankImport={() => setBankImportModalOpen(true)}
            />
          )}
          {activeTab === 'expenses' && (
            <ExpensesPage
              key={refreshKey}
              onAddExpense={() => {
                setPrefilledExpenseData(null);
                setExpenseModalOpen(true);
              }}
              onAddIncome={() => setIncomeModalOpen(true)}
              onOpenReceiptScan={() => setReceiptScanModalOpen(true)}
              onOpenVoiceLog={() => setVoiceLogModalOpen(true)}
              onOpenBankImport={() => setBankImportModalOpen(true)}
              externalSearch={searchQuery}
              onClearExternalSearch={() => setSearchQuery('')}
              categories={categories}
            />
          )}
          {activeTab === 'fire' && <WealthSimulatorPage key={refreshKey} />}
          {activeTab === 'trips' && <TripVaultPage key={refreshKey} />}
          {activeTab === 'splits' && <GroupSplitPage key={refreshKey} />}
          {activeTab === 'debts' && <DebtPayoffPage key={refreshKey} />}
          {activeTab === 'budgets' && <BudgetsPage key={refreshKey} categories={categories} />}
          {activeTab === 'goals' && <GoalsPage key={refreshKey} />}
          {activeTab === 'recurring' && <RecurringPage key={refreshKey} categories={categories} />}
          {activeTab === 'analytics' && <AnalyticsPage key={refreshKey} />}
          {activeTab === 'settings' && <SettingsPage key={refreshKey} />}
        </main>
      </div>

      <CopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
      />

      <ExpenseFormModal
        isOpen={expenseModalOpen}
        onClose={() => {
          setExpenseModalOpen(false);
          setPrefilledExpenseData(null);
        }}
        onSave={handleSaveExpense}
        categories={categories}
        initialData={prefilledExpenseData}
        onOpenReceiptScan={() => {
          setExpenseModalOpen(false);
          setReceiptScanModalOpen(true);
        }}
      />

      <IncomeFormModal
        isOpen={incomeModalOpen}
        onClose={() => setIncomeModalOpen(false)}
        onSave={handleSaveIncome}
      />

      <ReceiptScanModal
        isOpen={receiptScanModalOpen}
        onClose={() => setReceiptScanModalOpen(false)}
        onConfirmScan={handleConfirmScan}
      />

      <VoiceQuickLogModal
        isOpen={voiceLogModalOpen}
        onClose={() => setVoiceLogModalOpen(false)}
        onSaveExpense={handleSaveExpense}
        categories={categories}
      />

      <BankStatementModal
        isOpen={bankImportModalOpen}
        onClose={() => setBankImportModalOpen(false)}
        onImportComplete={handleImportComplete}
        categories={categories}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PrivacyProvider>
        <MainApp />
      </PrivacyProvider>
    </AuthProvider>
  );
}
