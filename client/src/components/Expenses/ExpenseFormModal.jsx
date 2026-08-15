import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch, getLocalDateString } from '../../api/client';

export const ExpenseFormModal = ({ isOpen, onClose, onSave, categories = [] }) => {
  const defaultCategoryList = ['Food & Dining', 'Transportation', 'Housing & Utilities', 'Entertainment', 'Shopping', 'Health & Medical', 'Subscriptions'];
  const availableCategories = categories.length > 0 ? categories.map(c => c.name || c) : defaultCategoryList;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(availableCategories[0] || 'Food & Dining');
  const [merchant, setMerchant] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(getLocalDateString(new Date()));

  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDate(getLocalDateString(new Date()));
      if (availableCategories.length > 0 && !availableCategories.includes(category)) {
        setCategory(availableCategories[0]);
      }
    }
  }, [isOpen, categories]);

  const handleSmartCategorize = async () => {
    if (!title.trim() || !amount) return;
    setLoadingAi(true);
    setAiSuggestion(null);

    try {
      const res = await apiFetch('/ai/categorize', {
        method: 'POST',
        body: JSON.stringify({ title, amount: Number(amount), merchant, userCategories: availableCategories }),
      });
      setAiSuggestion(res);
    } catch (err) {
      console.error('Smart categorize failed:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount || !category) return;
    setSubmitting(true);

    try {
      await onSave({
        title,
        amount: Number(amount),
        category,
        merchant,
        paymentMethod,
        note,
        date,
      });
      onClose();
    } catch (err) {
      console.error('Save expense failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(4, 7, 14, 0.75)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="glass-card"
          style={{
            width: '100%',
            maxWidth: '520px',
            padding: '32px',
            background: 'rgba(15, 22, 36, 0.96)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: '24px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DollarSign size={20} color="#00FF87" />
              </div>
              <h2 className="heading-lg" style={{ color: 'var(--color-text-main)' }}>Record New Expense</h2>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '999px',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={17} />
            </motion.button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                Expense Title *
              </label>
              <input
                type="text"
                required
                className="glass-input"
                placeholder="e.g. Uber Airport Ride"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', padding: '11px 16px', borderRadius: '12px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  className="glass-input"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ width: '100%', padding: '11px 16px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#00FF87', borderRadius: '12px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                  Merchant / Vendor
                </label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. Uber, Starbucks"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  style={{ width: '100%', padding: '11px 16px', borderRadius: '12px' }}
                />
              </div>
            </div>

            {/* AI Smart Categorization Trigger */}
            {title && amount && (
              <div style={{ marginBottom: '16px' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleSmartCategorize}
                  disabled={loadingAi}
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    color: '#00FF87',
                    borderRadius: '999px',
                    padding: '6px 14px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={14} color="#00FF87" />
                  {loadingAi ? 'AI Categorizing...' : 'Suggest Category via AI'}
                </motion.button>

                {aiSuggestion && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginTop: '10px',
                      padding: '12px 16px',
                      borderRadius: '14px',
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      Suggested: <strong style={{ color: '#00FF87' }}>{aiSuggestion.category}</strong> ({Math.round(aiSuggestion.confidence * 100)}% match)
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{aiSuggestion.reason}</div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      onClick={() => setCategory(aiSuggestion.category)}
                      className="btn-primary-mint"
                      style={{ height: '32px', padding: '4px 12px', fontSize: '12px' }}
                    >
                      <Check size={14} /> Accept
                    </motion.button>
                  </motion.div>
                )}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                  Category *
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

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                  Payment Method
                </label>
                <select
                  className="glass-input"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ width: '100%', padding: '11px 16px', borderRadius: '12px', background: 'rgba(14, 20, 32, 0.95)', color: '#F8FAFC' }}
                >
                  <option value="Card" style={{ background: '#0F172A', color: '#F8FAFC' }}>Card</option>
                  <option value="UPI" style={{ background: '#0F172A', color: '#F8FAFC' }}>UPI</option>
                  <option value="Cash" style={{ background: '#0F172A', color: '#F8FAFC' }}>Cash</option>
                  <option value="Bank Transfer" style={{ background: '#0F172A', color: '#F8FAFC' }}>Bank Transfer</option>
                  <option value="Other" style={{ background: '#0F172A', color: '#F8FAFC' }}>Other</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                Date
              </label>
              <input
                type="date"
                className="glass-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ width: '100%', padding: '11px 16px', borderRadius: '12px' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                Note / Description
              </label>
              <textarea
                className="glass-input"
                style={{ width: '100%', height: '70px', padding: '11px 16px', borderRadius: '12px', resize: 'vertical' }}
                placeholder="Optional details..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={onClose} className="btn-glass-secondary">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-primary-mint">
                {submitting ? 'Saving...' : 'Save Expense'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
