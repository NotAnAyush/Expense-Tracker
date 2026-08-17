import React, { useState, useEffect } from 'react';
import { Target, Plus, TrendingUp, CheckCircle2, ChevronRight, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch, getLocalDateString } from '../api/client';

export const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('Emergency Fund');
  const [depositAmount, setDepositAmount] = useState('');

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/goals');
      setGoals(res);
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
    if (!name || !targetAmount) return;

    try {
      await apiFetch('/goals', {
        method: 'POST',
        body: JSON.stringify({
          name,
          targetAmount: Number(targetAmount),
          currentAmount: Number(currentAmount) || 0,
          targetDate: targetDate || undefined,
          category,
        }),
      });
      localStorage.removeItem(GOAL_DRAFT_KEY);
      setShowModal(false);
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      setTargetDate('');
      fetchGoals();
    } catch (err) {
      console.error('Failed to create goal:', err);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!selectedGoal || !depositAmount) return;

    try {
      await apiFetch(`/goals/${selectedGoal._id}/deposit`, {
        method: 'POST',
        body: JSON.stringify({ amount: Number(depositAmount) }),
      });
      setDepositModalOpen(false);
      setDepositAmount('');
      setSelectedGoal(null);
      fetchGoals();
    } catch (err) {
      console.error('Deposit failed:', err);
    }
  };

  const totalSaved = goals.reduce((acc, g) => acc + (g.currentAmount || 0), 0);
  const totalTarget = goals.reduce((acc, g) => acc + (g.targetAmount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="heading-xl">Savings Goals & Reserves</h1>
          <p className="body-sm" style={{ color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Total Accumulated: ₹{totalSaved.toLocaleString()} of ₹{totalTarget.toLocaleString()} target.
          </p>
        </div>
        <button onClick={openGoalModal} className="button-primary">
          <Plus size={18} /> Add Goal
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }} className="body-md">
          Gathering savings milestones...
        </div>
      ) : goals.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          No active savings targets. Create your first goal to begin accumulating dedicated reserves.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {goals.map((g) => {
            const current = g.currentAmount || 0;
            const target = g.targetAmount || 1;
            const percent = Math.min(Math.round((current / target) * 100), 100);
            const isCompleted = current >= target;

            return (
              <div key={g._id} className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 className="heading-md" style={{ color: 'var(--color-text-main)' }}>{g.name}</h3>
                      {isCompleted && <CheckCircle2 size={16} color="#00FF87" />}
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{g.category || 'General Fund'}</span>
                  </div>

                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      background: isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      border: `1px solid ${isCompleted ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
                      color: isCompleted ? '#00FF87' : '#FBBF24',
                    }}
                  >
                    {percent}%
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '12px' }}>
                  <span className="font-display" style={{ fontSize: '26px', fontWeight: 800, color: '#00FF87' }}>
                    ₹{current.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    / ₹{target.toLocaleString()}
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden', marginBottom: '16px' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.8 }}
                    style={{
                      height: '100%',
                      background: isCompleted ? '#00FF87' : 'linear-gradient(90deg, #10B981, #06B6D4)',
                      borderRadius: '999px',
                      boxShadow: '0 0 8px #00FF87',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-subtle)' }}>
                    {g.targetDate ? `Target: ${new Date(g.targetDate).toLocaleDateString()}` : 'Open Timeline'}
                  </span>

                  <button
                    onClick={() => {
                      setSelectedGoal(g);
                      setDepositModalOpen(true);
                    }}
                    className="btn-glass-secondary"
                    style={{ height: '32px', padding: '0 12px', fontSize: '12px' }}
                  >
                    <Plus size={13} /> Deposit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Goal Modal */}
      <AnimatePresence>
        {createModalOpen && (
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
              if (e.target === e.currentTarget) setCreateModalOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="glass-card"
              style={{
                width: '100%',
                maxWidth: '460px',
                padding: '32px',
                background: 'rgba(15, 22, 36, 0.96)',
                border: '1px solid var(--border-light)',
                borderRadius: '24px',
              }}
            >
              <h2 className="heading-lg" style={{ color: 'var(--color-text-main)', marginBottom: '20px' }}>Define Savings Goal</h2>
              <form onSubmit={handleCreateGoal}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                    Goal Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="glass-input"
                    placeholder="e.g. Kyoto Vacation Fund"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '11px 16px', borderRadius: '12px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                      Target Amount (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="glass-input"
                      placeholder="50000"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      style={{ width: '100%', padding: '11px 16px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#00FF87', borderRadius: '12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                      Initial Deposit (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="glass-input"
                      value={currentAmount}
                      onChange={(e) => setCurrentAmount(e.target.value)}
                      style={{ width: '100%', padding: '11px 16px', borderRadius: '12px' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    className="glass-input"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    style={{ width: '100%', padding: '11px 16px', borderRadius: '12px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button type="button" onClick={() => setCreateModalOpen(false)} className="btn-glass-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary-mint">
                    Initialize Goal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deposit Modal */}
      <AnimatePresence>
        {depositModalOpen && selectedGoal && (
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
              if (e.target === e.currentTarget) setDepositModalOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="glass-card"
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '32px',
                background: 'rgba(15, 22, 36, 0.96)',
                border: '1px solid var(--border-light)',
                borderRadius: '24px',
              }}
            >
              <h2 className="heading-lg" style={{ color: 'var(--color-text-main)', marginBottom: '8px' }}>Deposit to {selectedGoal.name}</h2>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                Current Balance: ₹{selectedGoal.currentAmount?.toLocaleString()} / ₹{selectedGoal.targetAmount?.toLocaleString()}
              </p>

              <form onSubmit={handleDeposit}>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                    Deposit Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="glass-input"
                    placeholder="e.g. 5000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    style={{ width: '100%', padding: '11px 16px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#00FF87', borderRadius: '12px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" onClick={() => setDepositModalOpen(false)} className="btn-glass-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary-mint">
                    Confirm Deposit
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
