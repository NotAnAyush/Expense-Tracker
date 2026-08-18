import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  X, 
  Check, 
  AlertTriangle, 
  Layers, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckSquare, 
  Square,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../../api/client';

export const BankStatementModal = ({ isOpen, onClose, onImportComplete, categories = [] }) => {
  const [csvContent, setCsvContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [importMode, setImportMode] = useState('CSV'); // 'CSV' | 'SMS'
  const [smsInput, setSmsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [importing, setImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const defaultCategories = ['Food & Dining', 'Transportation', 'Housing & Utilities', 'Entertainment', 'Shopping', 'Health & Medical', 'Subscriptions', 'Salary', 'Freelance', 'Investments', 'Other'];
  const categoryOptions = categories.length > 0 ? categories.map(c => c.name || c) : defaultCategories;

  const handleParseSms = async () => {
    if (!smsInput.trim()) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await apiFetch('/import/sms-parse', {
        method: 'POST',
        body: JSON.stringify({ smsText: smsInput }),
      });
      const parsedTx = {
        id: `sms-${Date.now()}`,
        date: res.date || new Date().toISOString().split('T')[0],
        title: `${res.merchant || res.bank} (${res.refNumber || 'SMS'})`,
        amount: res.amount,
        type: res.type === 'CREDIT' ? 'income' : 'expense',
        category: res.category || 'General & Miscellaneous',
        merchant: res.merchant,
        paymentMethod: res.bank === 'UPI' ? 'UPI' : 'Bank Transfer',
        selected: true,
      };
      setTransactions([parsedTx]);
      setPreviewData({
        summary: {
          totalParsed: 1,
          totalDebits: res.type === 'DEBIT' ? res.amount : 0,
          totalCredits: res.type === 'CREDIT' ? res.amount : 0,
          duplicatesFound: 0,
        },
      });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to parse SMS transaction.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      setCsvContent(text);
      await fetchPreview(text);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read CSV file.');
    };
    reader.readAsText(file);
  };

  const fetchPreview = async (text) => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await apiFetch('/import/bank-statement/preview', {
        method: 'POST',
        body: JSON.stringify({ csvContent: text }),
      });

      setPreviewData(res);
      setTransactions(res.transactions || []);
    } catch (err) {
      console.error('Statement preview failed:', err);
      setErrorMsg(err.message || 'Failed to parse bank statement CSV. Please verify file format.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    const allSelected = transactions.every(t => t.selected);
    setTransactions(transactions.map(t => ({ ...t, selected: !allSelected })));
  };

  const toggleTransaction = (id) => {
    setTransactions(transactions.map(t => t.id === id ? { ...t, selected: !t.selected } : t));
  };

  const handleCategoryChange = (id, newCat) => {
    setTransactions(transactions.map(t => t.id === id ? { ...t, category: newCat } : t));
  };

  const handleCommit = async () => {
    const selectedTxns = transactions.filter(t => t.selected);
    if (selectedTxns.length === 0) {
      setErrorMsg('Please select at least one transaction to import.');
      return;
    }

    try {
      setImporting(true);
      setErrorMsg('');
      const res = await apiFetch('/import/bank-statement/commit', {
        method: 'POST',
        body: JSON.stringify({ transactions: selectedTxns }),
      });

      if (onImportComplete) {
        onImportComplete(res);
      }
      onClose();
    } catch (err) {
      console.error('Statement commit failed:', err);
      setErrorMsg(err.message || 'Failed to commit transactions to ledger.');
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  const selectedCount = transactions.filter(t => t.selected).length;

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
          className="glass-card"
          style={{
            width: '100%',
            maxWidth: '860px',
            maxHeight: '90vh',
            padding: '28px',
            border: '1px solid rgba(0, 255, 135, 0.25)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 255, 135, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            overflowY: 'auto',
          }}
        >
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(0, 255, 135, 0.12)',
                  border: '1px solid rgba(0, 255, 135, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00FF87',
                }}
              >
                <FileSpreadsheet size={22} />
              </div>
              <div>
                <h2 className="heading-lg" style={{ margin: 0, color: '#F8FAFC' }}>
                  Bank Statement & SMS Ingestion Engine
                </h2>
                <p className="body-sm" style={{ margin: '2px 0 0 0', color: '#94A3B8' }}>
                  Smart CSV parser and deterministic regex engine for Indian bank SMS alerts.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn-icon-soft"
            >
              <X size={16} />
            </button>
          </div>

          {/* Mode Switcher Filter Chips */}
          {!previewData && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setImportMode('CSV')}
                className={`filter-chip ${importMode === 'CSV' ? 'filter-chip-active' : ''}`}
              >
                <FileSpreadsheet size={13} />
                <span>Bank Statement CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setImportMode('SMS')}
                className={`filter-chip ${importMode === 'SMS' ? 'filter-chip-active' : ''}`}
              >
                <MessageSquare size={13} />
                <span>Instant Bank SMS Paste</span>
              </button>
            </div>
          )}

          {/* Upload Dropzone for CSV */}
          {!previewData && importMode === 'CSV' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="glass-card-interactive"
              style={{
                border: '2px dashed rgba(0, 255, 135, 0.35)',
                borderRadius: '18px',
                padding: '40px 20px',
                textAlign: 'center',
                background: 'rgba(0, 255, 135, 0.02)',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <Upload size={36} color="#00FF87" style={{ margin: '0 auto 12px' }} />
              <div className="heading-md" style={{ color: '#F8FAFC' }}>
                Click or Drop your Bank Statement CSV here
              </div>
              <div className="body-sm" style={{ color: '#94A3B8', marginTop: '6px' }}>
                Supports HDFC, SBI, ICICI, Axis, Kotak, Chase, Amex, and standard 5-column CSV statements
              </div>
            </div>
          )}

          {/* Instant SMS Paste Box */}
          {!previewData && importMode === 'SMS' && (
            <div
              className="glass-card"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                border: '1px solid rgba(0, 240, 255, 0.25)',
              }}
            >
              <label className="body-sm" style={{ color: '#E2E8F0', fontWeight: 600 }}>
                Paste bank transaction SMS alert (HDFC, SBI, ICICI, Axis, Kotak, PayTM, PhonePe, UPI):
              </label>
              <textarea
                rows={4}
                value={smsInput}
                onChange={(e) => setSmsInput(e.target.value)}
                placeholder="e.g. Sent Rs.1,500.00 from HDFC Bank A/C *1234 to ZOMATO on 18-08-26. UPI Ref: 423589201938"
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '12px',
                  color: '#FFF',
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono)',
                  resize: 'none',
                }}
              />
              <button
                type="button"
                onClick={handleParseSms}
                disabled={loading || !smsInput.trim()}
                className="btn-primary-mint"
                style={{ alignSelf: 'flex-start', height: '36px', padding: '0 18px' }}
              >
                <Sparkles size={14} />
                <span>{loading ? 'Parsing SMS...' : 'Parse & Stage SMS Transaction'}</span>
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <RefreshCw size={24} color="#00FF87" className="animate-spin" style={{ margin: '0 auto 10px' }} />
              <div className="body-sm" style={{ color: '#94A3B8' }}>Parsing statement records and computing hashes...</div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(244, 63, 94, 0.08)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#FECDD3',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertTriangle size={15} color="#F43F5E" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Preview State Table */}
          {previewData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Summary Metrics Banner */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '10px',
                }}
              >
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '10px 14px' }}>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>Parsed Count</span>
                  <div className="font-display tabular-nums" style={{ fontSize: '16px', fontWeight: 800, color: '#F8FAFC' }}>
                    {previewData.summary?.totalParsed || transactions.length}
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '10px 14px' }}>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>Total Debits</span>
                  <div className="font-display tabular-nums" style={{ fontSize: '16px', fontWeight: 800, color: '#F43F5E' }}>
                    ₹{Number(previewData.summary?.totalDebits || 0).toLocaleString()}
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '10px 14px' }}>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>Total Credits</span>
                  <div className="font-display tabular-nums" style={{ fontSize: '16px', fontWeight: 800, color: '#00FF87' }}>
                    ₹{Number(previewData.summary?.totalCredits || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Staged Transactions Table */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  style={{ background: 'none', border: 'none', color: '#00F0FF', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {transactions.every(t => t.selected) ? <CheckSquare size={15} /> : <Square size={15} />}
                  <span>{transactions.every(t => t.selected) ? 'Deselect All' : 'Select All'} ({selectedCount} chosen)</span>
                </button>
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => toggleTransaction(tx.id)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: tx.selected ? 'rgba(0, 255, 135, 0.04)' : 'rgba(255, 255, 255, 0.015)',
                      border: tx.selected ? '1px solid rgba(0, 255, 135, 0.25)' : '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ color: tx.selected ? '#00FF87' : '#64748B' }}>
                        {tx.selected ? <CheckSquare size={16} /> : <Square size={16} />}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>{tx.title}</div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>{tx.date} • {tx.paymentMethod}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <select
                        value={tx.category}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleCategoryChange(tx.id, e.target.value)}
                        style={{
                          background: 'rgba(10, 14, 24, 0.95)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          padding: '4px 8px',
                          color: '#00FF87',
                          fontSize: '11.5px',
                        }}
                      >
                        {categoryOptions.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>

                      <div className="font-display tabular-nums" style={{ fontSize: '14px', fontWeight: 800, color: tx.type === 'income' ? '#00FF87' : '#F43F5E', minWidth: '80px', textAlign: 'right' }}>
                        {tx.type === 'income' ? '+' : '-'}₹{Number(tx.amount)?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Commit Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <button
                  type="button"
                  onClick={() => { setPreviewData(null); setTransactions([]); }}
                  className="btn-glass-secondary"
                >
                  Reset Preview
                </button>
                <button
                  type="button"
                  onClick={handleCommit}
                  disabled={importing || selectedCount === 0}
                  className="btn-primary-mint"
                >
                  <Check size={14} />
                  <span>{importing ? 'Committing to Ledger...' : `Commit ${selectedCount} Transactions`}</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BankStatementModal;
