import React, { useState } from 'react';
import { Plus, X, AlertTriangle, RefreshCw, DollarSign, Percent, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AddDebtModal = ({ isOpen, onClose, onSaveDebt }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Credit Card');
  const [principalBalance, setPrincipalBalance] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [minimumPayment, setMinimumPayment] = useState('');
  const [dueDay, setDueDay] = useState('1');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const categories = ['Credit Card', 'Personal Loan', 'Student Loan', 'Auto Loan', 'Home Loan', 'Medical', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const balance = parseFloat(principalBalance);
    const apr = parseFloat(interestRate);
    const minPay = parseFloat(minimumPayment);

    if (!name.trim() || isNaN(balance) || balance <= 0 || isNaN(apr) || apr < 0 || isNaN(minPay) || minPay <= 0) {
      setErrorMsg('Please enter a valid debt name, positive balance, APR %, and minimum monthly payment.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg('');
      await onSaveDebt({
        name: name.trim(),
        category,
        principalBalance: balance,
        interestRate: apr,
        minimumPayment: minPay,
        dueDay: parseInt(dueDay, 10) || 1,
      });
      onClose();
    } catch (err) {
      console.error('Failed to create debt liability:', err);
      setErrorMsg(err.message || 'Failed to save debt.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(5, 8, 16, 0.85)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          style={{
            width: '100%',
            maxWidth: '520px',
            background: 'linear-gradient(135deg, rgba(16, 22, 38, 0.98) 0%, rgba(10, 14, 24, 0.98) 100%)',
            border: '1.5px solid rgba(255, 215, 0, 0.35)',
            borderRadius: '24px',
            padding: '28px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(255, 215, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'rgba(255, 215, 0, 0.15)',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFD700',
                }}
              >
                <DollarSign size={20} />
              </div>
              <div>
                <h3 className="heading-md" style={{ margin: 0 }}>
                  Add Debt Liability
                </h3>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                  Configure APR % and minimum due for payoff simulation
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: '999px',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {errorMsg && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 77, 77, 0.15)',
                  border: '1px solid rgba(255, 77, 77, 0.3)',
                  color: '#FF7D7D',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertTriangle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Name & Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '6px', display: 'block' }}>
                  Debt Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Regalia Card"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#F8FAFC',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '6px', display: 'block' }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: '#0F1420',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#F8FAFC',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Balance & Interest APR */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '6px', display: 'block' }}>
                  Principal Balance (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g. 75000"
                  value={principalBalance}
                  onChange={(e) => setPrincipalBalance(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 77, 77, 0.4)',
                    color: '#FF7D7D',
                    fontWeight: 800,
                    fontFamily: 'var(--font-display)',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '6px', display: 'block' }}>
                  Annual Interest (APR %) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="e.g. 14.5"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 215, 0, 0.4)',
                    color: '#FFD700',
                    fontWeight: 800,
                    fontFamily: 'var(--font-display)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Minimum Monthly Payment & Due Day */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '6px', display: 'block' }}>
                  Minimum Monthly Due (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g. 3500"
                  value={minimumPayment}
                  onChange={(e) => setMinimumPayment(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(0, 255, 135, 0.4)',
                    color: '#00FF87',
                    fontWeight: 800,
                    fontFamily: 'var(--font-display)',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '6px', display: 'block' }}>
                  Due Day of Month
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#F8FAFC',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={saving}
              className="btn-primary-mint"
              style={{ padding: '12px', marginTop: '8px' }}
            >
              {saving ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Saving Debt Liability...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Add Debt Liability
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
