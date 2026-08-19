import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, History, X, Repeat, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiFetch, getLocalDateString } from '../api/client';
import { PinCard } from '../components/UI/PinCard';
import { CountUp } from '../components/UI/CountUp';
import { usePrivacy } from '../context/PrivacyContext';

export const RecurringPage = ({ categories = [] }) => {
  const { isPrivacyMaskActive } = usePrivacy();
  const defaultCategoryList = ['Subscriptions', 'Housing & Utilities', 'Health & Medical', 'Entertainment', 'Transportation', 'Food & Dining', 'General'];
  const categoryOptions = categories.length > 0 ? categories.map(c => c.name || c) : defaultCategoryList;

  const [recurring, setRecurring] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categoryOptions[0] || 'Subscriptions');
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
    setCategory('Subscriptions');
    setFrequency('monthly');
    setNextOccurrence(getLocalDateString(new Date()));
    setActive(true);
    setShowModal(true);
  };

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

  if (loading) return <div style={{ padding: '64px', textAlign: 'center', color: '#94A3B8' }} className="body-md">Loading Subscriptions Engine...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span className="glass-pill" style={{ color: '#EC4899', borderColor: 'rgba(236, 72, 153, 0.25)' }}>
              <Repeat size={12} /> Fixed Obligations
            </span>
          </div>
          <h1 className="display-xl" style={{ margin: 0 }}>Subscriptions & Obligations</h1>
          <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '2px' }}>
            Deterministic recurring commitments and payment history timeline.
          </p>
        </div>
        <button onClick={openCreateModal} className="btn-primary-mint">
          <Plus size={15} strokeWidth={3} /> Add Subscription
        </button>
      </div>

      {/* Monthly Burden KPI Card */}
      <PinCard
        title="Monthly Recurring Burden"
        amount={totalMonthlyBurden}
        overlayPill={`${recurring.filter(r => r.active !== false).length} Active Subscriptions`}
        pillColor="violet"
        sparklineData={[12, 16, 14, 20, 24, 22, 28, 30]}
        subtitle="Fixed monthly commitments automatically tracked"
      />

      {/* Subscriptions Grid */}
      {recurring.length > 0 ? (
        <div className="grid-masonry">
          {recurring.map((item) => (
            <motion.div
              key={item._id}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="glass-card glass-card-hover-border"
              style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 className="heading-md" style={{ margin: 0, color: '#F1F5F9' }}>{item.title}</h3>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>{item.category}</span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => openEditModal(item)}
                    style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Edit Subscription"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)', color: '#FB7185', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Delete Subscription"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div className={`font-display tabular-nums ${isPrivacyMaskActive ? 'privacy-masked' : ''}`} style={{ fontSize: '24px', fontWeight: 800, color: '#00FF87' }}>
                  <CountUp value={Number(item.amount) || 0} prefix="₹" />
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: item.active !== false ? 'rgba(0, 255, 135, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    color: item.active !== false ? '#00FF87' : '#64748B',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    textTransform: 'capitalize',
                  }}
                >
                  {item.active !== false ? item.frequency : 'Paused'}
                </span>
              </div>

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '10px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B' }}>Due: {item.nextOccurrence ? new Date(item.nextOccurrence).toLocaleDateString() : 'N/A'}</span>
                <button
                  onClick={() => handleMarkPaid(item._id)}
                  className="btn-glass-secondary"
                  style={{ height: '26px', padding: '0 8px', fontSize: '11.5px', gap: '4px' }}
                  title="Record cycle payment now"
                >
                  <CheckCircle2 size={12} color="#00FF87" />
                  Mark Paid
                </button>
              </div>

              <button
                onClick={() => openHistoryDrawer(item)}
                className="btn-glass-secondary"
                style={{ width: '100%', height: '32px', fontSize: '12px', marginTop: '2px', gap: '6px' }}
              >
                <History size={13} />
                Payment Timeline
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#E2E8F0', marginBottom: '6px' }}>No Subscriptions or Recurring Bills</h3>
          <p style={{ fontSize: '13px', color: '#94A3B8', maxWidth: '420px', margin: '0 auto 16px' }}>
            Track Netflix, Spotify, gym memberships, rent, and utility bills with automated cycle reminders.
          </p>
          <button onClick={openCreateModal} className="btn-primary-mint" style={{ margin: '0 auto' }}>
            <Plus size={15} strokeWidth={3} /> Add First Subscription
          </button>
        </div>
      )}

      {/* Create / Edit Subscription Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="heading-lg" style={{ margin: 0 }}>{editingItem ? 'Edit Subscription' : 'Add Subscription'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveRecurring}>
              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">Title *</label>
                <input type="text" required className="glass-input" placeholder="e.g. Netflix 4K" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">Amount (₹) *</label>
                  <input type="number" required min="1" className="glass-input" placeholder="649" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Category *</label>
                  <select className="glass-input select-field" value={category} onChange={(e) => setCategory(e.target.value)}>
                    {categoryOptions.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">Frequency</label>
                  <select className="glass-input select-field" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="yearly">Yearly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Next Due Date *</label>
                  <input type="date" required className="glass-input" value={nextOccurrence} onChange={(e) => setNextOccurrence(e.target.value)} />
                </div>
              </div>

              {editingItem && (
                <div style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="activeCheckbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="activeCheckbox" style={{ fontSize: '13px', color: '#F1F5F9', cursor: 'pointer' }}>Active Subscription</label>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-glass-secondary">Cancel</button>
                <button type="submit" className="btn-primary-mint">
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div>
                <h3 className="heading-lg" style={{ margin: 0 }}>{historyDrawerItem.title}</h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Payment History Timeline</span>
              </div>
              <button onClick={() => setHistoryDrawerItem(null)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            {historyLoading || !historyData ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#64748B' }} className="body-md">
                Fetching payment timeline...
              </div>
            ) : (
              <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Timeline Analytics KPI grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>All-Time Spent</div>
                    <div className="font-display tabular-nums" style={{ fontSize: '16px', fontWeight: 800, color: '#F1F5F9', marginTop: '2px' }}>
                      ₹{historyData.totalSpentAllTime.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Cycles Paid</div>
                    <div className="font-display tabular-nums" style={{ fontSize: '16px', fontWeight: 800, color: '#F1F5F9', marginTop: '2px' }}>
                      {historyData.paymentCount} Cycles
                    </div>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Status</div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: historyData.status === 'Overdue' ? '#FB7185' : '#00FF87', display: 'inline-block', marginTop: '4px' }}>
                      {historyData.status}
                    </span>
                  </div>
                </div>

                {/* Mark Paid Quick Action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#F1F5F9' }}>Current Cycle Due</div>
                    <div style={{ fontSize: '11.5px', color: '#64748B' }}>Next Due: {new Date(historyData.subscription.nextOccurrence).toLocaleDateString()}</div>
                  </div>
                  <button
                    onClick={() => handleMarkPaid(historyDrawerItem._id)}
                    className="btn-primary-mint"
                    style={{ height: '32px', fontSize: '12px' }}
                  >
                    <CheckCircle2 size={13} />
                    Record Paid
                  </button>
                </div>

                {/* Linked Transaction Timeline */}
                <div>
                  <h4 className="heading-md" style={{ fontSize: '14px', marginBottom: '10px', color: '#F1F5F9' }}>Chronological Transactions Log</h4>
                  {historyData.history.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748B', fontSize: '12.5px' }}>
                      No past payments recorded yet. Click "Record Paid" to log your first payment.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {historyData.history.map((tx) => (
                        <div key={tx._id} style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#F1F5F9' }}>{tx.title}</div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>{new Date(tx.date).toLocaleDateString()} • {tx.paymentMethod}</div>
                          </div>
                          <div className="font-display tabular-nums" style={{ fontWeight: 800, color: '#00FF87', fontSize: '13.5px' }}>
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
