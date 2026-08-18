import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Shield,
  DollarSign,
  PieChart,
  UserPlus,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Home,
  Crown,
  Lock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { apiFetch } from '../api/client';

export const FamilyVaultPage = () => {
  const [vaults, setVaults] = useState([]);
  const [activeVault, setActiveVault] = useState(null);
  const [vaultSummary, setVaultSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  // Form States
  const [createForm, setCreateForm] = useState({
    name: 'Sharma Household',
    description: 'Shared family expenses for groceries, utilities and rent',
    currency: '₹',
  });
  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    role: 'CONTRIBUTOR',
    monthlySpendingLimit: 0,
  });
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    category: 'Groceries & Supermarket',
    notes: '',
  });

  useEffect(() => {
    loadVaults();
  }, []);

  const loadVaults = async () => {
    try {
      const res = await apiFetch('/family');
      if (res?.vaults) {
        setVaults(res.vaults);
        if (res.vaults.length > 0 && !activeVault) {
          selectVault(res.vaults[0]);
        }
      }
    } catch (err) {
      console.warn('Error loading family vaults:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectVault = async (vault) => {
    setActiveVault(vault);
    try {
      const summary = await apiFetch(`/family/${vault._id}/summary`);
      setVaultSummary(summary);
    } catch (err) {
      console.warn('Error loading summary:', err.message);
    }
  };

  const handleCreateVault = async (e) => {
    e.preventDefault();
    try {
      const newVault = await apiFetch('/family', {
        method: 'POST',
        body: JSON.stringify(createForm),
      });
      setShowCreateModal(false);
      setVaults([newVault, ...vaults]);
      selectVault(newVault);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!activeVault) return;
    try {
      const updatedVault = await apiFetch(`/family/${activeVault._id}/members`, {
        method: 'POST',
        body: JSON.stringify(memberForm),
      });
      setShowAddMemberModal(false);
      selectVault(updatedVault);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!activeVault) return;
    try {
      const updatedVault = await apiFetch(`/family/${activeVault._id}/expenses`, {
        method: 'POST',
        body: JSON.stringify(expenseForm),
      });
      setShowAddExpenseModal(false);
      setExpenseForm({ title: '', amount: '', category: 'Groceries & Supermarket', notes: '' });
      selectVault(updatedVault);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Family Multi-User Vaults
            <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Shared Household RBAC
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage shared household groceries, rent, and utilities collectively while keeping personal private ledgers strictly isolated.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Family Vault
        </button>
      </div>

      {/* 2. Main Vault Workspace */}
      {vaults.length === 0 && !loading ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-10 text-center backdrop-blur-xl shadow-xl max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-4">
            <Home className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Family Vaults Created Yet</h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Create a family household pool to invite your spouse, parents, or siblings. Track shared groceries, utility bills, and rent seamlessly.
          </p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            Create Your First Family Ledger
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Vault Details & Members */}
          <div className="lg:col-span-1 space-y-5">
            {/* Vault Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{activeVault?.name}</h3>
                    <div className="text-[10px] text-slate-400">{activeVault?.currency} Shared Currency</div>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {activeVault?.members?.length || 1} Members
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-4">{activeVault?.description}</p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(true)}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  Log Shared Bill
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(true)}
                  className="py-2 px-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Invite
                </button>
              </div>
            </div>

            {/* Family Members List */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Household Members & Roles
              </h3>

              <div className="space-y-2.5">
                {activeVault?.members?.map((m) => (
                  <div key={m._id || m.email} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-400">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          {m.name}
                          {m.role === 'OWNER' && <Crown className="w-3 h-3 text-amber-400" />}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{m.email}</div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      m.role === 'OWNER'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : m.role === 'ADMIN'
                        ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Shared Spending Analytics & Ledger */}
          <div className="lg:col-span-2 space-y-5">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-xl">
                <div className="text-[11px] text-slate-400 mb-1">Total Household Spend</div>
                <div className="text-xl font-extrabold font-mono text-white">
                  {activeVault?.currency}{vaultSummary?.totalSharedSpend?.toLocaleString() || 0}
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-xl">
                <div className="text-[11px] text-slate-400 mb-1">Shared Bill Count</div>
                <div className="text-xl font-extrabold font-mono text-cyan-400">
                  {activeVault?.sharedExpenses?.length || 0}
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-xl col-span-2 sm:col-span-1">
                <div className="text-[11px] text-slate-400 mb-1">Privacy Isolation</div>
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
                  <Shield className="w-3.5 h-3.5" />
                  Private Ledgers 100% Guarded
                </div>
              </div>
            </div>

            {/* Recent Shared Expenses Table */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3 mb-3">
                <Receipt className="w-4 h-4 text-cyan-400" />
                Recent Shared Household Transactions
              </h3>

              {activeVault?.sharedExpenses?.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No shared bills logged yet. Click "Log Shared Bill" to record an expense.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60 font-mono text-xs">
                  {activeVault?.sharedExpenses?.slice(-10).reverse().map((exp, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white font-sans">{exp.title}</div>
                        <div className="text-[10px] text-slate-400 font-sans">
                          {exp.category} • Paid by <span className="text-cyan-300 font-semibold">{exp.paidByMemberName}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-rose-400">
                          -{activeVault?.currency}{exp.amount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(exp.date).toISOString().split('T')[0]}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE VAULT MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Home className="w-4 h-4 text-cyan-400" />
                Create New Family Household Vault
              </h3>

              <form onSubmit={handleCreateVault} className="space-y-3.5">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Household Name</label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Description</label>
                  <input
                    type="text"
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 cursor-pointer"
                  >
                    Create Vault
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD MEMBER MODAL */}
      <AnimatePresence>
        {showAddMemberModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-cyan-400" />
                Invite Family Member
              </h3>

              <form onSubmit={handleAddMember} className="space-y-3.5">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Member Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={memberForm.name}
                    onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="priya@example.com"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Role</label>
                  <select
                    value={memberForm.role}
                    onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="ADMIN">ADMIN (Can invite members and create budgets)</option>
                    <option value="CONTRIBUTOR">CONTRIBUTOR (Can log shared expenses)</option>
                    <option value="VIEWER">VIEWER (Read-only aggregate analytics)</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMemberModal(false)}
                    className="flex-1 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 cursor-pointer"
                  >
                    Add Member
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD EXPENSE MODAL */}
      <AnimatePresence>
        {showAddExpenseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-cyan-400" />
                Log Shared Household Expense
              </h3>

              <form onSubmit={handleAddExpense} className="space-y-3.5">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Expense Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Monthly Electricity Bill"
                    value={expenseForm.title}
                    onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Amount ({activeVault?.currency})</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Category</label>
                    <select
                      value={expenseForm.category}
                      onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="Groceries & Supermarket">Groceries</option>
                      <option value="Housing & Utilities">Housing & Utilities</option>
                      <option value="Food & Dining">Food & Dining</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Health & Medical">Health & Medical</option>
                      <option value="General & Miscellaneous">General</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddExpenseModal(false)}
                    className="flex-1 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 cursor-pointer"
                  >
                    Record Expense
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FamilyVaultPage;
