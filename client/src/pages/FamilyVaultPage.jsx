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
  Wallet,
  Eye,
  Calendar,
  Sparkles,
  ChevronRight,
  X
} from 'lucide-react';
import { apiFetch } from '../api/client';
import { CountUp } from '../components/UI/CountUp';
import { FlowingSparkline } from '../components/UI/FlowingSparkline';

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
    monthlySpendingLimit: 15000,
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

  const getRoleIcon = (role) => {
    switch (role) {
      case 'OWNER':
        return <Crown size={13} color="#FFD700" />;
      case 'ADMIN':
        return <Shield size={13} color="#00F0FF" />;
      case 'CONTRIBUTOR':
        return <Wallet size={13} color="#00FF87" />;
      default:
        return <Eye size={13} color="#94A3B8" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', paddingBottom: '70px' }}>
      {/* 1. HERO HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span className="animate-live-dot" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#00F0FF', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Multi-User RBAC Ledgers • Privacy Sovereign
            </span>
          </div>
          <h1 className="display-xl" style={{ margin: 0 }}>
            Family & Household Vaults
          </h1>
          <p className="body-sm" style={{ margin: '4px 0 0 0', color: '#94A3B8' }}>
            Manage shared household groceries, utilities, and rent collectively while personal private ledgers stay strictly isolated.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="btn-primary-mint"
          style={{ height: '38px', padding: '0 18px', fontSize: '13px' }}
        >
          <Plus size={15} />
          <span>Create Family Vault</span>
        </button>
      </div>

      {/* 2. VAULT SWITCHER RIBBON */}
      {vaults.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {vaults.map((v) => {
            const isSelected = activeVault?._id === v._id;
            return (
              <button
                key={v._id}
                type="button"
                onClick={() => selectVault(v)}
                className={`filter-chip ${isSelected ? 'filter-chip-active' : ''}`}
                style={{ height: '36px' }}
              >
                <Home size={14} />
                <span>{v.name}</span>
                <span style={{ fontSize: '11px', opacity: 0.8, marginLeft: '4px' }}>({v.members?.length || 1} members)</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. ACTIVE VAULT MAIN STUDIO */}
      {activeVault ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 4-CARD BENTO KPI GRID */}
          <div className="grid-kpi">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="glass-card glass-card-hover-border"
              style={{ padding: '18px 20px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="body-sm" style={{ color: '#94A3B8' }}>Pooled Monthly Spend</span>
                <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 800, background: 'rgba(244, 63, 94, 0.12)', color: '#F43F5E', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                  Outflow
                </span>
              </div>
              <div className="display-lg font-display tabular-nums" style={{ color: '#F8FAFC', margin: 0 }}>
                <CountUp value={vaultSummary?.totalPooledSpend || 0} prefix={activeVault.currency || '₹'} />
              </div>
              <div style={{ marginTop: '6px' }}>
                <FlowingSparkline data={[14, 18, 22, 19, 26, 24, 30, 28]} color="#F43F5E" height={24} />
              </div>
              <span className="body-xs" style={{ color: '#64748B', display: 'block', marginTop: '4px' }}>
                Across {activeVault.sharedExpenses?.length || 0} pooled bills
              </span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="glass-card glass-card-hover-border"
              style={{ padding: '18px 20px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="body-sm" style={{ color: '#94A3B8' }}>Active Members</span>
                <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 800, background: 'rgba(0, 240, 255, 0.12)', color: '#00F0FF', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
                  RBAC
                </span>
              </div>
              <div className="display-lg font-display tabular-nums" style={{ color: '#00F0FF', margin: 0 }}>
                <CountUp value={activeVault.members?.length || 1} suffix=" Members" />
              </div>
              <div style={{ marginTop: '6px' }}>
                <FlowingSparkline data={[10, 12, 15, 14, 18, 20, 22, 25]} color="#00F0FF" height={24} />
              </div>
              <span className="body-xs" style={{ color: '#64748B', display: 'block', marginTop: '4px' }}>
                {activeVault.members?.filter(m => m.role === 'OWNER' || m.role === 'ADMIN').length || 1} Admins & Owners
              </span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="glass-card glass-card-hover-border"
              style={{ padding: '18px 20px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="body-sm" style={{ color: '#94A3B8' }}>Top Category</span>
                <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 800, background: 'rgba(0, 255, 135, 0.12)', color: '#00FF87', border: '1px solid rgba(0, 255, 135, 0.3)' }}>
                  Primary
                </span>
              </div>
              <div className="display-lg font-display" style={{ color: '#00FF87', margin: 0, fontSize: '20px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {vaultSummary?.topCategory || 'Groceries'}
              </div>
              <div style={{ marginTop: '6px' }}>
                <FlowingSparkline data={[12, 16, 20, 24, 22, 28, 26, 32]} color="#00FF87" height={24} />
              </div>
              <span className="body-xs" style={{ color: '#64748B', display: 'block', marginTop: '4px' }}>
                Highest shared household expense
              </span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="glass-card glass-card-hover-border"
              style={{ padding: '18px 20px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="body-sm" style={{ color: '#94A3B8' }}>Ledger Privacy</span>
                <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 800, background: 'rgba(139, 92, 246, 0.12)', color: '#A78BFA', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                  Encrypted
                </span>
              </div>
              <div className="display-lg font-display" style={{ color: '#A78BFA', margin: 0, fontSize: '20px' }}>
                100% Isolated
              </div>
              <div style={{ marginTop: '6px' }}>
                <FlowingSparkline data={[25, 25, 25, 25, 25, 25, 25, 25]} color="#A78BFA" height={24} />
              </div>
              <span className="body-xs" style={{ color: '#64748B', display: 'block', marginTop: '4px' }}>
                Private accounts strictly hidden
              </span>
            </motion.div>
          </div>

          {/* 2-COLUMN MAIN CONTENT: MEMBERS ROSTER & SHARED LEDGER */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '18px' }}>
            {/* Left: Member Roster & Role Matrix */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div>
                  <h3 className="heading-md" style={{ margin: 0, color: '#F8FAFC' }}>
                    Household Members & Roles
                  </h3>
                  <span className="body-xs" style={{ color: '#94A3B8' }}>RBAC permissions and limits</span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(true)}
                  className="btn-glass-secondary"
                  style={{ height: '32px', padding: '0 12px', fontSize: '12px', color: '#00F0FF', borderColor: 'rgba(0, 240, 255, 0.3)' }}
                >
                  <UserPlus size={13} />
                  <span>+ Invite Member</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activeVault.members?.map((m) => (
                  <div
                    key={m.email || m.userId}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(0, 255, 135, 0.2))',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: 800,
                          color: '#FFFFFF',
                        }}
                      >
                        {m.name?.[0] || 'U'}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>{m.name || 'Member'}</div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>{m.email}</div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: m.role === 'OWNER' ? 'rgba(255, 215, 0, 0.12)' : m.role === 'ADMIN' ? 'rgba(0, 240, 255, 0.12)' : 'rgba(0, 255, 135, 0.12)',
                          color: m.role === 'OWNER' ? '#FFD700' : m.role === 'ADMIN' ? '#00F0FF' : '#00FF87',
                          border: `1px solid ${m.role === 'OWNER' ? 'rgba(255, 215, 0, 0.3)' : m.role === 'ADMIN' ? 'rgba(0, 240, 255, 0.3)' : 'rgba(0, 255, 135, 0.3)'}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {getRoleIcon(m.role)}
                        {m.role}
                      </span>
                      {m.monthlySpendingLimit > 0 && (
                        <div className="font-mono tabular-nums" style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>
                          Limit: ₹{m.monthlySpendingLimit?.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Shared Family Ledger & Quick Add */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div>
                  <h3 className="heading-md" style={{ margin: 0, color: '#F8FAFC' }}>
                    Shared Household Ledger
                  </h3>
                  <span className="body-xs" style={{ color: '#94A3B8' }}>Pooled grocery, rent, and utility bills</span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(true)}
                  className="btn-primary-mint"
                  style={{ height: '32px', padding: '0 14px', fontSize: '12px' }}
                >
                  <Plus size={13} />
                  <span>+ Log Shared Bill</span>
                </button>
              </div>

              {activeVault.sharedExpenses?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B', fontSize: '13px' }}>
                  No shared expenses logged yet in this vault. Click "+ Log Shared Bill" to start.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
                  {activeVault.sharedExpenses?.map((exp, idx) => (
                    <div
                      key={exp._id || idx}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>{exp.title}</div>
                        <div style={{ fontSize: '11px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span style={{ padding: '1px 6px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.06)', color: '#A78BFA' }}>
                            {exp.category}
                          </span>
                          <span>•</span>
                          <span>{new Date(exp.date).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="font-display tabular-nums" style={{ fontSize: '15px', fontWeight: 800, color: '#F43F5E' }}>
                        -{activeVault.currency || '₹'}{Number(exp.amount)?.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Home size={36} color="#00F0FF" style={{ margin: '0 auto 12px auto', opacity: 0.8 }} />
          <h3 className="heading-lg" style={{ color: '#F8FAFC', marginBottom: '6px' }}>No Family Vaults Created Yet</h3>
          <p className="body-sm" style={{ color: '#94A3B8', maxWidth: '440px', margin: '0 auto 20px auto' }}>
            Set up a household vault to manage pooled rent, groceries, and domestic expenses with your family while preserving 100% private ledger isolation.
          </p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="btn-primary-mint"
            style={{ height: '38px', padding: '0 20px' }}
          >
            <Plus size={15} />
            <span>Create First Family Vault</span>
          </button>
        </div>
      )}

      {/* CREATE VAULT MODAL */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="heading-md" style={{ margin: 0, color: '#F8FAFC' }}>Create Household Vault</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="btn-icon-soft">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateVault} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Vault Name</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: '#FFFFFF', fontSize: '13px' }}
                />
              </div>

              <div>
                <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Description</label>
                <input
                  type="text"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: '#FFFFFF', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-glass-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary-mint">
                  Create Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD MEMBER MODAL */}
      {showAddMemberModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="heading-md" style={{ margin: 0, color: '#F8FAFC' }}>Invite Family Member</h3>
              <button type="button" onClick={() => setShowAddMemberModal(false)} className="btn-icon-soft">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Member Name</label>
                <input
                  type="text"
                  required
                  value={memberForm.name}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: '#FFFFFF', fontSize: '13px' }}
                />
              </div>

              <div>
                <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Email Address</label>
                <input
                  type="email"
                  required
                  value={memberForm.email}
                  onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: '#FFFFFF', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Role</label>
                  <select
                    value={memberForm.role}
                    onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'rgba(10, 14, 24, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: '#FFFFFF', fontSize: '13px' }}
                  >
                    <option value="CONTRIBUTOR">Contributor</option>
                    <option value="ADMIN">Admin</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                </div>
                <div>
                  <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Monthly Limit (₹)</label>
                  <input
                    type="number"
                    value={memberForm.monthlySpendingLimit}
                    onChange={(e) => setMemberForm({ ...memberForm, monthlySpendingLimit: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: '#FFFFFF', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddMemberModal(false)} className="btn-glass-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary-mint">
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD EXPENSE MODAL */}
      {showAddExpenseModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="heading-md" style={{ margin: 0, color: '#F8FAFC' }}>Log Shared Household Bill</h3>
              <button type="button" onClick={() => setShowAddExpenseModal(false)} className="btn-icon-soft">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Bill Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Grocery Bill - BigBasket"
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: '#FFFFFF', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Amount ({activeVault?.currency || '₹'})</label>
                  <input
                    type="number"
                    required
                    placeholder="2500"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: '#FFFFFF', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'rgba(10, 14, 24, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: '#FFFFFF', fontSize: '13px' }}
                  >
                    <option value="Groceries & Supermarket">Groceries</option>
                    <option value="Housing & Rent">Housing & Rent</option>
                    <option value="Utilities & Bills">Utilities & Bills</option>
                    <option value="Healthcare & Pharmacy">Healthcare</option>
                    <option value="Home Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddExpenseModal(false)} className="btn-glass-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary-mint">
                  Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyVaultPage;
