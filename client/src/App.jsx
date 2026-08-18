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
import { TransactionDetailModal } from './components/Expenses/TransactionDetailModal';
import { EcommerceSyncModal } from './components/Expenses/EcommerceSyncModal';

import { CustomizationProvider } from './context/CustomizationContext';
import { DeviceCapabilityProvider } from './context/DeviceCapabilityContext';
import { StagedConfirmationBar } from './components/Customization/StagedConfirmationBar';
import { PwaInstallPrompt } from './components/Shell/PwaInstallPrompt';

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
import { PassiveIncomePage } from './pages/PassiveIncomePage';
import { FamilyVaultPage } from './pages/FamilyVaultPage';
import { CustomizationPage } from './pages/CustomizationPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthPage } from './pages/AuthPage';
import { apiFetch } from './api/client';
import { WifiOff, Wifi } from 'lucide-react';

const VALID_TABS = ['dashboard', 'expenses', 'fire', 'market', 'family', 'trips', 'splits', 'debts', 'budgets', 'goals', 'recurring', 'analytics', 'customization', 'settings', 'profile'];

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
  const [ecommerceSyncModalOpen, setEcommerceSyncModalOpen] = useState(false);
  const [selectedTransactionDetail, setSelectedTransactionDetail] = useState(null);
  const [selectedTransactionIsIncome, setSelectedTransactionIsIncome] = useState(false);
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

  // Global Keyboard Shortcuts (Alt+N for Quick Expense)
  useEffect(() => {
    const handleGlobalShortcuts = (e) => {
      if (e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        setPrefilledExpenseData(null);
        setExpenseModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, []);

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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-obsidian)', color: '#94A3B8' }}>
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

  const handleOpenTransactionDetail = (tx, isIncome = false) => {
    setSelectedTransactionDetail(tx);
    setSelectedTransactionIsIncome(isIncome);
  };

  const handleUpdateMotive = async (id, newMotive) => {
    await apiFetch(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ motive: newMotive }),
    });
    setRefreshKey((prev) => prev + 1);
  };

  const handleDuplicateExpense = async (tx) => {
    const clone = { ...tx };
    delete clone._id;
    delete clone.createdAt;
    delete clone.updatedAt;
    clone.title = `${clone.title} (Copy)`;
    await handleSaveExpense(clone);
  };

  const handleDeleteTransactionFromDetail = async (id) => {
    if (selectedTransactionIsIncome) {
      await apiFetch(`/income/${id}`, { method: 'DELETE' });
    } else {
      await apiFetch(`/expenses/${id}`, { method: 'DELETE' });
    }
    setRefreshKey((prev) => prev + 1);
    setSelectedTransactionDetail(null);
  };

  const handleExpenseSynced = () => {
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
            padding: '8px 16px',
            borderRadius: '999px',
            fontSize: '12.5px',
            fontWeight: 700,
            background: isOnline ? 'rgba(0, 255, 135, 0.12)' : 'rgba(244, 63, 94, 0.15)',
            border: `1px solid ${isOnline ? 'rgba(0, 255, 135, 0.35)' : 'rgba(244, 63, 94, 0.4)'}`,
            color: isOnline ? '#00FF87' : '#FB7185',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          }}
        >
          {isOnline ? <Wifi size={15} /> : <WifiOff size={15} />}
          {isOnline ? 'Back Online • Live sync active' : 'Offline Mode • Protected locally'}
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
          onOpenProfile={() => handleTabChange('profile')}
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
              onOpenEcommerceSync={() => setEcommerceSyncModalOpen(true)}
              onOpenTransactionDetail={handleOpenTransactionDetail}
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
              onOpenEcommerceSync={() => setEcommerceSyncModalOpen(true)}
              onOpenTransactionDetail={handleOpenTransactionDetail}
              externalSearch={searchQuery}
              onClearExternalSearch={() => setSearchQuery('')}
              categories={categories}
            />
          )}
          {activeTab === 'fire' && <WealthSimulatorPage key={refreshKey} />}
          {activeTab === 'market' && <PassiveIncomePage key={refreshKey} />}
          {activeTab === 'family' && <FamilyVaultPage key={refreshKey} />}
          {activeTab === 'trips' && <TripVaultPage key={refreshKey} />}
          {activeTab === 'splits' && <GroupSplitPage key={refreshKey} />}
          {activeTab === 'debts' && <DebtPayoffPage key={refreshKey} />}
          {activeTab === 'budgets' && <BudgetsPage key={refreshKey} categories={categories} />}
          {activeTab === 'goals' && <GoalsPage key={refreshKey} />}
          {activeTab === 'recurring' && <RecurringPage key={refreshKey} categories={categories} />}
          {activeTab === 'analytics' && <AnalyticsPage key={refreshKey} />}
          {activeTab === 'customization' && <CustomizationPage key={refreshKey} />}
          {activeTab === 'settings' && <SettingsPage key={refreshKey} />}
          {activeTab === 'profile' && <ProfilePage key={refreshKey} />}
        </main>
      </div>

      <StagedConfirmationBar />
      <PwaInstallPrompt />

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
        onSaveExpense={handleSaveExpense}
        categories={categories}
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

      <EcommerceSyncModal
        isOpen={ecommerceSyncModalOpen}
        onClose={() => setEcommerceSyncModalOpen(false)}
        onExpenseSynced={handleExpenseSynced}
      />

      <TransactionDetailModal
        isOpen={Boolean(selectedTransactionDetail)}
        onClose={() => setSelectedTransactionDetail(null)}
        transaction={selectedTransactionDetail}
        isIncome={selectedTransactionIsIncome}
        onEdit={(tx) => {
          setPrefilledExpenseData(tx);
          setExpenseModalOpen(true);
        }}
        onDelete={handleDeleteTransactionFromDetail}
        onDuplicate={handleDuplicateExpense}
        onUpdateMotive={handleUpdateMotive}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PrivacyProvider>
        <CustomizationProvider>
          <DeviceCapabilityProvider>
            <MainApp />
          </DeviceCapabilityProvider>
        </CustomizationProvider>
      </PrivacyProvider>
    </AuthProvider>
  );
}
