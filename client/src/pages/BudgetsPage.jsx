import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { apiFetch } from '../api/client';
import { PinCard } from '../components/UI/PinCard';

export const BudgetsPage = () => {
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState('Food & Dining');
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
    return <div style={{ padding: '64px', textAlign: 'center', color: 'var(--mute)' }} className="body-md">Loading Budgets Engine...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="heading-xl">Category Budgets</h1>
          <p className="body-sm">Deterministic budget allocation and real-time pace monitoring.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="button-primary">
          <Plus size={18} /> Set Budget Limit
        </button>
      </div>

      {/* KPI Overview */}
      <PinCard
        title="Total Allocated Monthly Budget"
        amount={budgetData.totalSpent}
        overlayPill={`${budgetData.overBudgetCount > 0 ? `${budgetData.overBudgetCount} Over Limit` : 'All On Track'}`}
        subtitle={`Total Limit: ₹${budgetData.totalAllocated.toLocaleString()} | Remaining: ₹${budgetData.totalRemaining.toLocaleString()}`}
      />

      {/* Category Budget Grid */}
      <div className="grid-masonry">
        {budgetData.budgets.map((b) => (
          <div key={b.budgetId} className="pin-card" style={{ backgroundColor: 'var(--canvas)', border: '1px solid var(--hairline)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 className="heading-md">{b.category}</h3>
              <span className="pin-overlay-pill" style={{ backgroundColor: b.isOverBudget ? 'var(--error-deep)' : 'var(--surface-card)', color: b.isOverBudget ? '#ffffff' : 'var(--ink)' }}>
                {b.percentage}% Used
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }} className="body-sm">
              <span>Spent: ₹{b.spent.toLocaleString()}</span>
              <span>Limit: ₹{b.allocated.toLocaleString()}</span>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--surface-card)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, b.percentage)}%`,
                backgroundColor: b.isOverBudget ? 'var(--error-deep)' : 'var(--primary)',
                borderRadius: '4px',
                transition: 'var(--transition)'
              }} />
            </div>

            <div className="body-sm" style={{ marginTop: '8px', textAlign: 'right', fontSize: '12px' }}>
              {b.isOverBudget ? `Exceeded by ₹${(b.spent - b.allocated).toLocaleString()}` : `₹${b.remaining.toLocaleString()} remaining`}
            </div>
          </div>
        ))}
      </div>

      {/* Budget Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
          <div className="modal-card">
            <h3 className="heading-lg" style={{ marginBottom: '16px' }}>Set Category Budget</h3>
            <form onSubmit={handleCreateBudget}>
              <div style={{ marginBottom: '16px' }}>
                <label className="body-sm-strong" style={{ display: 'block', marginBottom: '6px' }}>Category</label>
                <select className="text-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Housing & Utilities">Housing & Utilities</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Subscriptions">Subscriptions</option>
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
