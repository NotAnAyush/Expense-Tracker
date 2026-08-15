import React, { useState, useEffect } from 'react';
import { Plus, Edit2, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../api/client';

export const BudgetsPage = ({ categories = [] }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState('Food & Dining');
  const [amount, setAmount] = useState('');

  const defaultCategoryList = ['Food & Dining', 'Transportation', 'Housing & Utilities', 'Entertainment', 'Shopping', 'Health & Medical', 'Subscriptions'];
  const availableCategories = categories.length > 0
    ? categories.filter(c => c.type !== 'income').map(c => c.name || c)
    : defaultCategoryList;

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/budgets');
      setBudgets(res);
    } catch (err) {
      console.error('Failed to fetch budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!category || !amount) return;

    try {
      await apiFetch('/budgets', {
        method: 'POST',
        body: JSON.stringify({ category, amount: Number(amount) }),
      });
      setModalOpen(false);
      setAmount('');
      fetchBudgets();
    } catch (err) {
      console.error('Failed to save budget:', err);
    }
  };

  const totalAllocated = budgets.reduce((acc, b) => acc + (b.amount || 0), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + (b.spent || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="heading-xl">Category Budgets</h1>
          <p className="body-sm" style={{ color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Allocated: ₹{totalAllocated.toLocaleString()} • Spent: ₹{totalSpent.toLocaleString()}
          </p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn-primary-mint" style={{ height: '40px' }}>
          <Plus size={16} />
          Set Category Budget
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }} className="body-md">
          Loading budget parameters...
        </div>
      ) : budgets.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          No category limits established yet. Click "Set Category Budget" to begin.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {budgets.map((b) => {
            const spent = b.spent || 0;
            const limit = b.amount || 1;
            const percent = Math.round((spent / limit) * 100);
            const isOver = percent > 100;
            const isWarning = percent > 85 && !isOver;

            return (
              <div key={b._id} className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 className="heading-md" style={{ color: 'var(--color-text-main)' }}>{b.category}</h3>
                    <span style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
                      ₹{spent.toLocaleString()} of ₹{limit.toLocaleString()}
                    </span>
                  </div>

                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      background: isOver ? 'rgba(244, 63, 94, 0.15)' : isWarning ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      border: `1px solid ${isOver ? 'rgba(244, 63, 94, 0.35)' : isWarning ? 'rgba(245, 158, 11, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
                      color: isOver ? '#FB7185' : isWarning ? '#FBBF24' : '#00FF87',
                    }}
                  >
                    {percent}%
                  </span>
                </div>

                {/* Progress track */}
                <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden', marginBottom: '14px' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percent, 100)}%` }}
                    transition={{ duration: 0.8 }}
                    style={{
                      height: '100%',
                      background: isOver
                        ? 'linear-gradient(90deg, #F43F5E, #E11D48)'
                        : isWarning
                        ? 'linear-gradient(90deg, #F59E0B, #D97706)'
                        : 'linear-gradient(90deg, #10B981, #00FF87)',
                      borderRadius: '999px',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
                  <span>{isOver ? `Exceeded by ₹${(spent - limit).toLocaleString()}` : `₹${(limit - spent).toLocaleString()} remaining`}</span>
                  <button
                    onClick={() => {
                      setCategory(b.category);
                      setAmount(String(b.amount));
                      setModalOpen(true);
                    }}
                    style={{ background: 'none', border: 'none', color: '#00FF87', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Set/Edit Budget Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(4, 7, 14, 0.75)',
              backdropFilter: 'blur(8px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setModalOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="glass-card"
              style={{
                width: '100%',
                maxWidth: '440px',
                padding: '32px',
                background: 'rgba(15, 22, 36, 0.96)',
                border: '1px solid var(--border-light)',
                borderRadius: '24px',
              }}
            >
              <h2 className="heading-lg" style={{ color: 'var(--color-text-main)', marginBottom: '20px' }}>Set Budget Limit</h2>
              <form onSubmit={handleSaveBudget}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                    Category
                  </label>
                  <select
                    className="glass-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '11px 16px', borderRadius: '12px', background: 'rgba(14, 20, 32, 0.95)', color: '#F8FAFC' }}
                  >
                    {availableCategories.map((c, i) => (
                      <option key={i} value={c} style={{ background: '#0F172A', color: '#F8FAFC' }}>{c}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                    Monthly Cap (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="glass-input"
                    placeholder="e.g. 15000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{ width: '100%', padding: '11px 16px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#00FF87', borderRadius: '12px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" onClick={() => setModalOpen(false)} className="btn-glass-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary-mint">
                    Save Budget
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
