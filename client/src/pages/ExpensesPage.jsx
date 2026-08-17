import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Camera, 
  FileSpreadsheet, 
  Tag, 
  Layers, 
  ShieldCheck, 
  RefreshCw,
  Mic
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../api/client';
import { usePrivacy } from '../context/PrivacyContext';

export const ExpensesPage = ({
  onAddExpense,
  onAddIncome,
  onOpenReceiptScan,
  onOpenVoiceLog,
  onOpenBankImport,
  externalSearch = '',
  onClearExternalSearch,
  categories = []
}) => {
  const { isPrivacyMaskActive } = usePrivacy();
  // Mode: 'expenses' or 'income'
  const [activeMode, setActiveMode] = useState('expenses');

  // Expenses State
  const [expenses, setExpenses] = useState([]);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [expensePage, setExpensePage] = useState(1);
  const [expensePages, setExpensePages] = useState(1);

  // Incomes State
  const [incomes, setIncomes] = useState([]);
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [incomePage, setIncomePage] = useState(1);
  const [incomePages, setIncomePages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(externalSearch);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [onlyTaxDeductible, setOnlyTaxDeductible] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');
  const limit = 20;

  useEffect(() => {
    setSearch(externalSearch);
  }, [externalSearch]);

  const defaultExpenseCategories = ['All', 'Food & Dining', 'Transportation', 'Housing & Utilities', 'Entertainment', 'Shopping', 'Health & Medical', 'Subscriptions'];
  const defaultIncomeCategories = ['All', 'Salary', 'Freelance', 'Investments', 'Rental', 'Dividends', 'Gift', 'Refund', 'Other'];

  const filterChips = activeMode === 'expenses'
    ? (categories.length > 0 ? ['All', ...categories.map(c => c.name || c)] : defaultExpenseCategories)
    : defaultIncomeCategories;

  // Fetch Expenses
  const fetchExpenses = async (targetPage = expensePage) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (selectedCategory && selectedCategory !== 'All') queryParams.append('category', selectedCategory);
      if (onlyTaxDeductible) queryParams.append('isTaxDeductible', 'true');
      if (selectedTag) queryParams.append('tag', selectedTag);
      queryParams.append('page', String(targetPage));
      queryParams.append('limit', String(limit));

      const res = await apiFetch(`/expenses?${queryParams.toString()}`);
      setExpenses(res.expenses || []);
      setExpensePage(res.page || 1);
      setExpensePages(res.pages || 1);
      setExpenseTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Incomes
  const fetchIncomes = async (targetPage = incomePage) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (selectedCategory && selectedCategory !== 'All') queryParams.append('category', selectedCategory);
      if (selectedTag) queryParams.append('tag', selectedTag);
      queryParams.append('page', String(targetPage));
      queryParams.append('limit', String(limit));

      const res = await apiFetch(`/income?${queryParams.toString()}`);
      setIncomes(res.incomes || []);
      setIncomePage(res.page || 1);
      setIncomePages(res.pages || 1);
      setIncomeTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to fetch incomes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeMode === 'expenses') {
      setExpensePage(1);
      fetchExpenses(1);
    } else {
      setIncomePage(1);
      fetchIncomes(1);
    }
  }, [activeMode, search, selectedCategory, onlyTaxDeductible, selectedTag]);

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await apiFetch(`/expenses/${id}`, { method: 'DELETE' });
      fetchExpenses(expensePage);
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  };

  const handleDeleteIncome = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income record?')) return;
    try {
      await apiFetch(`/income/${id}`, { method: 'DELETE' });
      fetchIncomes(incomePage);
    } catch (err) {
      console.error('Failed to delete income:', err);
    }
  };

  const exportCSV = () => {
    const isExpense = activeMode === 'expenses';
    const dataList = isExpense ? expenses : incomes;
    if (dataList.length === 0) return;

    const headers = isExpense
      ? ['Title', 'Amount', 'Category', 'Date', 'Merchant', 'PaymentMethod', 'Tags', 'TaxSection', 'Note']
      : ['Title', 'Amount', 'Category', 'Date', 'Source', 'Recurring', 'Tags', 'Note'];

    const rows = isExpense
      ? expenses.map(e => [
          `"${e.title.replace(/"/g, '""')}"`,
          e.amount,
          `"${e.category}"`,
          new Date(e.date).toISOString().split('T')[0],
          `"${e.merchant || ''}"`,
          `"${e.paymentMethod || ''}"`,
          `"${(e.tags || []).join('; ')}"`,
          `"${e.taxSection || ''}"`,
          `"${(e.note || '').replace(/"/g, '""')}"`,
        ])
      : incomes.map(i => [
          `"${i.title.replace(/"/g, '""')}"`,
          i.amount,
          `"${i.category}"`,
          new Date(i.date).toISOString().split('T')[0],
          `"${i.source || ''}"`,
          i.isRecurring ? 'Yes' : 'No',
          `"${(i.tags || []).join('; ')}"`,
          `"${(i.note || '').replace(/"/g, '""')}"`,
        ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeMode}_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportTaxSummary = async () => {
    try {
      const year = new Date().getFullYear();
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/export/tax-summary?year=${year}&format=csv`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tax_deduction_summary_${year}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Tax export failed:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Header & Mode Toggle Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 className="heading-xl" style={{ margin: 0 }}>
              {activeMode === 'expenses' ? 'Outflows & Transactions' : 'Inflows & Revenue Streams'}
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '999px',
                background: activeMode === 'expenses' ? 'rgba(255, 77, 77, 0.15)' : 'rgba(0, 255, 135, 0.15)',
                color: activeMode === 'expenses' ? '#FF7D7D' : '#00FF87',
                border: `1px solid ${activeMode === 'expenses' ? 'rgba(255, 77, 77, 0.3)' : 'rgba(0, 255, 135, 0.3)'}`,
              }}
            >
              {activeMode === 'expenses' ? `${expenseTotal} Expenses` : `${incomeTotal} Incomes`}
            </span>
          </div>
          <p className="body-sm" style={{ marginTop: '4px' }}>
            {activeMode === 'expenses'
              ? 'Complete multi-tag ledger with category splits and tax deductions.'
              : 'Salary, freelance income, investment dividends & revenue tracking.'}
          </p>
        </div>

        {/* Dual-Mode Toggle Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              padding: '3px',
            }}
          >
            <button
              onClick={() => {
                setActiveMode('expenses');
                setSelectedCategory('');
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '11px',
                border: 'none',
                background: activeMode === 'expenses' ? 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)' : 'transparent',
                color: activeMode === 'expenses' ? '#FFF' : '#94A3B8',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
            >
              <ArrowUpRight size={14} /> Expenses (Outflow)
            </button>
            <button
              onClick={() => {
                setActiveMode('income');
                setSelectedCategory('');
                setOnlyTaxDeductible(false);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '11px',
                border: 'none',
                background: activeMode === 'income' ? 'linear-gradient(135deg, #00FF87 0%, #60EFFF 100%)' : 'transparent',
                color: activeMode === 'income' ? '#050810' : '#94A3B8',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
            >
              <ArrowDownLeft size={14} /> Incomes (Inflow)
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Import Statement CSV Button */}
            {onOpenBankImport && (
              <button
                onClick={onOpenBankImport}
                className="btn-glass-secondary"
                title="Import Bank Statement CSV"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '9px 14px', color: '#FFD700', border: '1px solid rgba(255, 215, 0, 0.3)' }}
              >
                <FileSpreadsheet size={15} /> Import CSV
              </button>
            )}

            {/* Voice Quick-Log Button */}
            {onOpenVoiceLog && (
              <button
                onClick={onOpenVoiceLog}
                className="btn-glass-secondary"
                title="Voice Quick-Log ('Paid 450 Uber')"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '9px 14px', color: '#00F0FF', border: '1px solid rgba(0, 240, 255, 0.3)' }}
              >
                <Mic size={15} /> Voice Log
              </button>
            )}

            {activeMode === 'expenses' && (
              <>
                <button
                  onClick={handleExportTaxSummary}
                  className="btn-glass-secondary"
                  title="Download Tax Deductibles Sheet"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '9px 14px' }}
                >
                  <ShieldCheck size={15} color="#00FF87" />
                  Tax Sheet (CSV)
                </button>

                {onOpenReceiptScan && (
                  <button
                    onClick={onOpenReceiptScan}
                    style={{
                      padding: '9px 14px',
                      borderRadius: '12px',
                      background: 'rgba(0, 240, 255, 0.12)',
                      border: '1px solid rgba(0, 240, 255, 0.35)',
                      color: '#00F0FF',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Camera size={15} /> Scan Receipt
                  </button>
                )}
              </>
            )}

            <button onClick={exportCSV} className="btn-glass-secondary" style={{ padding: '9px 14px' }}>
              <Download size={15} /> Export
            </button>

            {activeMode === 'expenses' ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onAddExpense}
                style={{
                  padding: '9px 18px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #00FF87 0%, #FFD700 100%)',
                  border: 'none',
                  color: '#050810',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  fontFamily: 'var(--font-heading)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 15px rgba(0, 255, 135, 0.35)',
                }}
              >
                <Plus size={16} /> Record Expense
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onAddIncome}
                style={{
                  padding: '9px 18px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #00FF87 0%, #60EFFF 100%)',
                  border: 'none',
                  color: '#050810',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  fontFamily: 'var(--font-heading)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 15px rgba(0, 255, 135, 0.35)',
                }}
              >
                <Plus size={16} /> Record Income
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Chips Strip */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', alignItems: 'center' }}>
        {activeMode === 'expenses' && (
          <button
            onClick={() => setOnlyTaxDeductible(!onlyTaxDeductible)}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              border: `1px solid ${onlyTaxDeductible ? '#00FF87' : 'rgba(255, 255, 255, 0.12)'}`,
              background: onlyTaxDeductible ? 'rgba(0, 255, 135, 0.18)' : 'rgba(255, 255, 255, 0.04)',
              color: onlyTaxDeductible ? '#00FF87' : '#94A3B8',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={14} /> Tax Deductible (80C/80D/80G)
          </button>
        )}

        {filterChips.map((chip) => (
          <button
            key={chip}
            onClick={() => setSelectedCategory(chip === 'All' ? '' : chip)}
            className={`filter-chip ${((selectedCategory === '' && chip === 'All') || selectedCategory === chip) ? 'filter-chip-active' : ''}`}
            style={{ flexShrink: 0 }}
          >
            {chip}
          </button>
        ))}

        {selectedTag && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '999px',
              background: 'rgba(0, 240, 255, 0.15)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              color: '#00F0FF',
              fontSize: '12px',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            <span>Tag: #{selectedTag}</span>
            <button
              onClick={() => setSelectedTag('')}
              style={{ background: 'none', border: 'none', color: '#00F0FF', cursor: 'pointer', padding: 0 }}
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Search status indicator */}
      {search && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94A3B8' }}>
          <span>Filtered by search: <strong>"{search}"</strong></span>
          <button
            onClick={() => {
              setSearch('');
              if (onClearExternalSearch) onClearExternalSearch();
            }}
            style={{ color: '#00FF87', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Ledger Container */}
      <div
        className="pin-card"
        style={{
          background: 'linear-gradient(145deg, rgba(16, 22, 36, 0.95) 0%, rgba(10, 14, 24, 0.98) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '20px',
          overflowX: 'auto',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
        }}
      >
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px', color: '#00FF87' }} />
            <div>Fetching {activeMode === 'expenses' ? 'transactions' : 'incomes'}...</div>
          </div>
        ) : (activeMode === 'expenses' ? expenses.length === 0 : incomes.length === 0) ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94A3B8' }}>
            No {activeMode} found matching the selected filter criteria.
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94A3B8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '12px 10px' }}>{activeMode === 'expenses' ? 'Transaction' : 'Income Source'}</th>
                  <th style={{ padding: '12px 10px' }}>Category</th>
                  <th style={{ padding: '12px 10px' }}>Date</th>
                  <th style={{ padding: '12px 10px' }}>{activeMode === 'expenses' ? 'Payment / Tags' : 'Type / Tags'}</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeMode === 'expenses' ? (
                  /* Expenses Rows */
                  expenses.map((e) => (
                    <tr key={e._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ fontWeight: 700, color: '#F1F5F9' }}>{e.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', fontSize: '12px', color: '#94A3B8' }}>
                          {e.merchant && <span>{e.merchant}</span>}
                          {e.splits && e.splits.length > 0 && (
                            <span style={{ color: '#00F0FF', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Layers size={11} /> {e.splits.length} splits
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#E2E8F0',
                          }}
                        >
                          {e.category}
                        </span>
                      </td>
                      <td style={{ padding: '14px 10px', color: '#94A3B8', fontSize: '13px' }}>
                        {new Date(e.date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: '#94A3B8' }}>{e.paymentMethod}</span>
                          {e.isTaxDeductible && (
                            <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '6px', background: 'rgba(0, 255, 135, 0.15)', color: '#00FF87', border: '1px solid rgba(0, 255, 135, 0.3)' }}>
                              {e.taxSection || 'Tax Deductible'}
                            </span>
                          )}
                          {(e.tags || []).map((t) => (
                            <span
                              key={t}
                              onClick={() => setSelectedTag(t)}
                              style={{ fontSize: '10.5px', color: '#00F0FF', cursor: 'pointer', background: 'rgba(0, 240, 255, 0.08)', padding: '1px 5px', borderRadius: '4px' }}
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className={isPrivacyMaskActive ? 'privacy-masked' : ''} style={{ padding: '14px 10px', textAlign: 'right', fontWeight: 800, color: '#FF7D7D', fontSize: '15px', fontFamily: 'var(--font-display)' }}>
                        -₹{e.amount.toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 10px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteExpense(e._id)}
                          style={{ color: '#FF7D7D', cursor: 'pointer', border: 'none', background: 'rgba(255, 77, 77, 0.1)', padding: '6px', borderRadius: '8px' }}
                          title="Delete expense"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  /* Incomes Rows */
                  incomes.map((i) => (
                    <tr key={i._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ fontWeight: 700, color: '#F1F5F9' }}>{i.title}</div>
                        {i.source && <div style={{ fontSize: '12px', color: '#94A3B8' }}>{i.source}</div>}
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '8px',
                            background: 'rgba(0, 255, 135, 0.12)',
                            border: '1px solid rgba(0, 255, 135, 0.3)',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#00FF87',
                          }}
                        >
                          {i.category}
                        </span>
                      </td>
                      <td style={{ padding: '14px 10px', color: '#94A3B8', fontSize: '13px' }}>
                        {new Date(i.date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                          {i.isRecurring && (
                            <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '6px', background: 'rgba(0, 240, 255, 0.15)', color: '#00F0FF' }}>
                              Recurring ({i.recurringFrequency})
                            </span>
                          )}
                          {(i.tags || []).map((t) => (
                            <span
                              key={t}
                              onClick={() => setSelectedTag(t)}
                              style={{ fontSize: '10.5px', color: '#00FF87', cursor: 'pointer', background: 'rgba(0, 255, 135, 0.08)', padding: '1px 5px', borderRadius: '4px' }}
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className={isPrivacyMaskActive ? 'privacy-masked' : ''} style={{ padding: '14px 10px', textAlign: 'right', fontWeight: 800, color: '#00FF87', fontSize: '15px', fontFamily: 'var(--font-display)' }}>
                        +₹{i.amount.toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 10px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteIncome(i._id)}
                          style={{ color: '#FF7D7D', cursor: 'pointer', border: 'none', background: 'rgba(255, 77, 77, 0.1)', padding: '6px', borderRadius: '8px' }}
                          title="Delete income"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {(activeMode === 'expenses' ? expensePages > 1 : incomePages > 1) && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '13px', color: '#94A3B8' }}>
                  Showing page {activeMode === 'expenses' ? expensePage : incomePage} of {activeMode === 'expenses' ? expensePages : incomePages}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => {
                      if (activeMode === 'expenses') fetchExpenses(expensePage - 1);
                      else fetchIncomes(incomePage - 1);
                    }}
                    disabled={activeMode === 'expenses' ? expensePage <= 1 : incomePage <= 1}
                    className="btn-glass-secondary"
                    style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>

                  <button
                    onClick={() => {
                      if (activeMode === 'expenses') fetchExpenses(expensePage + 1);
                      else fetchIncomes(incomePage + 1);
                    }}
                    disabled={activeMode === 'expenses' ? expensePage >= expensePages : incomePage >= incomePages}
                    className="btn-glass-secondary"
                    style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
