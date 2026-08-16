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
  Square 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../../api/client';

export const BankStatementModal = ({ isOpen, onClose, onImportComplete, categories = [] }) => {
  const [csvContent, setCsvContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [importing, setImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const defaultCategories = ['Food & Dining', 'Transportation', 'Housing & Utilities', 'Entertainment', 'Shopping', 'Health & Medical', 'Subscriptions', 'Salary', 'Freelance', 'Investments', 'Other'];
  const categoryOptions = categories.length > 0 ? categories.map(c => c.name || c) : defaultCategories;

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
          style={{
            width: '100%',
            maxWidth: '860px',
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
            position: 'relative',
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
                  background: 'rgba(0, 255, 135, 0.15)',
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
                <h2 className="heading-lg" style={{ margin: 0 }}>
                  Bank Statement Batch Importer
                </h2>
                <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '2px' }}>
                  Smart CSV Parser with column auto-mapper and duplicate deduplication signature.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: '999px',
                width: '32px',
                height: '32px',
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

          {/* Upload Dropzone */}
          {!previewData && (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed rgba(0, 255, 135, 0.4)',
                borderRadius: '18px',
                padding: '40px 20px',
                textAlign: 'center',
                background: 'rgba(0, 255, 135, 0.03)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
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
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#F1F5F9' }}>
                Click or Drop your Bank Statement CSV here
              </div>
              <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '6px' }}>
                Supports HDFC, SBI, ICICI, Axis, Chase, Amex, and generic 5-column CSV formats
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div style={{ padding: '30px', textAlign: 'center', color: '#00FF87' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} />
              <div>Analyzing columns and checking duplicate signatures...</div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div
              style={{
                padding: '12px 16px',
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

          {/* Staged Transactions Review Table */}
          {previewData && transactions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Summary Metric Strip */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '13px',
                  color: '#94A3B8',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span>Parsed: <strong>{previewData.parsedCount} items</strong></span>
                  <span>•</span>
                  <span>Duplicates Flagged: <strong style={{ color: previewData.duplicateCount > 0 ? '#FFD700' : '#00FF87' }}>{previewData.duplicateCount}</strong></span>
                  <span>•</span>
                  <span>Selected for Import: <strong style={{ color: '#00FF87' }}>{selectedCount}</strong></span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={toggleSelectAll}
                    className="btn-glass-secondary"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    {transactions.every(t => t.selected) ? 'Deselect All' : 'Select All'}
                  </button>

                  <button
                    onClick={() => {
                      setPreviewData(null);
                      setTransactions([]);
                      setCsvContent('');
                    }}
                    className="btn-glass-secondary"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    Upload New CSV
                  </button>
                </div>
              </div>

              {/* Transactions List */}
              <div style={{ maxHeight: '340px', overflowY: 'auto', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94A3B8', fontSize: '12px' }}>
                      <th style={{ padding: '10px', width: '36px' }}></th>
                      <th style={{ padding: '10px' }}>Date</th>
                      <th style={{ padding: '10px' }}>Description</th>
                      <th style={{ padding: '10px' }}>Category</th>
                      <th style={{ padding: '10px' }}>Type</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr
                        key={t.id}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          background: t.selected ? 'rgba(0, 255, 135, 0.03)' : 'transparent',
                          opacity: t.isDuplicate && !t.selected ? 0.5 : 1,
                        }}
                      >
                        <td style={{ padding: '10px' }}>
                          <button
                            onClick={() => toggleTransaction(t.id)}
                            style={{ background: 'none', border: 'none', color: t.selected ? '#00FF87' : '#64748B', cursor: 'pointer', padding: 0 }}
                          >
                            {t.selected ? <CheckSquare size={16} /> : <Square size={16} />}
                          </button>
                        </td>
                        <td style={{ padding: '10px', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                          {new Date(t.date).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <div style={{ fontWeight: 600, color: '#F1F5F9' }}>{t.title}</div>
                          {t.isDuplicate && (
                            <span style={{ fontSize: '10.5px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: 'rgba(255, 215, 0, 0.15)', color: '#FFD700', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
                              Duplicate Signature
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <select
                            value={t.category}
                            onChange={(e) => handleCategoryChange(t.id, e.target.value)}
                            style={{
                              background: 'rgba(15, 20, 32, 0.9)',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              borderRadius: '8px',
                              color: '#F8FAFC',
                              fontSize: '12px',
                              padding: '4px 8px',
                              outline: 'none',
                            }}
                          >
                            {categoryOptions.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '10px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: t.type === 'income' ? 'rgba(0, 255, 135, 0.15)' : 'rgba(255, 77, 77, 0.15)',
                              color: t.type === 'income' ? '#00FF87' : '#FF7D7D',
                              border: `1px solid ${t.type === 'income' ? 'rgba(0, 255, 135, 0.3)' : 'rgba(255, 77, 77, 0.3)'}`,
                            }}
                          >
                            {t.type === 'income' ? '+ Income' : '- Expense'}
                          </span>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 800, color: t.type === 'income' ? '#00FF87' : '#FF7D7D', fontFamily: 'var(--font-display)' }}>
                          {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Action Commit Bar */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  onClick={onClose}
                  className="btn-glass-secondary"
                  style={{ padding: '10px 20px' }}
                >
                  Cancel
                </button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCommit}
                  disabled={selectedCount === 0 || importing}
                  className="btn-primary-mint"
                  style={{ padding: '10px 24px', opacity: (selectedCount === 0 || importing) ? 0.5 : 1 }}
                >
                  {importing ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Importing {selectedCount} Records...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Commit {selectedCount} Records to Ledger
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
