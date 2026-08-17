import React, { useState, useEffect } from 'react';
import { X, DollarSign, Save, ArrowDownLeft, Tag, Calendar, Building, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLocalDateString } from '../../api/client';

const DRAFT_INCOME_KEY = 'richy_draft_income';
const DEFAULT_INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investments', 'Rental', 'Dividends', 'Gift', 'Refund', 'Other'];

export const IncomeFormModal = ({ isOpen, onClose, onSave, editingIncome = null }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Salary');
  const [source, setSource] = useState('');
  const [date, setDate] = useState(getLocalDateString(new Date()));
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('monthly');
  const [note, setNote] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingIncome) {
        setTitle(editingIncome.title || '');
        setAmount(editingIncome.amount || '');
        setCategory(editingIncome.category || 'Salary');
        setSource(editingIncome.source || '');
        setDate(editingIncome.date ? getLocalDateString(new Date(editingIncome.date)) : getLocalDateString(new Date()));
        setIsRecurring(Boolean(editingIncome.isRecurring));
        setRecurringFrequency(editingIncome.recurringFrequency || 'monthly');
        setNote(editingIncome.note || '');
        setTags(editingIncome.tags || []);
      } else {
        try {
          const draft = localStorage.getItem(DRAFT_INCOME_KEY);
          if (draft) {
            const p = JSON.parse(draft);
            if (p.title) setTitle(p.title);
            if (p.amount) setAmount(p.amount);
            if (p.category) setCategory(p.category);
            if (p.source) setSource(p.source);
            if (p.date) setDate(p.date);
            if (p.note) setNote(p.note);
            if (p.tags) setTags(p.tags);
          } else {
            resetForm();
          }
        } catch {
          resetForm();
        }
      }
    }
  }, [isOpen, editingIncome]);

  useEffect(() => {
    if (isOpen && !editingIncome && (title || amount || source || note)) {
      const draft = { title, amount, category, source, date, note, tags };
      localStorage.setItem(DRAFT_INCOME_KEY, JSON.stringify(draft));
    }
  }, [isOpen, editingIncome, title, amount, category, source, date, note, tags]);

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setCategory('Salary');
    setSource('');
    setDate(getLocalDateString(new Date()));
    setIsRecurring(false);
    setRecurringFrequency('monthly');
    setNote('');
    setTags([]);
    setTagInput('');
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
      if (val && !tags.includes(val) && tags.length < 10) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (t) => {
    setTags(tags.filter(item => item !== t));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount) return;

    setSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        amount: Number(amount),
        category,
        source: source.trim(),
        date,
        isRecurring,
        recurringFrequency,
        note: note.trim(),
        tags,
      });
      localStorage.removeItem(DRAFT_INCOME_KEY);
      resetForm();
      onClose();
    } catch (err) {
      console.error('Failed to save income:', err);
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
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: 'rgba(5, 8, 16, 0.82)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{
            width: '100%',
            maxWidth: '560px',
            background: 'linear-gradient(145deg, rgba(16, 24, 38, 0.98) 0%, rgba(10, 14, 24, 0.99) 100%)',
            border: '1.5px solid rgba(0, 255, 135, 0.25)',
            borderRadius: '24px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 255, 135, 0.15)',
            overflow: 'hidden',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(90deg, rgba(0, 255, 135, 0.08) 0%, transparent 100%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'rgba(0, 255, 135, 0.15)',
                  border: '1px solid rgba(0, 255, 135, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ArrowDownLeft size={20} color="#00FF87" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#F1F5F9', fontFamily: 'var(--font-heading)' }}>
                  {editingIncome ? 'Edit Income Entry' : 'Log Cash Inflow'}
                </h3>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                  Track salary, dividends, freelance & side-hustles
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                borderRadius: '10px',
                padding: '8px',
                color: '#94A3B8',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Form */}
          <form onSubmit={handleSubmit} style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Title & Amount Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                  Income Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Tech Salary"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#F8FAFC',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#00FF87', marginBottom: '6px' }}>
                  Amount (₹) *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 34px',
                      borderRadius: '12px',
                      background: 'rgba(0, 255, 135, 0.06)',
                      border: '1px solid rgba(0, 255, 135, 0.3)',
                      color: '#00FF87',
                      fontSize: '15px',
                      fontWeight: 700,
                      outline: 'none',
                    }}
                  />
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#00FF87', fontWeight: 800 }}>
                    ₹
                  </span>
                </div>
              </div>
            </div>

            {/* Category & Source Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: '#0F172A',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#F8FAFC',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                >
                  {DEFAULT_INCOME_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                  Source / Employer / Client
                </label>
                <input
                  type="text"
                  placeholder="e.g. Google, Client Acme"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#F8FAFC',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Date & Recurring Option */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#F8FAFC',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                  Recurring Inflow
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '45px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#E2E8F0' }}>
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      style={{ accentColor: '#00FF87', width: '16px', height: '16px' }}
                    />
                    Recurring Inflow
                  </label>
                  {isRecurring && (
                    <select
                      value={recurringFrequency}
                      onChange={(e) => setRecurringFrequency(e.target.value)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        background: '#0F172A',
                        border: '1px solid rgba(0, 255, 135, 0.3)',
                        color: '#00FF87',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="bi-weekly">Bi-Weekly</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Tags Pill Input */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                Tags (Type & hit Enter)
              </label>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  minHeight: '44px',
                }}
              >
                {tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      background: 'rgba(0, 255, 135, 0.15)',
                      border: '1px solid rgba(0, 255, 135, 0.3)',
                      color: '#00FF87',
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      style={{ background: 'none', border: 'none', color: '#00FF87', cursor: 'pointer', padding: 0, display: 'flex' }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder={tags.length === 0 ? "e.g. PrimaryJob, SideHustle" : "Add tag..."}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#F8FAFC',
                    fontSize: '13px',
                    outline: 'none',
                    flex: 1,
                    minWidth: '120px',
                  }}
                />
              </div>
            </div>

            {/* Note */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                Note (Optional)
              </label>
              <textarea
                rows="2"
                placeholder="Additional details, invoice references..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#F8FAFC',
                  fontSize: '13px',
                  outline: 'none',
                  resize: 'none',
                }}
              />
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                marginTop: '10px',
                padding: '14px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #00FF87 0%, #60EFFF 100%)',
                border: 'none',
                color: '#050810',
                fontSize: '15px',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 20px rgba(0, 255, 135, 0.4)',
              }}
            >
              <Save size={18} />
              {submitting ? 'Saving Inflow...' : (editingIncome ? 'Update Income' : 'Record Income (+)')}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
