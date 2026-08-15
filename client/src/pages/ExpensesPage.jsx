import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiFetch } from '../api/client';

export const ExpensesPage = ({ onAddExpense, externalSearch = '', onClearExternalSearch, categories = [] }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(externalSearch);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    setSearch(externalSearch);
  }, [externalSearch]);

  const defaultCategoryList = ['All', 'Food & Dining', 'Transportation', 'Housing & Utilities', 'Entertainment', 'Shopping', 'Subscriptions'];
  const filterChips = categories.length > 0
    ? ['All', ...categories.filter(c => c.type !== 'income').map(c => c.name || c)]
    : defaultCategoryList;

  const fetchExpenses = async (targetPage = page) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (selectedCategory && selectedCategory !== 'All') queryParams.append('category', selectedCategory);
      queryParams.append('page', String(targetPage));
      queryParams.append('limit', String(limit));

      const res = await apiFetch(`/expenses?${queryParams.toString()}`);

      setExpenses(res.expenses || []);
      setPage(res.page || 1);
      setPages(res.pages || 1);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchExpenses(1);
  }, [search, selectedCategory]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pages) {
      setPage(newPage);
      fetchExpenses(newPage);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction record?')) return;
    try {
      await apiFetch(`/expenses/${id}`, { method: 'DELETE' });
      fetchExpenses(page);
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  };

  const exportCSV = () => {
    if (expenses.length === 0) return;
    const headers = ['Title', 'Amount', 'Category', 'Date', 'Merchant', 'PaymentMethod', 'Note'];
    const rows = expenses.map(e => [
      `"${e.title.replace(/"/g, '""')}"`,
      e.amount,
      `"${e.category}"`,
      new Date(e.date).toISOString().split('T')[0],
      `"${e.merchant || ''}"`,
      `"${e.paymentMethod || ''}"`,
      `"${(e.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial_expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="heading-xl">Transaction Records</h1>
          <p className="body-sm" style={{ color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {total > 0 ? `Showing ${total} total recorded transactions.` : 'All recorded transactions.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={exportCSV} className="btn-glass-secondary" style={{ height: '40px' }}>
            <Download size={15} />
            Export CSV
          </button>
          <button onClick={onAddExpense} className="btn-primary-mint" style={{ height: '40px' }}>
            <Plus size={16} />
            Add Expense
          </button>
        </div>
      </div>

      {/* Filter Chip Strip */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {filterChips.map((chip) => (
          <button
            key={chip}
            onClick={() => setSelectedCategory(chip === 'All' ? '' : chip)}
            className={`filter-chip ${((selectedCategory === '' && chip === 'All') || selectedCategory === chip) ? 'filter-chip-active' : ''}`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Search status indicator */}
      {search && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: 'var(--color-text-muted)' }}>
          <span>Filtered by search: <strong style={{ color: '#00FF87' }}>"{search}"</strong></span>
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

      {/* Transactions List Card Container */}
      <div className="glass-card" style={{ padding: '24px', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }} className="body-md">
            Fetching transaction records...
          </div>
        ) : expenses.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }} className="body-md">
            No expenses found matching filter criteria.
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                  <th style={{ padding: '12px 10px', fontWeight: 600 }}>Transaction</th>
                  <th style={{ padding: '12px 10px', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '12px 10px', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '12px 10px', fontWeight: 600 }}>Payment Method</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 600 }}>Amount</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 600 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '14px 10px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>{e.title}</div>
                      {e.merchant && <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}>{e.merchant}</div>}
                    </td>
                    <td style={{ padding: '14px 10px' }}>
                      <span
                        style={{
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#00FF87',
                          border: '1px solid rgba(16, 185, 129, 0.35)',
                          padding: '3px 9px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}
                      >
                        {e.category}
                      </span>
                    </td>
                    <td style={{ padding: '14px 10px', color: 'var(--color-text-muted)', fontSize: '13.5px' }}>
                      {new Date(e.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 10px', color: 'var(--color-text-muted)', fontSize: '13.5px' }}>
                      {e.paymentMethod}
                    </td>
                    <td style={{ padding: '14px 10px', textAlign: 'right', fontWeight: 800, color: '#F8FAFC', fontFamily: 'var(--font-display)' }}>
                      ₹{e.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 10px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(e._id)}
                        style={{ color: '#F43F5E', cursor: 'pointer', border: 'none', background: 'none', padding: '4px' }}
                        title="Delete transaction"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Toolbar */}
            {pages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)',
                flexWrap: 'wrap',
                gap: '12px',
              }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total} transactions
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    className="btn-glass-secondary"
                    style={{ height: '34px', padding: '0 12px', fontSize: '12.5px', opacity: page <= 1 ? 0.5 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
                  >
                    <ChevronLeft size={15} /> Previous
                  </button>

                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', padding: '0 6px' }}>
                    Page {page} of {pages}
                  </span>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= pages}
                    className="btn-glass-secondary"
                    style={{ height: '34px', padding: '0 12px', fontSize: '12.5px', opacity: page >= pages ? 0.5 : 1, cursor: page >= pages ? 'not-allowed' : 'pointer' }}
                  >
                    Next <ChevronRight size={15} />
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
