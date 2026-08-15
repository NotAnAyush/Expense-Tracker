import React, { useState, useEffect } from 'react';
import { 
  Repeat, 
  Plus, 
  Trash2, 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  X, 
  History, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch, getLocalDateString } from '../api/client';

export const RecurringPage = ({ categories = [] }) => {
  const [recurringList, setRecurringList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Subscriptions');
  const [frequency, setFrequency] = useState('Monthly');
  const [billingDay, setBillingDay] = useState('1');
  const [merchant, setMerchant] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [submitting, setSubmitting] = useState(false);

  const defaultCategoryList = ['Subscriptions', 'Housing & Utilities', 'Entertainment', 'Health & Medical', 'General'];
  const availableCategories = categories.length > 0
    ? categories.filter(c => c.type !== 'income').map(c => c.name || c)
    : defaultCategoryList;

  const fetchRecurring = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/recurring');
      setRecurringList(res);
    } catch (err) {
      console.error('Failed to fetch recurring expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurring();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !amount) return;
    setSubmitting(true);

    try {
      await apiFetch('/recurring', {
        method: 'POST',
        body: JSON.stringify({
          name,
          amount: Number(amount),
          category,
          frequency,
          billingDay: Number(billingDay),
          merchant,
          paymentMethod,
        }),
      });
      setModalOpen(false);
      setName('');
      setAmount('');
      setMerchant('');
      fetchRecurring();
    } catch (err) {
      console.error('Failed to create subscription:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPaid = async (sub) => {
    try {
      await apiFetch(`/recurring/${sub._id}/mark-paid`, {
        method: 'POST',
        body: JSON.stringify({ date: getLocalDateString(new Date()) }),
      });
      fetchRecurring();
    } catch (err) {
      console.error('Failed to mark as paid:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to stop tracking this recurring subscription?')) return;
    try {
      await apiFetch(`/recurring/${id}`, { method: 'DELETE' });
      fetchRecurring();
    } catch (err) {
      console.error('Failed to delete recurring expense:', err);
    }
  };

  const handleOpenHistory = async (sub) => {
    setSelectedSubscription(sub);
    setHistoryDrawerOpen(true);
    setLoadingHistory(true);
    try {
      const res = await apiFetch(`/recurring/${sub._id}/history`);
      setHistoryLogs(res);
    } catch (err) {
      console.error('Failed to fetch payment history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const totalMonthlyCommitment = recurringList.reduce((acc, r) => {
    if (r.frequency === 'Monthly') return acc + r.amount;
    if (r.frequency === 'Yearly') return acc + Math.round(r.amount / 12);
    if (r.frequency === 'Weekly') return acc + r.amount * 4;
    return acc + r.amount;
  }, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="heading-xl">Recurring Subscriptions</h1>
          <p className="body-sm" style={{ color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Monthly Fixed Commitment: ₹{totalMonthlyCommitment.toLocaleString()}/mo across {recurringList.length} active services.
          </p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn-primary-mint" style={{ height: '40px' }}>
          <Plus size={16} />
          Track Subscription
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }} className="body-md">
          Scanning subscription commitments...
        </div>
      ) : recurringList.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          No recurring memberships or bills logged. Track your Netflix, Gym, or iCloud subscriptions here.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {recurringList.map((r) => (
            <div key={r._id} className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <h3 className="heading-md" style={{ color: 'var(--color-text-main)' }}>{r.name}</h3>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{r.merchant || r.category}</span>
                </div>

                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    color: '#00FF87',
                  }}
                >
                  {r.frequency}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '12px' }}>
                <span className="font-display" style={{ fontSize: '26px', fontWeight: 800, color: '#00FF87' }}>
                  ₹{r.amount.toLocaleString()}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  / {r.frequency.toLowerCase()}
                </span>
              </div>

              <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={13} color="#00FF87" />
                <span>Next due: Day {r.billingDay || 1} of each cycle</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleMarkPaid(r)}
                    className="btn-primary-mint"
                    style={{ height: '32px', padding: '0 12px', fontSize: '12px' }}
                  >
                    <CheckCircle size={13} /> Log Payment
                  </button>

                  <button
                    onClick={() => handleOpenHistory(r)}
                    className="btn-glass-secondary"
                    style={{ height: '32px', padding: '0 10px', fontSize: '12px' }}
                    title="View History"
                  >
                    <History size={14} />
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(r._id)}
                  style={{ color: '#F43F5E', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                  title="Remove Subscription"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Subscription Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(4, 7, 14, 0.75)',
              backdropFilter: 'blur(8px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setModalOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="glass-card"
              style={{
                width: '100%',
                maxWidth: '480px',
                padding: '32px',
                background: 'rgba(15, 22, 36, 0.96)',
                border: '1px solid var(--border-light)',
                borderRadius: '24px',
              }}
            >
              <h2 className="heading-lg" style={{ color: 'var(--color-text-main)', marginBottom: '20px' }}>Track Subscription</h2>
              <form onSubmit={handleCreate}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                    Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="glass-input"
                    placeholder="e.g. Spotify Premium, AWS"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '11px 16px', borderRadius: '12px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                      Amount (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="glass-input"
                      placeholder="119"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      style={{ width: '100%', padding: '11px 16px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#00FF87', borderRadius: '12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                      Billing Day (1-31)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      className="glass-input"
                      value={billingDay}
                      onChange={(e) => setBillingDay(e.target.value)}
                      style={{ width: '100%', padding: '11px 16px', borderRadius: '12px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                      Frequency
                    </label>
                    <select
                      className="glass-input"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      style={{ width: '100%', padding: '11px 16px', borderRadius: '12px', background: 'rgba(14, 20, 32, 0.95)', color: '#F8FAFC' }}
                    >
                      <option value="Monthly" style={{ background: '#0F172A', color: '#F8FAFC' }}>Monthly</option>
                      <option value="Yearly" style={{ background: '#0F172A', color: '#F8FAFC' }}>Yearly</option>
                      <option value="Weekly" style={{ background: '#0F172A', color: '#F8FAFC' }}>Weekly</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                      Category
                    </label>
                    <select
                      className="glass-input"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{ width: '100%', padding: '11px 16px', borderRadius: '12px', background: 'rgba(14, 20, 32, 0.95)', color: '#F8FAFC' }}
                    >
                      {availableCategories.map((c, i) => (
                        <option key={i} value={c} style={{ background: '#0F172A', color: '#F8FAFC' }}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button type="button" onClick={() => setModalOpen(false)} className="btn-glass-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn-primary-mint">
                    {submitting ? 'Saving...' : 'Save Subscription'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Drawer */}
      <AnimatePresence>
        {historyDrawerOpen && selectedSubscription && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(4, 7, 14, 0.75)',
              backdropFilter: 'blur(8px)',
              zIndex: 100,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setHistoryDrawerOpen(false);
            }}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              style={{
                width: '420px',
                maxWidth: '100vw',
                height: '100%',
                background: 'rgba(15, 22, 36, 0.98)',
                borderLeft: '1px solid var(--border-light)',
                padding: '28px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 className="heading-lg" style={{ color: 'var(--color-text-main)' }}>Payment Logs</h3>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{selectedSubscription.name}</span>
                </div>
                <button
                  onClick={() => setHistoryDrawerOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {loadingHistory ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading payment history...</div>
              ) : historyLogs.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No historical logs found.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {historyLogs.map((log) => (
                    <div
                      key={log._id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                          {new Date(log.paymentDate).toLocaleDateString()}
                        </div>
                        <span style={{ fontSize: '11px', color: '#00FF87' }}>Confirmed Paid</span>
                      </div>
                      <div className="font-display" style={{ fontSize: '16px', fontWeight: 800, color: '#00FF87' }}>
                        ₹{log.amount?.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
