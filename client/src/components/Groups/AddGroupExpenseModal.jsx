import React, { useState } from 'react';
import { Plus, X, Check, Users, AlertTriangle, RefreshCw, DollarSign, Percent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AddGroupExpenseModal = ({ isOpen, onClose, group, onSaveExpense }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(group?.members?.[0]?.name || '');
  const [category, setCategory] = useState('General');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [splitType, setSplitType] = useState('EQUAL'); // 'EQUAL', 'EXACT', 'PERCENT'
  const [customAmounts, setCustomAmounts] = useState({});
  const [customPercentages, setCustomPercentages] = useState({});
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !group) return null;

  const members = group.members || [];
  const parsedAmount = parseFloat(amount) || 0;

  const handleSplitTypeChange = (type) => {
    setSplitType(type);
    setErrorMsg('');
    if (type === 'PERCENT' && members.length > 0) {
      const evenPct = Math.floor(100 / members.length);
      const newPct = {};
      members.forEach((m, idx) => {
        newPct[m.name] = idx === 0 ? 100 - evenPct * (members.length - 1) : evenPct;
      });
      setCustomPercentages(newPct);
    }
  };

  const handleCustomAmountChange = (name, val) => {
    setCustomAmounts({ ...customAmounts, [name]: parseFloat(val) || 0 });
  };

  const handleCustomPercentageChange = (name, val) => {
    setCustomPercentages({ ...customPercentages, [name]: parseFloat(val) || 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || parsedAmount <= 0 || !paidBy) {
      setErrorMsg('Please enter a description, valid amount, and select who paid.');
      return;
    }

    let customSplits = [];

    if (splitType === 'EXACT') {
      const sumExact = members.reduce((sum, m) => sum + (customAmounts[m.name] || 0), 0);
      if (Math.abs(sumExact - parsedAmount) > 0.05) {
        setErrorMsg(`Exact splits total (₹${sumExact.toFixed(2)}) must equal expense amount (₹${parsedAmount.toFixed(2)}). Difference: ₹${(parsedAmount - sumExact).toFixed(2)}`);
        return;
      }
      customSplits = members.map((m) => ({
        memberName: m.name,
        amount: customAmounts[m.name] || 0,
      }));
    } else if (splitType === 'PERCENT') {
      const sumPct = members.reduce((sum, m) => sum + (customPercentages[m.name] || 0), 0);
      if (Math.abs(sumPct - 100) > 0.5) {
        setErrorMsg(`Percentage splits total (${sumPct}%) must equal exactly 100%.`);
        return;
      }
      customSplits = members.map((m) => ({
        memberName: m.name,
        percentage: customPercentages[m.name] || 0,
      }));
    }

    try {
      setSaving(true);
      setErrorMsg('');
      await onSaveExpense({
        description: description.trim(),
        amount: parsedAmount,
        paidBy,
        category,
        date,
        splitType,
        customSplits: splitType === 'EQUAL' ? undefined : customSplits,
      });
      onClose();
    } catch (err) {
      console.error('Failed to add group expense:', err);
      setErrorMsg(err.message || 'Failed to save group expense.');
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
            maxWidth: '560px',
            maxHeight: '90vh',
            background: 'linear-gradient(135deg, rgba(16, 22, 38, 0.98) 0%, rgba(10, 14, 24, 0.98) 100%)',
            border: '1.5px solid rgba(0, 255, 135, 0.3)',
            borderRadius: '24px',
            padding: '28px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 255, 135, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            overflowY: 'auto',
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
                  background: 'rgba(0, 255, 135, 0.15)',
                  border: '1px solid rgba(0, 255, 135, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00FF87',
                }}
              >
                <Users size={20} />
              </div>
              <div>
                <h3 className="heading-md" style={{ margin: 0 }}>
                  Add Group Expense
                </h3>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                  {group.name} • {members.length} members
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

          {/* Form */}
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

            {/* Description & Amount */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '6px', display: 'block' }}>
                  Expense Description *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dinner, Taxi, Villa Booking"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
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
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '6px', display: 'block' }}>
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
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
                    fontSize: '15px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Paid By & Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '6px', display: 'block' }}>
                  Paid By *
                </label>
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
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
                  {members.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name} {m.name === group?.members?.[0]?.name ? '(You)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '6px', display: 'block' }}>
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
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

            {/* Split Type Selector */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '8px', display: 'block' }}>
                Split Method
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[
                  { id: 'EQUAL', label: 'Equally (1/N)' },
                  { id: 'EXACT', label: 'Exact Amounts (₹)' },
                  { id: 'PERCENT', label: 'Percentages (%)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSplitTypeChange(s.id)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: splitType === s.id ? '1px solid #00FF87' : '1px solid rgba(255, 255, 255, 0.08)',
                      background: splitType === s.id ? 'rgba(0, 255, 135, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      color: splitType === s.id ? '#00FF87' : '#94A3B8',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Split Matrix */}
            {splitType !== 'EQUAL' && (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {members.map((m) => (
                  <div key={m.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: '#F1F5F9', fontWeight: 600 }}>{m.name}</span>
                    {splitType === 'EXACT' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#94A3B8', fontSize: '13px' }}>₹</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={customAmounts[m.name] || ''}
                          onChange={(e) => handleCustomAmountChange(m.name, e.target.value)}
                          style={{
                            width: '100px',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            background: '#0A0D14',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#00FF87',
                            fontSize: '13px',
                            textAlign: 'right',
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="number"
                          step="1"
                          placeholder="0"
                          value={customPercentages[m.name] || ''}
                          onChange={(e) => handleCustomPercentageChange(m.name, e.target.value)}
                          style={{
                            width: '80px',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            background: '#0A0D14',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#00FF87',
                            fontSize: '13px',
                            textAlign: 'right',
                          }}
                        />
                        <span style={{ color: '#94A3B8', fontSize: '13px' }}>%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

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
                  Saving Group Expense...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Record & Calculate Split
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
