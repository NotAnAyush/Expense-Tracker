import React, { useState, useEffect } from 'react';
import { Target, Plus, Trash2, Calendar, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiFetch } from '../api/client';
import { PinCard } from '../components/UI/PinCard';
import { CountUp } from '../components/UI/CountUp';
import { usePrivacy } from '../context/PrivacyContext';

export const GoalsPage = () => {
  const { isPrivacyMaskActive } = usePrivacy();
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
      setTargetDate('');
      fetchGoals();
    } catch (err) {
      console.error('Failed to create goal:', err);
    }
  };

  const handleDeleteGoal = async (goalId, goalName) => {
    if (!goalId) return;
    if (!window.confirm(`Delete savings goal "${goalName}"?`)) return;
    try {
      await apiFetch(`/goals/${goalId}`, { method: 'DELETE' });
      fetchGoals();
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  if (loading) return <div style={{ padding: '64px', textAlign: 'center', color: '#94A3B8' }} className="body-md">Loading Goals Engine...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span className="glass-pill" style={{ color: '#FFD700', borderColor: 'rgba(255, 215, 0, 0.25)' }}>
              <Target size={12} /> Milestone Tracker
            </span>
          </div>
          <h1 className="display-xl" style={{ margin: 0 }}>Savings Goals Trajectory</h1>
          <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '2px' }}>
            Track target dates, progress percentages, and required monthly contributions.
          </p>
        </div>
        <button onClick={openGoalModal} className="btn-primary-mint">
          <Plus size={15} strokeWidth={3} /> Add Goal
        </button>
      </div>

      {goals.length > 0 ? (
        <div className="grid-masonry">
          {goals.map((g, idx) => {
            const current = Number(g.currentAmount) || 0;
            const target = Number(g.targetAmount) || 1;
            const pct = Math.min(100, Math.max(0, Math.round((current / target) * 100)));
            const remaining = Math.max(0, target - current);
            return (
              <motion.div
                key={g._id}
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="glass-card glass-card-hover-border"
                style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0, 255, 135, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Target size={18} color="#00FF87" />
                    </div>
                    <h3 className="heading-md" style={{ margin: 0, color: '#F1F5F9' }}>{g.name}</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: pct >= 100 ? 'rgba(0, 255, 135, 0.15)' : 'rgba(255, 215, 0, 0.12)',
                        color: pct >= 100 ? '#00FF87' : '#FFD700',
                        border: `1px solid ${pct >= 100 ? 'rgba(0, 255, 135, 0.3)' : 'rgba(255, 215, 0, 0.3)'}`,
                      }}
                    >
                      {pct}% Achieved
                    </span>
                    <button
                      onClick={() => handleDeleteGoal(g._id, g.name)}
                      style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '2px', display: 'flex' }}
                      title="Delete goal"
                      onMouseEnter={(e) => e.target.style.color = '#FB7185'}
                      onMouseLeave={(e) => e.target.style.color = '#64748B'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94A3B8' }}>
                  <span className={isPrivacyMaskActive ? 'privacy-masked' : ''}>
                    Saved: <strong className="tabular-nums" style={{ color: '#00FF87' }}><CountUp value={current} prefix="₹" /></strong>
                  </span>
                  <span className={isPrivacyMaskActive ? 'privacy-masked' : ''}>
                    Target: <strong className="tabular-nums" style={{ color: '#F1F5F9' }}><CountUp value={target} prefix="₹" /></strong>
                  </span>
                </div>

                {/* Staggered Animated Progress Bar */}
                <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.9, delay: 0.15 + idx * 0.1, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      backgroundColor: pct >= 100 ? '#00FF87' : '#FFD700',
                      borderRadius: '999px',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '12px', color: '#64748B' }}>
                  <span>Target: {g.targetDate ? new Date(g.targetDate).toLocaleDateString() : 'N/A'}</span>
                  <span className={`tabular-nums ${isPrivacyMaskActive ? 'privacy-masked' : ''}`}>
                    <CountUp value={remaining} prefix="₹" suffix=" remaining" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#E2E8F0', marginBottom: '6px' }}>No Active Savings Goals</h3>
          <p style={{ fontSize: '13px', color: '#94A3B8', maxWidth: '420px', margin: '0 auto 16px' }}>
            Set a target for an emergency fund, travel, vehicle, or home down payment to monitor your trajectory.
          </p>
          <button onClick={openGoalModal} className="btn-primary-mint" style={{ margin: '0 auto' }}>
            <Plus size={15} strokeWidth={3} /> Create First Goal
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="heading-lg" style={{ marginBottom: '16px' }}>Create Savings Goal</h3>
            <form onSubmit={handleCreateGoal}>
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Goal Name *</label>
                <input type="text" required className="glass-input" placeholder="e.g. Japan Vacation" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label">Target Amount (₹) *</label>
                  <input type="number" required min="1" className="glass-input" placeholder="100000" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Currently Saved (₹)</label>
                  <input type="number" min="0" className="glass-input" placeholder="0" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="form-label">Target Date *</label>
                <input type="date" required className="glass-input" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-glass-secondary">Cancel</button>
                <button type="submit" className="btn-primary-mint">Create Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
