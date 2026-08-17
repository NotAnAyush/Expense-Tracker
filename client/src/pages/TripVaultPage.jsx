import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Plus, 
  Plane, 
  MapPin, 
  Calendar, 
  DollarSign, 
  ArrowRightLeft, 
  Trash2, 
  RefreshCw, 
  Layers, 
  Globe 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../api/client';
import { usePrivacy } from '../context/PrivacyContext';

export const TripVaultPage = () => {
  const { isPrivacyMaskActive } = usePrivacy();
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [tripDetails, setTripDetails] = useState(null);
  const [fxRates, setFxRates] = useState({});
  const [loading, setLoading] = useState(true);

  // Modals
  const [createTripModalOpen, setCreateTripModalOpen] = useState(false);
  const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false);

  // Create Trip Form
  const [newTripName, setNewTripName] = useState('');
  const [newTripDestination, setNewTripDestination] = useState('');
  const [newTripCurrency, setNewTripCurrency] = useState('USD');
  const [newTripBudget, setNewTripBudget] = useState('150000');
  const [creatingTrip, setCreatingTrip] = useState(false);

  // Add Expense Form
  const [expDescription, setExpDescription] = useState('');
  const [expForeignAmount, setExpForeignAmount] = useState('');
  const [expCategory, setExpCategory] = useState('Food & Dining');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [savingExpense, setSavingExpense] = useState(false);

  const supportedCurrencies = [
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'GBP', name: 'British Pound (£)' },
    { code: 'AED', name: 'UAE Dirham (AED)' },
    { code: 'JPY', name: 'Japanese Yen (¥)' },
    { code: 'SGD', name: 'Singapore Dollar (S$)' },
    { code: 'CAD', name: 'Canadian Dollar (C$)' },
    { code: 'AUD', name: 'Australian Dollar (A$)' },
    { code: 'THB', name: 'Thai Baht (฿)' },
    { code: 'INR', name: 'Indian Rupee (₹)' },
  ];

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const [tripRes, fxRes] = await Promise.all([
        apiFetch('/trips'),
        apiFetch('/fx/rates?base=INR'),
      ]);
      const list = tripRes.trips || [];
      setTrips(list);
      setFxRates(fxRes.rates || {});
      if (list.length > 0 && !selectedTripId) {
        setSelectedTripId(list[0]._id);
      }
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTripDetails = async (id) => {
    if (!id) return;
    try {
      const res = await apiFetch(`/trips/${id}`);
      setTripDetails(res);
    } catch (err) {
      console.error('Failed to load trip details:', err);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    if (selectedTripId) {
      fetchTripDetails(selectedTripId);
    }
  }, [selectedTripId]);

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (!newTripName.trim() || !newTripDestination.trim() || !newTripBudget) return;

    try {
      setCreatingTrip(true);
      const res = await apiFetch('/trips', {
        method: 'POST',
        body: JSON.stringify({
          name: newTripName.trim(),
          destination: newTripDestination.trim(),
          tripCurrency: newTripCurrency,
          budgetBaseCurrency: parseFloat(newTripBudget),
        }),
      });

      setCreateTripModalOpen(false);
      setNewTripName('');
      setNewTripDestination('');
      await fetchTrips();
      setSelectedTripId(res.trip._id);
    } catch (err) {
      console.error('Failed to create trip:', err);
    } finally {
      setCreatingTrip(false);
    }
  };

  const handleAddTripExpense = async (e) => {
    e.preventDefault();
    if (!selectedTripId || !expDescription.trim() || !expForeignAmount || parseFloat(expForeignAmount) <= 0) return;

    try {
      setSavingExpense(true);
      await apiFetch(`/trips/${selectedTripId}/expenses`, {
        method: 'POST',
        body: JSON.stringify({
          description: expDescription.trim(),
          foreignAmount: parseFloat(expForeignAmount),
          currency: tripDetails?.trip?.tripCurrency || 'USD',
          category: expCategory,
          date: expDate,
          syncToExpenses: true,
        }),
      });

      setAddExpenseModalOpen(false);
      setExpDescription('');
      setExpForeignAmount('');
      await fetchTripDetails(selectedTripId);
      await fetchTrips();
    } catch (err) {
      console.error('Failed to add trip expense:', err);
    } finally {
      setSavingExpense(false);
    }
  };

  const handleDeleteTripExpense = async (expId) => {
    if (!confirm('Are you sure you want to delete this trip expense?')) return;
    try {
      await apiFetch(`/trips/${selectedTripId}/expenses/${expId}`, { method: 'DELETE' });
      await fetchTripDetails(selectedTripId);
      await fetchTrips();
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  };

  const currentTrip = tripDetails?.trip;
  const currentRate = tripDetails?.currentExchangeRate || 1;
  const totalSpent = tripDetails?.totalSpentBase || 0;
  const remaining = tripDetails?.remainingBudgetBase || 0;
  const burnRate = tripDetails?.burnRatePct || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="glass-pill" style={{ color: '#00F0FF', borderColor: 'rgba(0, 240, 255, 0.3)' }}>
              <Plane size={12} /> Travel Trip Vault
            </span>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>• Real-Time Multi-Currency FX Engine</span>
          </div>
          <h1 className="display-xl">Travel Trip Vaults & FX</h1>
          <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '4px' }}>
            Isolate vacation budgets, track expenses in local foreign currency (USD, JPY, EUR, AED), and convert in real-time.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {trips.length > 0 && (
            <select
              value={selectedTripId || ''}
              onChange={(e) => setSelectedTripId(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                background: '#0F1420',
                border: '1px solid rgba(0, 240, 255, 0.35)',
                color: '#00F0FF',
                fontSize: '13.5px',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {trips.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.tripCurrency})
                </option>
              ))}
            </select>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setCreateTripModalOpen(true)}
            className="btn-glass-secondary"
            style={{ padding: '10px 16px', fontSize: '13px' }}
          >
            <Plus size={15} /> + New Trip Vault
          </motion.button>

          {selectedTripId && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setAddExpenseModalOpen(true)}
              className="btn-primary-mint"
              style={{ padding: '10px 18px', fontSize: '13.5px' }}
            >
              <Plus size={16} /> Log Trip Expense
            </motion.button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '64px', textAlign: 'center', color: '#94A3B8' }}>
          <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: '#00F0FF' }} />
          <div>Fetching exchange rates and travel vaults...</div>
        </div>
      ) : trips.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            borderRadius: '24px',
            border: '1px dashed rgba(0, 240, 255, 0.3)',
          }}
        >
          <Compass size={48} color="#00F0FF" style={{ margin: '0 auto 16px', opacity: 0.8 }} />
          <h3 className="heading-lg" style={{ color: '#F1F5F9' }}>
            No Active Travel Trip Vaults
          </h3>
          <p style={{ color: '#94A3B8', maxWidth: '440px', margin: '8px auto 20px', fontSize: '14px' }}>
            Create a trip vault for Tokyo, Dubai, or Paris to automatically convert foreign payments to INR.
          </p>
          <button
            onClick={() => setCreateTripModalOpen(true)}
            className="btn-primary-mint"
            style={{ padding: '12px 24px' }}
          >
            <Plus size={16} /> Create Your First Trip Vault
          </button>
        </div>
      ) : (
        <>
          {/* 1. Trip Overview Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Trip Budget (INR)</div>
              <div
                className={`font-display ${isPrivacyMaskActive ? 'privacy-masked' : ''}`}
                style={{ fontSize: '28px', fontWeight: 800, color: '#F1F5F9', marginTop: '4px' }}
              >
                ₹{(currentTrip?.budgetBaseCurrency || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                {currentTrip?.destination}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Total Spent So Far</div>
              <div
                className={`font-display ${isPrivacyMaskActive ? 'privacy-masked' : ''}`}
                style={{ fontSize: '28px', fontWeight: 800, color: '#00F0FF', marginTop: '4px' }}
              >
                ₹{totalSpent.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#00F0FF', marginTop: '4px' }}>
                {burnRate}% Budget Burned
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Remaining Vault Budget</div>
              <div
                className={`font-display ${isPrivacyMaskActive ? 'privacy-masked' : ''}`}
                style={{ fontSize: '28px', fontWeight: 800, color: remaining > 0 ? '#00FF87' : '#FF7D7D', marginTop: '4px' }}
              >
                ₹{remaining.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                Safe spending runway
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Live Exchange Rate</div>
              <div className="font-display" style={{ fontSize: '24px', fontWeight: 800, color: '#FFD700', marginTop: '4px' }}>
                1 {currentTrip?.tripCurrency} = ₹{currentRate}
              </div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                Auto-converted on transaction
              </div>
            </div>
          </div>

          {/* 2. Budget Burn Progress Bar */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94A3B8', marginBottom: '8px' }}>
              <span>Trip Budget Consumption ({burnRate}%)</span>
              <span>₹{totalSpent.toLocaleString()} / ₹{(currentTrip?.budgetBaseCurrency || 0).toLocaleString()}</span>
            </div>
            <div style={{ width: '100%', height: '10px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${burnRate}%`,
                  height: '100%',
                  background: burnRate > 90 ? '#FF7D7D' : 'linear-gradient(90deg, #00FF87, #00F0FF)',
                  borderRadius: '999px',
                }}
              />
            </div>
          </div>

          {/* 3. Multi-Currency Travel Expense Ledger */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="heading-md" style={{ color: '#F1F5F9', margin: 0 }}>
                {currentTrip?.name} — Multi-Currency Ledger
              </h3>

              <button
                onClick={() => setAddExpenseModalOpen(true)}
                className="btn-primary-mint"
                style={{ padding: '7px 14px', fontSize: '12.5px' }}
              >
                <Plus size={14} /> Log Local Expense
              </button>
            </div>

            {(!currentTrip?.expenses || currentTrip.expenses.length === 0) ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>
                No travel expenses logged in this trip vault yet. Click <strong>+ Log Local Expense</strong> to start tracking foreign purchases!
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94A3B8', fontSize: '12px' }}>
                      <th style={{ padding: '10px' }}>Date</th>
                      <th style={{ padding: '10px' }}>Description</th>
                      <th style={{ padding: '10px' }}>Category</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Foreign Amount</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Exchange Rate</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Base (INR)</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTrip.expenses.map((exp) => (
                      <tr key={exp._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '12px 10px', color: '#94A3B8' }}>
                          {new Date(exp.date).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '12px 10px', fontWeight: 600, color: '#F1F5F9' }}>
                          {exp.description}
                        </td>
                        <td style={{ padding: '12px 10px', color: '#94A3B8' }}>
                          {exp.category}
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 700, color: '#00F0FF' }}>
                          {exp.foreignAmount.toLocaleString()} {exp.currency}
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'right', color: '#94A3B8', fontSize: '12px' }}>
                          @ ₹{exp.exchangeRate}
                        </td>
                        <td
                          className={isPrivacyMaskActive ? 'privacy-masked' : ''}
                          style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 800, color: '#00FF87', fontFamily: 'var(--font-display)' }}
                        >
                          ₹{exp.baseAmount.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleDeleteTripExpense(exp._id)}
                            style={{ color: '#FF7D7D', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                            title="Delete expense"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal: Create Trip */}
      {createTripModalOpen && (
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
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              background: '#0F1420',
              border: '1.5px solid rgba(0, 240, 255, 0.35)',
              borderRadius: '24px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <h3 className="heading-md" style={{ color: '#F1F5F9', margin: 0 }}>
              Create Travel Trip Vault
            </h3>

            <form onSubmit={handleCreateTrip} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Trip Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tokyo Autumn Vacation 2026"
                  value={newTripName}
                  onChange={(e) => setNewTripName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#F8FAFC',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Destination *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tokyo, Japan"
                    value={newTripDestination}
                    onChange={(e) => setNewTripDestination(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#F8FAFC',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Trip Currency
                  </label>
                  <select
                    value={newTripCurrency}
                    onChange={(e) => setNewTripCurrency(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: '#0A0D14',
                      border: '1px solid rgba(0, 240, 255, 0.3)',
                      color: '#00F0FF',
                      fontWeight: 700,
                      outline: 'none',
                    }}
                  >
                    {supportedCurrencies.map((c) => (
                      <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Trip Budget (₹ INR) *
                </label>
                <input
                  type="number"
                  step="5000"
                  value={newTripBudget}
                  onChange={(e) => setNewTripBudget(e.target.value)}
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
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setCreateTripModalOpen(false)}
                  className="btn-glass-secondary"
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTrip}
                  className="btn-primary-mint"
                  style={{ padding: '8px 20px' }}
                >
                  {creatingTrip ? 'Creating...' : 'Create Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Trip Expense */}
      {addExpenseModalOpen && currentTrip && (
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
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              background: '#0F1420',
              border: '1.5px solid rgba(0, 255, 135, 0.35)',
              borderRadius: '24px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <h3 className="heading-md" style={{ color: '#F1F5F9', margin: 0 }}>
              Log Travel Expense
            </h3>
            <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
              {currentTrip.name} • 1 {currentTrip.tripCurrency} = ₹{currentRate}
            </p>

            <form onSubmit={handleAddTripExpense} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Description *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sushi Dinner, Subway Card Recharge"
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#F8FAFC',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Local Price ({currentTrip.tripCurrency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={expForeignAmount}
                    onChange={(e) => setExpForeignAmount(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(0, 240, 255, 0.4)',
                      color: '#00F0FF',
                      fontWeight: 800,
                      fontFamily: 'var(--font-display)',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Converted (INR)
                  </label>
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: 'rgba(0, 255, 135, 0.08)',
                      border: '1px solid rgba(0, 255, 135, 0.3)',
                      color: '#00FF87',
                      fontWeight: 800,
                      fontFamily: 'var(--font-display)',
                      fontSize: '15px',
                    }}
                  >
                    ₹{((parseFloat(expForeignAmount) || 0) * currentRate).toFixed(0)}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Category
                </label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: '#0A0D14',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#F8FAFC',
                    outline: 'none',
                  }}
                >
                  {['Food & Dining', 'Transportation', 'Accommodation', 'Sightseeing & Activities', 'Shopping', 'Other'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setAddExpenseModalOpen(false)}
                  className="btn-glass-secondary"
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingExpense}
                  className="btn-primary-mint"
                  style={{ padding: '8px 20px' }}
                >
                  {savingExpense ? 'Logging...' : 'Log Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
