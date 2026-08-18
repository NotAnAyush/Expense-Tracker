import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  DollarSign, 
  Save, 
  Camera, 
  Tag, 
  Layers, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp,
  Utensils,
  Car,
  Home,
  Film,
  ShoppingBag,
  HeartPulse,
  Repeat,
  Compass,
  CreditCard,
  Banknote,
  Smartphone,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch, getLocalDateString } from '../../api/client';

const DRAFT_KEY = 'richy_draft_expense';
const TAX_SECTIONS = ['80C (PF, ELSS, Insurance)', '80D (Medical Insurance)', '80G (Charity / Donation)', 'Business Expense', 'Standard / General'];

const CATEGORY_ICONS = {
  'Food & Dining': Utensils,
  'Transportation': Car,
  'Housing & Utilities': Home,
  'Entertainment': Film,
  'Shopping': ShoppingBag,
  'Health & Medical': HeartPulse,
  'Subscriptions': Repeat,
  'Travel': Compass,
};

export const ExpenseFormModal = ({ isOpen, onClose, onSave, onOpenReceiptScan, categories = [], initialData = null }) => {
  const defaultCategoryList = ['Food & Dining', 'Transportation', 'Housing & Utilities', 'Entertainment', 'Shopping', 'Health & Medical', 'Subscriptions'];
  const availableCategories = categories.length > 0 ? categories.map(c => c.name || c) : defaultCategoryList;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(availableCategories[0] || 'Food & Dining');
  const [merchant, setMerchant] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
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

  // Accordion Toggles
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasDraftRestored, setHasDraftRestored] = useState(false);

  // Restore draft or populate initialData on open
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        if (initialData.title) setTitle(initialData.title);
        if (initialData.amount) setAmount(String(initialData.amount));
        if (initialData.category) setCategory(initialData.category);
        if (initialData.merchant) setMerchant(initialData.merchant);
        if (initialData.paymentMethod) setPaymentMethod(initialData.paymentMethod);
        if (initialData.note) setNote(initialData.note);
        if (initialData.date) setDate(getLocalDateString(new Date(initialData.date)));
        if (initialData.tags) setTags(initialData.tags);
        if (initialData.isTaxDeductible) setIsTaxDeductible(initialData.isTaxDeductible);
        if (initialData.taxSection) setTaxSection(initialData.taxSection);
        if (initialData.splits && initialData.splits.length > 0) {
          setSplits(initialData.splits);
          setEnableSplits(true);
        }
        setHasDraftRestored(true);
        return;
      }

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
  }, [isOpen, initialData]);

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
    setPaymentMethod('UPI');
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
      if (res && res.category) {
        setCategory(res.category);
      }
    } catch (err) {
      console.error('Smart categorize failed:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleAddPresetAmount = (presetVal) => {
    const currentNum = Number(amount) || 0;
    setAmount(String(currentNum + presetVal));
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
        receiptDetails: initialData?.receiptDetails || undefined,
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
            maxWidth: '560px',
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
                  background: 'linear-gradient(135deg, #00FF87, #60EFFF)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 14px rgba(0, 255, 135, 0.3)',
                }}
              >
                <DollarSign size={18} color="#050810" strokeWidth={2.5} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#F1F5F9', fontFamily: 'var(--font-heading)' }}>
                  Record Expense
                </h2>
                {hasDraftRestored && (
                  <span style={{ fontSize: '11px', color: '#00FF87', fontWeight: 700 }}>
                    ✓ Restored Draft
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {onOpenReceiptScan && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenReceiptScan();
                  }}
                  className="btn-glass-secondary"
                  style={{ height: '30px', padding: '0 10px', fontSize: '11.5px', color: '#00F0FF', borderColor: 'rgba(0, 240, 255, 0.3)' }}
                >
                  <Camera size={13} /> Scan OCR
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
            {/* Gen-Z Hero Amount Input */}
            <div className="hero-amount-wrapper">
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#64748B' }}>
                Spend Amount
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
                <button type="button" onClick={() => handleAddPresetAmount(100)} className="preset-chip">+₹100</button>
                <button type="button" onClick={() => handleAddPresetAmount(500)} className="preset-chip">+₹500</button>
                <button type="button" onClick={() => handleAddPresetAmount(1000)} className="preset-chip">+₹1k</button>
                <button type="button" onClick={() => handleAddPresetAmount(5000)} className="preset-chip">+₹5k</button>
              </div>
            </div>

            {/* Title & AI Spark Assist */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Title / Description *</label>
                {title && amount && (
                  <button
                    type="button"
                    onClick={handleSmartCategorize}
                    disabled={loadingAi}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#00FF87',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Sparkles size={12} color="#00FF87" />
                    {loadingAi ? 'Classifying...' : 'AI Categorize'}
                  </button>
                )}
              </div>
              <input
                type="text"
                required
                placeholder="e.g. Swiggy gourmet dinner, Uber ride"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="glass-input"
              />
            </div>

            {/* Interactive Category Chips */}
            <div>
              <label className="form-label">Category *</label>
              <div className="category-chip-grid">
                {availableCategories.map((c) => {
                  const IconComp = CATEGORY_ICONS[c] || Tag;
                  const isSelected = category === c;
                  return (
                    <div
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`category-chip ${isSelected ? 'active' : ''}`}
                    >
                      <IconComp size={13} color={isSelected ? '#00FF87' : '#94A3B8'} />
                      <span>{c}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Merchant, Date & Payment Method */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="form-label">Merchant / Vendor</label>
                <input
                  type="text"
                  placeholder="e.g. Starbucks, Amazon"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div>
                <label className="form-label">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="glass-input select-field"
                >
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Card">Credit / Debit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Net Banking / Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="form-label">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="glass-input"
                />
              </div>
              <div>
                <label className="form-label">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="Additional note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="glass-input"
                />
              </div>
            </div>

            {/* Collapsible Power Options (Splits, Tax, Tags) */}
            <div
              style={{
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '10px 14px',
              }}
            >
              <div
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              >
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={14} color="#00F0FF" /> Power User Tools (Splits, Tax, Tags)
                </span>
                {showAdvanced ? <ChevronUp size={15} color="#94A3B8" /> : <ChevronDown size={15} color="#94A3B8" />}
              </div>

              {showAdvanced && (
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Tax Deductible */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12.5px', color: '#F1F5F9' }}>
                      <input
                        type="checkbox"
                        checked={isTaxDeductible}
                        onChange={(e) => setIsTaxDeductible(e.target.checked)}
                        style={{ accentColor: '#00FF87', width: '15px', height: '15px' }}
                      />
                      <span>Tax Deductible Expense</span>
                    </label>
                    {isTaxDeductible && (
                      <select
                        value={taxSection}
                        onChange={(e) => setTaxSection(e.target.value)}
                        className="glass-input select-field"
                        style={{ height: '32px', fontSize: '11.5px', maxWidth: '200px' }}
                      >
                        {TAX_SECTIONS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Multi-Category Splits */}
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12.5px', color: '#F1F5F9' }}>
                        <input
                          type="checkbox"
                          checked={enableSplits}
                          onChange={(e) => setEnableSplits(e.target.checked)}
                          style={{ accentColor: '#00F0FF', width: '15px', height: '15px' }}
                        />
                        <span>Multi-Category Split</span>
                      </label>
                      {enableSplits && (
                        <span style={{ fontSize: '11.5px', color: remainingSplit === 0 ? '#00FF87' : '#FFD700', fontWeight: 700 }}>
                          {remainingSplit === 0 ? '✓ Balanced' : `Unallocated: ₹${remainingSplit}`}
                        </span>
                      )}
                    </div>

                    {enableSplits && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {splits.map((s, idx) => (
                          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 28px', gap: '6px', alignItems: 'center' }}>
                            <select
                              value={s.category}
                              onChange={(e) => handleUpdateSplitItem(idx, 'category', e.target.value)}
                              className="glass-input select-field"
                              style={{ height: '30px', fontSize: '11.5px' }}
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
                              className="glass-input"
                              style={{ height: '30px', fontSize: '11.5px', color: '#00FF87', fontWeight: 700 }}
                            />
                            <input
                              type="text"
                              placeholder="Note"
                              value={s.note}
                              onChange={(e) => handleUpdateSplitItem(idx, 'note', e.target.value)}
                              className="glass-input"
                              style={{ height: '30px', fontSize: '11.5px' }}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveSplitItem(idx)}
                              style={{ background: 'none', border: 'none', color: '#FB7185', cursor: 'pointer', padding: '4px' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={handleAddSplitItem}
                          className="btn-glass-secondary"
                          style={{ height: '28px', fontSize: '11.5px', width: 'fit-content', gap: '4px' }}
                        >
                          <Plus size={12} /> Add Split Line
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Hashtags */}
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '10px' }}>
                    <label className="form-label" style={{ fontSize: '11.5px' }}>Custom Tags</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
                      {tags.map(t => (
                        <span key={t} className="glass-pill" style={{ color: '#00FF87', borderColor: 'rgba(0, 255, 135, 0.3)', fontSize: '11px' }}>
                          #{t}
                          <button type="button" onClick={() => handleRemoveTag(t)} style={{ background: 'none', border: 'none', color: '#00FF87', cursor: 'pointer', padding: 0 }}>
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        placeholder="Add tag and hit Enter..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        style={{ background: 'none', border: 'none', color: '#F1F5F9', fontSize: '12px', outline: 'none', minWidth: '120px' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              {(title || amount || merchant || note || tags.length > 0) ? (
                <button
                  type="button"
                  onClick={clearDraft}
                  style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '11.5px', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Discard Draft
                </button>
              ) : <div />}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={onClose} className="btn-glass-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary-mint">
                  <Save size={15} />
                  {submitting ? 'Recording...' : 'Log Expense'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
