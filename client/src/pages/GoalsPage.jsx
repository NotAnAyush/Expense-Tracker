import React, { useState, useEffect } from 'react';
import { Target, Plus } from 'lucide-react';
import { apiFetch } from '../api/client';
import { PinCard } from '../components/UI/PinCard';

export const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

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

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!name || !targetAmount || !targetDate) return;
    try {
      await apiFetch('/goals', {
        method: 'POST',
        body: JSON.stringify({ name, targetAmount: Number(targetAmount), currentAmount: Number(currentAmount || 0), targetDate }),
      });
      setShowModal(false);
      setName('');
      setTargetAmount('');
      setCurrentAmount('');
      setTargetDate('');
      fetchGoals();
    } catch (err) {
      console.error('Failed to create goal:', err);
    }
  };

  if (loading) return <div style={{ padding: '64px', textAlign: 'center', color: 'var(--mute)' }} className="body-md">Loading Goals Engine...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="heading-xl">Savings Goals Trajectory</h1>
          <p className="body-sm">Track target dates, progress percentages, and required monthly contributions.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="button-primary">
          <Plus size={18} /> Add Goal
        </button>
      </div>

      <div className="grid-masonry">
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
          return (
            <div key={g._id} className="pin-card" style={{ backgroundColor: 'var(--canvas)', border: '1px solid var(--hairline)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={20} color="var(--primary)" />
                  <h3 className="heading-md">{g.name}</h3>
                </div>
                <span className="pin-overlay-pill">{pct}% Achieved</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }} className="body-sm">
                <span>Saved: ₹{g.currentAmount.toLocaleString()}</span>
                <span>Target: ₹{g.targetAmount.toLocaleString()}</span>
              </div>

              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--surface-card)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, backgroundColor: 'var(--primary)', borderRadius: '4px' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--hairline-soft)' }} className="body-sm">
                <span>Target: {new Date(g.targetDate).toLocaleDateString()}</span>
                <span>Remaining: ₹{(g.targetAmount - g.currentAmount).toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
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
