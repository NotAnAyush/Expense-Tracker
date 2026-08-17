import React, { useState, useEffect } from 'react';
import { 
  X, 
  DollarSign, 
  Save, 
  ArrowDownLeft, 
  Tag, 
  Calendar, 
  Building, 
  Sparkles,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  RotateCcw,
  Landmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLocalDateString } from '../../api/client';

const DRAFT_INCOME_KEY = 'richy_draft_income';
const DEFAULT_INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investments', 'Rental', 'Dividends', 'Gift', 'Refund', 'Other'];

const INCOME_ICONS = {
  Salary: Briefcase,
  Freelance: Laptop,
  Investments: TrendingUp,
  Rental: Landmark,
  Dividends: Sparkles,
  Gift: Gift,
  Refund: RotateCcw,
  Other: Tag,
};

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

  const handleAddPresetAmount = (presetVal) => {
    const currentNum = Number(amount) || 0;
    setAmount(String(currentNum + presetVal));
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
        className="modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="glass-card"
          style={{
            width: '100%',
            maxWidth: '540px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
            border: '1.5px solid rgba(0, 255, 135, 0.25)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(0, 255, 135, 0.12)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(90deg, rgba(0, 255, 135, 0.06) 0%, transparent 100%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'rgba(0, 255, 135, 0.15)',
                  border: '1px solid rgba(0, 255, 135, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ArrowDownLeft size={18} color="#00FF87" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#F1F5F9', fontFamily: 'var(--font-heading)' }}>
                  {editingIncome ? 'Edit Cash Inflow' : 'Record Cash Inflow'}
                </h3>
                <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>
                  Salary, freelance, dividends & capital gains
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
            {/* Hero Inflow Amount Input */}
            <div className="hero-amount-wrapper">
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#64748B' }}>
                Inflow Amount
              </span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', width: '100%' }}>
                <span style={{ fontSize: '28px', fontWeight: 800, color: '#00FF87', fontFamily: 'var(--font-display)' }}>₹</span>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="hero-amount-input"
                  autoFocus
                />
              </div>

              {/* Quick Amount Presets */}
              <div className="hero-amount-presets">
                <button type="button" onClick={() => handleAddPresetAmount(5000)} className="preset-chip">+₹5k</button>
                <button type="button" onClick={() => handleAddPresetAmount(25000)} className="preset-chip">+₹25k</button>
                <button type="button" onClick={() => handleAddPresetAmount(50000)} className="preset-chip">+₹50k</button>
                <button type="button" onClick={() => handleAddPresetAmount(100000)} className="preset-chip">+₹1L</button>
              </div>
            </div>

            {/* Income Title */}
            <div>
              <label className="form-label">Income Source Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Google Monthly Salary, Client Retainer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="glass-input"
              />
            </div>

            {/* Category Chips */}
            <div>
              <label className="form-label">Inflow Category</label>
              <div className="category-chip-grid">
                {DEFAULT_INCOME_CATEGORIES.map((cat) => {
                  const IconComp = INCOME_ICONS[cat] || Tag;
                  const isSelected = category === cat;
                  return (
                    <div
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`category-chip ${isSelected ? 'active' : ''}`}
                    >
                      <IconComp size={13} color={isSelected ? '#00FF87' : '#94A3B8'} />
                      <span>{cat}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Source & Date Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="form-label">Client / Employer</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp, Upwork"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="glass-input"
                />
              </div>
              <div>
                <label className="form-label">Received Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="glass-input"
                />
              </div>
            </div>

            {/* Recurring Inflow Toggle */}
            <div
              style={{
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12.5px', color: '#F1F5F9' }}>
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  style={{ accentColor: '#00FF87', width: '15px', height: '15px' }}
                />
                <span>Recurring Monthly Inflow</span>
              </label>
              {isRecurring && (
                <select
                  value={recurringFrequency}
                  onChange={(e) => setRecurringFrequency(e.target.value)}
                  className="glass-input select-field"
                  style={{ height: '30px', fontSize: '11.5px', maxWidth: '140px' }}
                >
                  <option value="monthly">Monthly</option>
                  <option value="bi-weekly">Bi-Weekly</option>
                  <option value="weekly">Weekly</option>
                </select>
              )}
            </div>

            {/* Tags & Notes */}
            <div>
              <label className="form-label">Note (Optional)</label>
              <input
                type="text"
                placeholder="Additional details..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="glass-input"
              />
            </div>

            {/* Submit CTA */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button type="button" onClick={onClose} className="btn-glass-secondary">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-primary-mint">
                <Save size={15} />
                {submitting ? 'Recording...' : (editingIncome ? 'Update Inflow' : 'Record Inflow (+)')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
