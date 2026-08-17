import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, DollarSign, Save, Camera, Tag, Layers, Plus, Trash2, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch, getLocalDateString } from '../../api/client';

const DRAFT_KEY = 'richy_draft_expense';
const TAX_SECTIONS = ['80C (PF, ELSS, Insurance)', '80D (Medical Insurance)', '80G (Charity / Donation)', 'Business Expense', 'Standard / General'];

export const ExpenseFormModal = ({ isOpen, onClose, onSave, onOpenReceiptScan, categories = [] }) => {
  const defaultCategoryList = ['Food & Dining', 'Transportation', 'Housing & Utilities', 'Entertainment', 'Shopping', 'Health & Medical', 'Subscriptions'];
  const availableCategories = categories.length > 0 ? categories.map(c => c.name || c) : defaultCategoryList;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(availableCategories[0] || 'Food & Dining');
  const [merchant, setMerchant] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(getLocalDateString(new Date()));

  // Tags & Tax State
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isTaxDeductible, setIsTaxDeductible] = useState(false);
  const [taxSection, setTaxSection] = useState('80C (PF, ELSS, Insurance)');
  const [reimbursementStatus, setReimbursementStatus] = useState('none');

  // Split Transactions State
  const [enableSplits, setEnableSplits] = useState(false);
  const [splits, setSplits] = useState([]);

  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasDraftRestored, setHasDraftRestored] = useState(false);

  // Restore draft on open
  useEffect(() => {
    if (isOpen) {
      try {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed.title) setTitle(parsed.title);
          if (parsed.amount) setAmount(parsed.amount);
          if (parsed.category) setCategory(parsed.category);
          if (parsed.merchant) setMerchant(parsed.merchant);
          if (parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod);
          if (parsed.note) setNote(parsed.note);
          if (parsed.date) setDate(parsed.date);
          if (parsed.tags) setTags(parsed.tags);
          if (parsed.isTaxDeductible) setIsTaxDeductible(parsed.isTaxDeductible);
          if (parsed.taxSection) setTaxSection(parsed.taxSection);
          if (parsed.splits) {
            setSplits(parsed.splits);
            setEnableSplits(parsed.splits.length > 0);
          }
          setHasDraftRestored(true);
        } else {
          setDate(getLocalDateString(new Date()));
        }
      } catch {
        setDate(getLocalDateString(new Date()));
      }
    }
  }, [isOpen]);

  // Autosave draft on any input change
  useEffect(() => {
    if (isOpen && (title || amount || merchant || note || tags.length > 0)) {
      const draft = { title, amount, category, merchant, paymentMethod, note, date, tags, isTaxDeductible, taxSection, splits };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
  }, [isOpen, title, amount, category, merchant, paymentMethod, note, date, tags, isTaxDeductible, taxSection, splits]);

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setTitle('');
    setAmount('');
    setMerchant('');
    setNote('');
    setCategory(availableCategories[0] || 'Food & Dining');
    setPaymentMethod('Card');
    setDate(getLocalDateString(new Date()));
    setTags([]);
    setTagInput('');
    setIsTaxDeductible(false);
    setSplits([]);
    setEnableSplits(false);
    setHasDraftRestored(false);
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

  const handleAddSplitItem = () => {
    setSplits([...splits, { category: availableCategories[0] || 'Food & Dining', amount: '', note: '' }]);
  };

  const handleUpdateSplitItem = (index, field, value) => {
    const next = [...splits];
    next[index][field] = field === 'amount' ? Number(value) : value;
    setSplits(next);
  };

  const handleRemoveSplitItem = (index) => {
    setSplits(splits.filter((_, i) => i !== index));
  };

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
      const payload = {
        title: title.trim(),
        amount: Number(amount),
        category,
        merchant: merchant.trim(),
        paymentMethod,
        note: note.trim(),
        date,
        tags,
        isTaxDeductible,
        taxSection: isTaxDeductible ? taxSection : '',
        reimbursementStatus,
        splits: enableSplits && splits.length > 0 ? splits.filter(s => s.amount > 0) : [],
      };

      await onSave(payload);
      clearDraft();
      onClose();
    } catch (err) {
      console.error('Save expense failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const splitsSum = splits.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const remainingSplit = Math.max(0, (Number(amount) || 0) - splitsSum);

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(5, 8, 16, 0.82)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
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
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          style={{
            width: '100%',
            maxWidth: '580px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(145deg, rgba(16, 22, 36, 0.98) 0%, rgba(10, 14, 24, 0.99) 100%)',
            border: '1.5px solid rgba(0, 255, 135, 0.3)',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 255, 135, 0.15)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '18px 24px',
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
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DollarSign size={20} color="#00FF87" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#F1F5F9', fontFamily: 'var(--font-heading)' }}>
                  Record Expense
                </h2>
                {hasDraftRestored && (
                  <div style={{ fontSize: '11px', color: '#00FF87', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <Save size={11} /> Restored draft
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {onOpenReceiptScan && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenReceiptScan();
                  }}
                  style={{
                    background: 'rgba(0, 240, 255, 0.12)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    borderRadius: '10px',
                    padding: '6px 12px',
                    color: '#00F0FF',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Camera size={14} /> Scan Receipt
                </motion.button>
              )}

              <button
                type="button"
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
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
            {/* Title & Amount */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                  Expense Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Uber airport ride"
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
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 32px',
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

            {/* AI Smart Categorization */}
            {title && amount && (
              <div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleSmartCategorize}
                  disabled={loadingAi}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '999px',
                    background: 'rgba(0, 255, 135, 0.08)',
                    border: '1px solid rgba(0, 255, 135, 0.3)',
                    color: '#00FF87',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={13} color="#00FF87" />
                  {loadingAi ? 'AI Categorizing...' : 'AI Category Suggestion'}
                </motion.button>

                {aiSuggestion && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: 'rgba(0, 255, 135, 0.1)',
                      border: '1px solid rgba(0, 255, 135, 0.3)',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ color: '#E2E8F0' }}>
                      Suggested: <strong style={{ color: '#00FF87' }}>{aiSuggestion.category}</strong> ({Math.round(aiSuggestion.confidence * 100)}% confidence)
                    </span>
                    <button
                      type="button"
                      onClick={() => setCategory(aiSuggestion.category)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        background: '#00FF87',
                        border: 'none',
                        color: '#050810',
                        fontWeight: 800,
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      Accept
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Category & Merchant */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                  Category *
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
                    fontSize: '13px',
                    outline: 'none',
                  }}
                >
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                  Merchant / Vendor
                </label>
                <input
                  type="text"
                  placeholder="e.g. Swiggy, Amazon"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#F8FAFC',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Date & Payment Method */}
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
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: '#0F172A',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#F8FAFC',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                >
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Tags System */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                Tags & Categories
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
                  minHeight: '42px',
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
                      style={{ background: 'none', border: 'none', color: '#00FF87', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder={tags.length === 0 ? "Type tag e.g. TaxDeductible, Trip2026..." : "Add tag..."}
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
                    minWidth: '130px',
                  }}
                />
              </div>
            </div>

            {/* Tax Deductible Section */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#F1F5F9' }}>
                  <input
                    type="checkbox"
                    checked={isTaxDeductible}
                    onChange={(e) => setIsTaxDeductible(e.target.checked)}
                    style={{ accentColor: '#00FF87', width: '16px', height: '16px' }}
                  />
                  <span>Tax Deductible Expense</span>
                </label>
                {isTaxDeductible && (
                  <span style={{ fontSize: '11px', color: '#00FF87', fontWeight: 700 }}>
                    Eligible for Tax Summary
                  </span>
                )}
              </div>

              {isTaxDeductible && (
                <div style={{ marginTop: '10px' }}>
                  <select
                    value={taxSection}
                    onChange={(e) => setTaxSection(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: '#0F172A',
                      border: '1px solid rgba(0, 255, 135, 0.3)',
                      color: '#00FF87',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {TAX_SECTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Split Transactions Accordion */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div
                onClick={() => setEnableSplits(!enableSplits)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={16} color="#00F0FF" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#F1F5F9' }}>
                    Split Across Multiple Categories
                  </span>
                </div>
                {enableSplits ? <ChevronUp size={16} color="#94A3B8" /> : <ChevronDown size={16} color="#94A3B8" />}
              </div>

              {enableSplits && (
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {splits.map((s, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 32px', gap: '8px', alignItems: 'center' }}>
                      <select
                        value={s.category}
                        onChange={(e) => handleUpdateSplitItem(idx, 'category', e.target.value)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: '#0F172A',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#F8FAFC',
                          fontSize: '12px',
                        }}
                      >
                        {availableCategories.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Amount"
                        value={s.amount}
                        onChange={(e) => handleUpdateSplitItem(idx, 'amount', e.target.value)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#00FF87',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Note"
                        value={s.note}
                        onChange={(e) => handleUpdateSplitItem(idx, 'note', e.target.value)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#F8FAFC',
                          fontSize: '12px',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSplitItem(idx)}
                        style={{
                          background: 'rgba(255, 77, 77, 0.15)',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px',
                          color: '#FF7D7D',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={handleAddSplitItem}
                      style={{
                        background: 'rgba(0, 240, 255, 0.12)',
                        border: '1px solid rgba(0, 240, 255, 0.3)',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        color: '#00F0FF',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Plus size={13} /> Add Line Split
                    </button>

                    <span style={{ fontSize: '12px', color: remainingSplit === 0 ? '#00FF87' : '#FFD700', fontWeight: 700 }}>
                      {remainingSplit === 0 ? '✓ Splits match total amount' : `Unallocated: ₹${remainingSplit}`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Note */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                Note / Description (Optional)
              </label>
              <textarea
                rows="2"
                placeholder="Additional details..."
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

            {/* Footer Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              {(title || amount || merchant || note || tags.length > 0) ? (
                <button
                  type="button"
                  onClick={clearDraft}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94A3B8',
                    fontSize: '12px',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Discard Draft
                </button>
              ) : <div />}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#CBD5E1',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #00FF87 0%, #FFD700 100%)',
                    border: 'none',
                    color: '#050810',
                    fontSize: '14px',
                    fontWeight: 800,
                    fontFamily: 'var(--font-heading)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 20px rgba(0, 255, 135, 0.4)',
                  }}
                >
                  <Save size={16} />
                  {submitting ? 'Saving...' : 'Save Expense'}
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
