import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
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
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 className="heading-lg">Record Expense</h2>
          <button onClick={onClose} className="button-icon-circular"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label className="body-sm-strong" style={{ display: 'block', marginBottom: '6px' }}>Expense Title *</label>
            <input
              type="text"
              required
              className="text-input"
              placeholder="e.g. Uber airport ride"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label className="body-sm-strong" style={{ display: 'block', marginBottom: '6px' }}>Amount (₹) *</label>
              <input
                type="number"
                required
                min="0"
                step="any"
                className="text-input"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="body-sm-strong" style={{ display: 'block', marginBottom: '6px' }}>Merchant / Vendor</label>
              <input
                type="text"
                className="text-input"
                placeholder="e.g. Uber, Starbucks"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
              />
            </div>
          </div>

          {/* AI Smart Categorization Trigger */}
          {title && amount && (
            <div style={{ marginBottom: '16px' }}>
              <button
                type="button"
                onClick={handleSmartCategorize}
                disabled={loadingAi}
                className="filter-chip"
                style={{ cursor: 'pointer', backgroundColor: 'var(--color-secondary)', color: 'var(--color-foreground)', borderColor: 'var(--color-accent)' }}
              >
                <Sparkles size={14} color="var(--color-accent)" />
                {loadingAi ? 'AI Analyzing...' : 'Suggest Category via AI'}
              </button>

              {aiSuggestion && (
                <div style={{
                  marginTop: '8px',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-secondary)',
                  border: '1px solid var(--color-border)',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    Suggested: <strong style={{ color: 'var(--color-accent)' }}>{aiSuggestion.category}</strong> ({Math.round(aiSuggestion.confidence * 100)}% confidence)
                    <div style={{ fontSize: '12px', color: 'var(--color-muted-text)' }}>{aiSuggestion.reason}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCategory(aiSuggestion.category)}
                    className="button-secondary"
                    style={{ height: '32px', padding: '4px 12px', fontSize: '12px' }}
                  >
                    Accept
                  </button>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label className="body-sm-strong" style={{ display: 'block', marginBottom: '6px' }}>Category *</label>
              <select
                className="text-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-foreground)' }}
              >
                {availableCategories.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="body-sm-strong" style={{ display: 'block', marginBottom: '6px' }}>Payment Method</label>
              <select
                className="text-input"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-foreground)' }}
              >
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="body-sm-strong" style={{ display: 'block', marginBottom: '6px' }}>Date</label>
            <input
              type="date"
              className="text-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label className="body-sm-strong" style={{ display: 'block', marginBottom: '6px' }}>Note / Description</label>
            <textarea
              className="text-input"
              style={{ height: '70px', padding: '10px' }}
              placeholder="Optional details..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose} className="button-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="button-primary">
              {submitting ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
