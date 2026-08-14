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
          backgroundColor: 'rgba(5, 8, 16, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
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
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass-card"
          style={{
            width: '100%',
            maxWidth: '520px',
            padding: '32px',
            background: 'rgba(15, 20, 32, 0.95)',
            border: '1.5px solid rgba(0, 255, 135, 0.3)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 255, 135, 0.15)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #00FF87, #FFD700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 15px rgba(0, 255, 135, 0.4)',
                }}
              >
                <DollarSign size={20} color="#050810" />
              </div>
              <h2 className="heading-lg" style={{ color: '#F1F5F9' }}>Record New Expense</h2>
            </div>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '999px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F1F5F9',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </motion.button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                Expense Title *
              </label>
              <input
                type="text"
                required
                className="glass-input"
                placeholder="e.g. Uber airport ride"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', padding: '12px 18px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
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
                  style={{ width: '100%', padding: '12px 18px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#00FF87' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                  Merchant / Vendor
                </label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. Uber, Starbucks"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  style={{ width: '100%', padding: '12px 18px' }}
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
                  className="glass-pill"
                  style={{ color: '#00FF87', borderColor: 'rgba(0, 255, 135, 0.4)', cursor: 'pointer', background: 'rgba(0, 255, 135, 0.08)' }}
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
                      background: 'rgba(0, 255, 135, 0.1)',
                      border: '1px solid rgba(0, 255, 135, 0.3)',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      Suggested: <strong style={{ color: '#00FF87' }}>{aiSuggestion.category}</strong> ({Math.round(aiSuggestion.confidence * 100)}% match)
                      <div style={{ fontSize: '12px', color: '#94A3B8' }}>{aiSuggestion.reason}</div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                  Category *
                </label>
                <select
                  className="glass-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '12px 18px', borderRadius: '999px', background: 'rgba(20, 28, 44, 0.85)' }}
                >
                  {availableCategories.map((c, i) => (
                    <option key={i} value={c} style={{ background: '#0F1420', color: '#F1F5F9' }}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                  Payment Method
                </label>
                <select
                  className="glass-input"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ width: '100%', padding: '12px 18px', borderRadius: '999px', background: 'rgba(20, 28, 44, 0.85)' }}
                >
                  <option value="Card" style={{ background: '#0F1420', color: '#F1F5F9' }}>Card</option>
                  <option value="UPI" style={{ background: '#0F1420', color: '#F1F5F9' }}>UPI</option>
                  <option value="Cash" style={{ background: '#0F1420', color: '#F1F5F9' }}>Cash</option>
                  <option value="Bank Transfer" style={{ background: '#0F1420', color: '#F1F5F9' }}>Bank Transfer</option>
                  <option value="Other" style={{ background: '#0F1420', color: '#F1F5F9' }}>Other</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                Date
              </label>
              <input
                type="date"
                className="glass-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ width: '100%', padding: '12px 18px' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                Note / Description
              </label>
              <textarea
                className="glass-input"
                style={{ width: '100%', height: '70px', padding: '12px 18px', borderRadius: '16px' }}
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
