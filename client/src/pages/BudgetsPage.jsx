import React, { useState, useEffect } from 'react';
import { Plus, Trash2, PieChart as PieIcon, ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiFetch } from '../api/client';
import { PinCard } from '../components/UI/PinCard';
import { CountUp } from '../components/UI/CountUp';
import { usePrivacy } from '../context/PrivacyContext';

export const BudgetsPage = ({ categories = [] }) => {
  const { isPrivacyMaskActive } = usePrivacy();
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const defaultCategoryList = ['Food & Dining', 'Transportation', 'Housing & Utilities', 'Entertainment', 'Shopping', 'Subscriptions', 'Health & Medical'];
  const availableCategories = categories.length > 0
    ? categories.filter(c => c.type !== 'income').map(c => c.name || c)
    : defaultCategoryList;

  const [category, setCategory] = useState(availableCategories[0] || 'Food & Dining');
  const [amount, setAmount] = useState('');

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/analytics');
      setBudgetData(res.budgetUtilization);
    } catch (err) {
      console.error('Failed to fetch budget utilization:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    if (!category || !amount) return;
    try {
      await apiFetch('/budgets', {
        method: 'POST',
        body: JSON.stringify({ categoryId: category, amount: Number(amount) }),
      });
      setShowModal(false);
      setAmount('');
      fetchBudgets();
    } catch (err) {
      console.error('Failed to save budget:', err);
    }
  };

  if (loading || !budgetData) {
    return <div style={{ padding: '64px', textAlign: 'center', color: '#94A3B8' }} className="body-md">Loading Budgets Engine...</div>;
  }

  const budgetList = budgetData.budgets || [];

  const handleDeleteBudget = async (budgetId, categoryName) => {
    if (!budgetId) return;
    if (!window.confirm(`Delete budget limit for ${categoryName}?`)) return;
    try {
      await apiFetch(`/budgets/${budgetId}`, { method: 'DELETE' });
      fetchBudgets();
    } catch (err) {
      console.error('Failed to delete budget:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span className="glass-pill" style={{ color: '#00FF87', borderColor: 'rgba(0, 255, 135, 0.25)' }}>
              <PieIcon size={12} /> Budget Pace Radar
            </span>
          </div>
          <h1 className="display-xl" style={{ margin: 0 }}>Category Budgets</h1>
          <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '2px' }}>
            Deterministic budget allocation and real-time pace monitoring.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary-mint">
          <Plus size={15} strokeWidth={3} /> Set Budget Limit
        </button>
      </div>

      {/* KPI Overview */}
      <PinCard
        title="Total Allocated Monthly Budget"
        amount={budgetData.totalSpent || 0}
        overlayPill={(budgetData.overBudgetCount || 0) > 0 ? `${budgetData.overBudgetCount} Over Limit` : 'All On Track'}
        pillColor={(budgetData.overBudgetCount || 0) > 0 ? 'rose' : 'emerald'}
        subtitle={`Total Limit: ₹${(budgetData.totalAllocated || 0).toLocaleString()} | Remaining: ₹${(budgetData.totalRemaining || 0).toLocaleString()}`}
      />

      {/* Category Budget Grid */}
      {budgetList.length > 0 ? (
        <div className="grid-masonry">
          {budgetList.map((b, idx) => {
            const isOver = b.isOverBudget || (b.percentage || 0) > 100;
            const isHighAlert = (b.percentage || 0) >= 90;
            return (
              <motion.div
                key={b.budgetId || b.category}
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="glass-card glass-card-hover-border card-lift-glow"
                style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="heading-md" style={{ margin: 0, color: '#F1F5F9' }}>{b.category}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      className={isHighAlert ? 'budget-alert-pulse' : ''}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: isOver ? 'rgba(244, 63, 94, 0.15)' : isHighAlert ? 'rgba(244, 63, 94, 0.2)' : 'rgba(0, 255, 135, 0.12)',
                        color: isOver ? '#FB7185' : isHighAlert ? '#FF4D6A' : '#00FF87',
                        border: `1px solid ${isOver ? 'rgba(244, 63, 94, 0.5)' : isHighAlert ? 'rgba(244, 63, 94, 0.6)' : 'rgba(0, 255, 135, 0.3)'}`,
                      }}
                    >
                      {isHighAlert && '⚡ '}
                      {b.percentage || 0}% Used
                    </span>
                    {b.budgetId && (
                      <button
                        onClick={() => handleDeleteBudget(b.budgetId, b.category)}
                        style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '2px', display: 'flex' }}
                        title="Delete budget"
                        onMouseEnter={(e) => e.target.style.color = '#FB7185'}
                        onMouseLeave={(e) => e.target.style.color = '#64748B'}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94A3B8' }}>
                  <span className={isPrivacyMaskActive ? 'privacy-masked' : ''}>
                    Spent: <strong className="tabular-nums" style={{ color: isOver ? '#FB7185' : '#F1F5F9' }}><CountUp value={b.spent || 0} prefix="₹" /></strong>
                  </span>
                  <span className={isPrivacyMaskActive ? 'privacy-masked' : ''}>
                    Limit: <strong className="tabular-nums" style={{ color: '#F1F5F9' }}><CountUp value={b.allocated || 0} prefix="₹" /></strong>
                  </span>
                </div>

                {/* Staggered Animated Progress Bar */}
                <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.max(0, b.percentage || 0))}%` }}
                    transition={{ duration: 0.9, delay: 0.15 + idx * 0.1, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      backgroundColor: isOver ? '#F43F5E' : (b.percentage || 0) > 80 ? '#F59E0B' : '#00FF87',
                      borderRadius: '999px',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: isOver ? '#FB7185' : '#64748B' }}>
                  <span>{isOver ? '⚠️ Limit Exceeded' : '✅ On Track'}</span>
                  <span className={`tabular-nums ${isPrivacyMaskActive ? 'privacy-masked' : ''}`}>
                    {isOver ? `Exceeded by ₹${((b.spent || 0) - (b.allocated || 0)).toLocaleString()}` : `₹${(b.remaining || 0).toLocaleString()} left`}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#E2E8F0', marginBottom: '6px' }}>No Category Budgets Configured</h3>
          <p style={{ fontSize: '13px', color: '#94A3B8', maxWidth: '420px', margin: '0 auto 16px' }}>
            Set spending limits on food, shopping, or entertainment to receive automated pace alerts.
          </p>
          <button onClick={() => setShowModal(true)} className="btn-primary-mint" style={{ margin: '0 auto' }}>
            <Plus size={15} strokeWidth={3} /> Set First Budget
          </button>
        </div>
      )}

      {/* Budget Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="heading-lg" style={{ marginBottom: '16px' }}>Set Category Budget Limit</h3>
            <form onSubmit={handleCreateBudget}>
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Category</label>
                <select className="glass-input select-field" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {availableCategories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="form-label">Monthly Limit (₹)</label>
                <input type="number" required min="1" className="glass-input" placeholder="e.g. 10000" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-glass-secondary">Cancel</button>
                <button type="submit" className="btn-primary-mint">Save Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
