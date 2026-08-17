import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { apiFetch } from '../api/client';
import { PinCard } from '../components/UI/PinCard';

export const BudgetsPage = ({ categories = [] }) => {
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
    return <div style={{ padding: '64px', textAlign: 'center', color: 'var(--color-muted-text)' }} className="body-md">Loading Budgets Engine...</div>;
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="heading-xl">Category Budgets</h1>
          <p className="body-sm" style={{ color: 'var(--color-muted-text)' }}>Deterministic budget allocation and real-time pace monitoring.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="button-primary">
          <Plus size={18} /> Set Budget Limit
        </button>
      </div>

      {/* KPI Overview */}
      <PinCard
        title="Total Allocated Monthly Budget"
        amount={budgetData.totalSpent || 0}
        overlayPill={`${(budgetData.overBudgetCount || 0) > 0 ? `${budgetData.overBudgetCount} Over Limit` : 'All On Track'}`}
        subtitle={`Total Limit: ₹${(budgetData.totalAllocated || 0).toLocaleString()} | Remaining: ₹${(budgetData.totalRemaining || 0).toLocaleString()}`}
      />

      {/* Category Budget Grid */}
      {budgetList.length > 0 ? (
        <div className="grid-masonry">
          {budgetList.map((b) => (
            <div key={b.budgetId || b.category} className="pin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 className="heading-md">{b.category}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="pin-overlay-pill" style={{ backgroundColor: b.isOverBudget ? 'var(--color-destructive)' : 'var(--color-secondary)', color: b.isOverBudget ? '#FFFFFF' : 'var(--color-accent)', borderColor: 'var(--color-border)' }}>
                    {b.percentage || 0}% Used
                  </span>
                  {b.budgetId && (
                    <button
                      onClick={() => handleDeleteBudget(b.budgetId, b.category)}
                      style={{ background: 'none', border: 'none', color: '#FF7D7D', cursor: 'pointer', padding: '2px' }}
                      title="Delete budget"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }} className="body-sm">
                <span style={{ color: 'var(--color-muted-text)' }}>Spent: ₹{(b.spent || 0).toLocaleString()}</span>
                <span style={{ color: 'var(--color-muted-text)' }}>Limit: ₹{(b.allocated || 0).toLocaleString()}</span>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, Math.max(0, b.percentage || 0))}%`,
                  backgroundColor: b.isOverBudget ? 'var(--color-destructive)' : 'var(--color-accent)',
                  borderRadius: '4px',
                  transition: 'var(--transition)'
                }} />
              </div>

              <div className="body-sm" style={{ marginTop: '8px', textAlign: 'right', fontSize: '12px', color: b.isOverBudget ? 'var(--color-destructive)' : 'var(--color-muted-text)' }}>
                {b.isOverBudget ? `Exceeded by ₹${((b.spent || 0) - (b.allocated || 0)).toLocaleString()}` : `₹${(b.remaining || 0).toLocaleString()} remaining`}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '48px 24px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px dashed rgba(255, 255, 255, 0.12)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#E2E8F0', marginBottom: '6px' }}>No Category Budgets Configured</h3>
          <p style={{ fontSize: '13px', color: '#94A3B8', maxWidth: '420px', margin: '0 auto 16px' }}>
            Set spending limits on food, shopping, or entertainment to receive automated pace alerts.
          </p>
          <button onClick={() => setShowModal(true)} className="button-primary" style={{ margin: '0 auto' }}>
            <Plus size={16} /> Set First Budget
          </button>
        </div>
      )}

      {/* Budget Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="heading-lg" style={{ marginBottom: '16px' }}>Set Category Budget</h3>
            <form onSubmit={handleCreateBudget}>
              <div style={{ marginBottom: '16px' }}>
                <label className="body-sm-strong" style={{ display: 'block', marginBottom: '6px' }}>Category</label>
                <select className="text-input" value={category} onChange={(e) => setCategory(e.target.value)} style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-foreground)' }}>
                  {availableCategories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="body-sm-strong" style={{ display: 'block', marginBottom: '6px' }}>Monthly Limit (₹)</label>
                <input type="number" required min="1" className="text-input" placeholder="e.g. 10000" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="button-secondary">Cancel</button>
                <button type="submit" className="button-primary">Save Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
