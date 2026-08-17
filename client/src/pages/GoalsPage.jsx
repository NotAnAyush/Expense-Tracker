import React, { useState, useEffect } from 'react';
import { Target, Plus } from 'lucide-react';
import { apiFetch, getLocalDateString } from '../api/client';
import { PinCard } from '../components/UI/PinCard';

export const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');

  const getDefaultTargetDate = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return getLocalDateString(d);
  };

  const [targetDate, setTargetDate] = useState(getDefaultTargetDate());

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/goals');
      setGoals(res || []);
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const GOAL_DRAFT_KEY = 'richy_draft_goal';

  const openGoalModal = () => {
    try {
      const saved = localStorage.getItem(GOAL_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setName(parsed.name || '');
        setTargetAmount(parsed.targetAmount || '');
        setCurrentAmount(parsed.currentAmount || '');
        setTargetDate(parsed.targetDate || '');
      }
    } catch {}
    setShowModal(true);
  };

  useEffect(() => {
    if (showModal && (name || targetAmount)) {
      try {
        localStorage.setItem(GOAL_DRAFT_KEY, JSON.stringify({ name, targetAmount, currentAmount, targetDate }));
      } catch {}
    }
  }, [showModal, name, targetAmount, currentAmount, targetDate]);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!name || !targetAmount || !targetDate) return;
    try {
      await apiFetch('/goals', {
        method: 'POST',
        body: JSON.stringify({ name, targetAmount: Number(targetAmount), currentAmount: Number(currentAmount || 0), targetDate }),
      });
      localStorage.removeItem(GOAL_DRAFT_KEY);
      setShowModal(false);
      setName('');
      setTargetAmount('');
      setCurrentAmount('');
      setTargetDate(getDefaultTargetDate());
      fetchGoals();
    } catch (err) {
      console.error('Failed to create goal:', err);
    }
  };

  if (loading) return <div style={{ padding: '64px', textAlign: 'center', color: 'var(--color-muted-text)' }} className="body-md">Loading Goals Engine...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="heading-xl">Savings Goals Trajectory</h1>
          <p className="body-sm" style={{ color: 'var(--color-muted-text)' }}>Track target dates, progress percentages, and required monthly contributions.</p>
        </div>
        <button onClick={openGoalModal} className="button-primary">
          <Plus size={18} /> Add Goal
        </button>
      </div>

      <div className="grid-masonry">
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
          return (
            <div key={g._id} className="pin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Target size={22} color="var(--color-accent)" />
                  <h3 className="heading-md">{g.name}</h3>
                </div>
                <span className="pin-overlay-pill" style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-accent)', borderColor: 'var(--color-border)' }}>
                  {pct}% Achieved
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }} className="body-sm">
                <span style={{ color: 'var(--color-muted-text)' }}>Saved: ₹{g.currentAmount.toLocaleString()}</span>
                <span style={{ color: 'var(--color-muted-text)' }}>Target: ₹{g.targetAmount.toLocaleString()}</span>
              </div>

              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, backgroundColor: 'var(--color-accent)', borderRadius: '4px' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }} className="body-sm">
                <span style={{ color: 'var(--color-muted-text)' }}>Target: {new Date(g.targetDate).toLocaleDateString()}</span>
                <span style={{ color: 'var(--color-muted-text)' }}>Remaining: ₹{(g.targetAmount - g.currentAmount).toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="heading-lg" style={{ marginBottom: '16px' }}>Create Savings Goal</h3>
            <form onSubmit={handleCreateGoal}>
              <div style={{ marginBottom: '16px' }}>
                <label className="body-sm-strong" style={{ display: 'block', marginBottom: '6px' }}>Goal Name *</label>
                <input type="text" required className="text-input" placeholder="e.g. Japan Vacation" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="body-sm-strong" style={{ display: 'block', marginBottom: '6px' }}>Target Amount (₹) *</label>
                  <input type="number" required min="1" className="text-input" placeholder="100000" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
                </div>
                <div>
                  <label className="body-sm-strong" style={{ display: 'block', marginBottom: '6px' }}>Currently Saved (₹)</label>
                  <input type="number" min="0" className="text-input" placeholder="0" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="body-sm-strong" style={{ display: 'block', marginBottom: '6px' }}>Target Date *</label>
                <input type="date" required className="text-input" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="button-secondary">Cancel</button>
                <button type="submit" className="button-primary">Create Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
