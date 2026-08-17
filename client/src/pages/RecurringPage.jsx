import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, History, X } from 'lucide-react';
import { apiFetch, getLocalDateString } from '../api/client';
import { PinCard } from '../components/UI/PinCard';

export const RecurringPage = ({ categories = [] }) => {
  const [recurring, setRecurring] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultCategoryList = ['Subscriptions', 'Housing & Utilities', 'Health & Medical', 'Entertainment', 'Transportation', 'Food & Dining'];
  const availableCategories = categories.length > 0
    ? categories.filter(c => c.type !== 'income').map(c => c.name || c)
    : defaultCategoryList;

  // Create / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(availableCategories.includes('Subscriptions') ? 'Subscriptions' : availableCategories[0] || 'Subscriptions');
  const [frequency, setFrequency] = useState('monthly');
  const [nextOccurrence, setNextOccurrence] = useState('');
  const [active, setActive] = useState(true);

  // History Drawer State
  const [historyDrawerItem, setHistoryDrawerItem] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchRecurring = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/recurring');
      setRecurring(res || []);
    } catch (err) {
      console.error('Failed to fetch recurring expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurring();
  }, []);

  const RECURRING_DRAFT_KEY = 'richy_draft_recurring';

  const openCreateModal = () => {
    setEditingItem(null);
    try {
      const saved = localStorage.getItem(RECURRING_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setTitle(parsed.title || '');
        setAmount(parsed.amount || '');
        setCategory(parsed.category || 'Subscriptions');
        setFrequency(parsed.frequency || 'monthly');
        setNextOccurrence(parsed.nextOccurrence || getLocalDateString(new Date()));
        setActive(parsed.active !== false);
        setShowModal(true);
        return;
      }
    } catch {}

    setTitle('');
    setAmount('');
    setCategory(availableCategories.includes('Subscriptions') ? 'Subscriptions' : availableCategories[0] || 'Subscriptions');
    setFrequency('monthly');
    setNextOccurrence(getLocalDateString(new Date()));
    setActive(true);
    setShowModal(true);
  };

  // Autosave draft for new recurring item
  useEffect(() => {
    if (showModal && !editingItem && (title || amount)) {
      try {
        localStorage.setItem(
          RECURRING_DRAFT_KEY,
          JSON.stringify({ title, amount, category, frequency, nextOccurrence, active })
        );
      } catch {}
    }
  }, [showModal, editingItem, title, amount, category, frequency, nextOccurrence, active]);

  const openEditModal = (item) => {
    setEditingItem(item);
    setTitle(item.title);
    setAmount(item.amount);
    setCategory(item.category);
    setFrequency(item.frequency || 'monthly');
    setNextOccurrence(getLocalDateString(item.nextOccurrence));
    setActive(item.active !== false);
    setShowModal(true);
  };

  const handleSaveRecurring = async (e) => {
    e.preventDefault();
    if (!title || !amount || !nextOccurrence) return;

    try {
      const payload = {
        title,
        amount: Number(amount),
        category,
        frequency,
        nextOccurrence,
        active,
      };

      if (editingItem) {
        await apiFetch(`/recurring/${editingItem._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/recurring', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        localStorage.removeItem(RECURRING_DRAFT_KEY);
      }

      setShowModal(false);
      fetchRecurring();
    } catch (err) {
      console.error('Failed to save recurring expense:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscription?')) return;
    try {
      await apiFetch(`/recurring/${id}`, { method: 'DELETE' });
      fetchRecurring();
    } catch (err) {
      console.error('Failed to delete subscription:', err);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await apiFetch(`/recurring/${id}/pay`, { method: 'POST' });
      fetchRecurring();
      if (historyDrawerItem && historyDrawerItem._id === id) {
        openHistoryDrawer(historyDrawerItem);
      }
    } catch (err) {
      console.error('Failed to record subscription payment:', err);
    }
  };

  const openHistoryDrawer = async (item) => {
    setHistoryDrawerItem(item);
    setHistoryLoading(true);
    try {
      const res = await apiFetch(`/recurring/${item._id}/history`);
      setHistoryData(res);
    } catch (err) {
      console.error('Failed to fetch subscription history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const totalMonthlyBurden = recurring
    .filter(r => r.active !== false)
    .reduce((sum, item) => {
      if (item.frequency === 'yearly') return sum + Math.round(item.amount / 12);
      if (item.frequency === 'weekly') return sum + Math.round(item.amount * 4.33);
      if (item.frequency === 'daily') return sum + Math.round(item.amount * 30);
      return sum + item.amount;
    }, 0);

  if (loading) return <div style={{ padding: '64px', textAlign: 'center', color: 'var(--color-muted-text)' }} className="body-md">Loading Subscriptions Engine...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="heading-xl">Subscriptions & Obligations</h1>
          <p className="body-sm" style={{ color: 'var(--color-muted-text)' }}>Deterministic calculation of recurring monthly commitments and payment history timeline.</p>
        </div>
        <button onClick={openCreateModal} className="button-primary">
          <Plus size={18} /> Add Subscription
        </button>
      </div>

      {/* Monthly Burden KPI Card */}
      <PinCard
        title="Monthly Recurring Burden"
        amount={totalMonthlyBurden}
        overlayPill={`${recurring.filter(r => r.active !== false).length} Active Subscriptions`}
        subtitle="Fixed monthly commitments automatically tracked"
      />

      {/* Subscriptions Grid */}
      <div className="grid-masonry">
        {recurring.map((item) => (
          <div key={item._id} className="pin-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 className="heading-md">{item.title}</h3>
                <span className="body-sm" style={{ color: 'var(--color-muted-text)' }}>{item.category}</span>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => openEditModal(item)} className="button-icon-circular" style={{ width: '32px', height: '32px' }} title="Edit Subscription">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(item._id)} className="button-icon-circular" style={{ width: '32px', height: '32px', color: 'var(--color-destructive)' }} title="Delete Subscription">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}>
                ₹{item.amount.toLocaleString()}
              </div>
              <span className="pin-overlay-pill" style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-foreground)', borderColor: 'var(--color-border)' }}>
                {item.active !== false ? item.frequency : 'Paused'}
              </span>
            </div>

            <div className="body-sm" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '8px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--color-muted-text)' }}>Next Due: {new Date(item.nextOccurrence).toLocaleDateString()}</span>
              <button
                onClick={() => handleMarkPaid(item._id)}
                className="button-secondary"
                style={{ height: '28px', padding: '2px 10px', fontSize: '11px', gap: '4px' }}
                title="Record cycle payment now"
              >
                <CheckCircle2 size={12} color="var(--color-accent)" />
                Mark Paid
              </button>
            </div>

            <button
              onClick={() => openHistoryDrawer(item)}
              className="button-secondary"
              style={{ width: '100%', height: '32px', fontSize: '12px', marginTop: '4px', gap: '6px' }}
            >
              <History size={14} />
              View Payment History
            </button>
          </div>
        ))}
      </div>

      {/* Create / Edit Subscription Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="heading-lg">{editingItem ? 'Edit Subscription' : 'Add Subscription'}</h3>
              <button onClick={() => setShowModal(false)} className="button-icon-circular"><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveRecurring}>
              <div style={{ marginBottom: '16px' }}>
                <label className="body-sm-strong" style={{ display: 'block', marginBottom: '6px' }}>Title *</label>
                <input type="text" required className="text-input" placeholder="e.g. Netflix 4K" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="body-sm-strong" style={{ display: 'block', marginBottom: '6px' }}>Amount (₹) *</label>
                  <input type="number" required min="1" className="text-input" placeholder="649" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <div>
                  <label className="body-sm-strong" style={{ display: 'block', marginBottom: '6px' }}>Category *</label>
                  <select className="text-input" value={category} onChange={(e) => setCategory(e.target.value)} style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-foreground)' }}>
                    {availableCategories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="body-sm-strong" style={{ display: 'block', marginBottom: '6px' }}>Frequency</label>
                  <select className="text-input" value={frequency} onChange={(e) => setFrequency(e.target.value)} style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-foreground)' }}>
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="yearly">Yearly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
                <div>
                  <label className="body-sm-strong" style={{ display: 'block', marginBottom: '6px' }}>Next Due Date *</label>
                  <input type="date" required className="text-input" value={nextOccurrence} onChange={(e) => setNextOccurrence(e.target.value)} />
                </div>
              </div>

              {editingItem && (
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="activeCheckbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="activeCheckbox" className="body-sm-strong" style={{ cursor: 'pointer' }}>Active Subscription</label>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="button-secondary">Cancel</button>
                <button type="submit" className="button-primary">
                  {editingItem ? 'Update Subscription' : 'Save Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscription Payment History Drawer / Modal */}
      {historyDrawerItem && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '580px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <h3 className="heading-lg">{historyDrawerItem.title}</h3>
                <span className="body-sm" style={{ color: 'var(--color-muted-text)' }}>Payment History Timeline</span>
              </div>
              <button onClick={() => setHistoryDrawerItem(null)} className="button-icon-circular"><X size={18} /></button>
            </div>

            {historyLoading || !historyData ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-muted-text)' }} className="body-md">
                Fetching payment timeline...
              </div>
            ) : (
              <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Timeline Analytics KPI grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-secondary)', border: '1px solid var(--color-border)' }}>
                    <div className="body-sm" style={{ color: 'var(--color-muted-text)' }}>All-Time Spent</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-foreground)' }}>
                      ₹{historyData.totalSpentAllTime.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-secondary)', border: '1px solid var(--color-border)' }}>
                    <div className="body-sm" style={{ color: 'var(--color-muted-text)' }}>Cycles Paid</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-foreground)' }}>
                      {historyData.paymentCount} Cycles
                    </div>
                  </div>
                  <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-secondary)', border: '1px solid var(--color-border)' }}>
                    <div className="body-sm" style={{ color: 'var(--color-muted-text)' }}>Status</div>
                    <span className="pin-overlay-pill" style={{ marginTop: '4px', backgroundColor: historyData.status === 'Overdue' ? 'var(--color-destructive)' : 'var(--color-primary)', color: historyData.status === 'Overdue' ? '#FFFFFF' : 'var(--color-accent)' }}>
                      {historyData.status}
                    </span>
                  </div>
                </div>

                {/* Mark Paid Quick Action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-secondary)', border: '1px solid var(--color-border)' }}>
                  <div>
                    <div className="body-sm-strong" style={{ color: 'var(--color-foreground)' }}>Current Cycle Due</div>
                    <div className="body-sm" style={{ color: 'var(--color-muted-text)' }}>Next Due: {new Date(historyData.subscription.nextOccurrence).toLocaleDateString()}</div>
                  </div>
                  <button
                    onClick={() => handleMarkPaid(historyDrawerItem._id)}
                    className="button-primary"
                    style={{ height: '36px', fontSize: '13px' }}
                  >
                    <CheckCircle2 size={14} />
                    Record Paid Cycle
                  </button>
                </div>

                {/* Linked Transaction Timeline */}
                <div>
                  <h4 className="heading-md" style={{ fontSize: '16px', marginBottom: '12px' }}>Chronological Transactions Log</h4>
                  {historyData.history.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-muted-text)' }} className="body-sm">
                      No past payments recorded yet. Click "Record Paid Cycle" to log your first payment.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {historyData.history.map((tx) => (
                        <div key={tx._id} style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-secondary)', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div className="body-sm-strong" style={{ color: 'var(--color-foreground)' }}>{tx.title}</div>
                            <div className="body-sm" style={{ fontSize: '12px', color: 'var(--color-muted-text)' }}>{new Date(tx.date).toLocaleDateString()} | {tx.paymentMethod}</div>
                          </div>
                          <div style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-foreground)' }}>
                            ₹{tx.amount.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
