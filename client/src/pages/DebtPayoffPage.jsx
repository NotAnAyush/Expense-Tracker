import React, { useState, useEffect } from 'react';
import { 
  TrendingDown, 
  Plus, 
  Flame, 
  Zap, 
  ShieldCheck, 
  DollarSign, 
  Calendar, 
  ArrowUpRight, 
  Check, 
  Trash2, 
  Sparkles, 
  Sliders, 
  RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../api/client';
import { usePrivacy } from '../context/PrivacyContext';
import { AddDebtModal } from '../components/Debt/AddDebtModal';

export const DebtPayoffPage = () => {
  const { isPrivacyMaskActive } = usePrivacy();
  const [debts, setDebts] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalMinDue, setTotalMinDue] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Simulation State
  const [extraMonthlyBudget, setExtraMonthlyBudget] = useState(5000);
  const [simulationData, setSimulationData] = useState(null);
  const [selectedStrategy, setSelectedStrategy] = useState('AVALANCHE'); // 'AVALANCHE' | 'SNOWBALL' | 'BASELINE'
  const [simulating, setSimulating] = useState(false);

  // Modals
  const [addDebtModalOpen, setAddDebtModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedDebtForPayment, setSelectedDebtForPayment] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paying, setPaying] = useState(false);

  const fetchDebts = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/debts');
      setDebts(res.debts || []);
      setTotalBalance(res.totalBalance || 0);
      setTotalMinDue(res.totalMinimumMonthly || 0);
      setActiveCount(res.activeCount || 0);
    } catch (err) {
      console.error('Failed to load debts:', err);
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async (extra) => {
    try {
      setSimulating(true);
      const res = await apiFetch('/debts/simulate', {
        method: 'POST',
        body: JSON.stringify({ extraMonthlyBudget: extra }),
      });
      setSimulationData(res);
    } catch (err) {
      console.error('Failed to simulate payoff:', err);
    } finally {
      setSimulating(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  useEffect(() => {
    if (debts.length > 0) {
      runSimulation(extraMonthlyBudget);
    }
  }, [debts, extraMonthlyBudget]);

  const handleSaveDebt = async (debtData) => {
    await apiFetch('/debts', {
      method: 'POST',
      body: JSON.stringify(debtData),
    });
    await fetchDebts();
  };

  const handleDeleteDebt = async (id) => {
    if (!confirm('Are you sure you want to remove this debt record?')) return;
    await apiFetch(`/debts/${id}`, { method: 'DELETE' });
    await fetchDebts();
  };

  const handleLogPayment = async (e) => {
    e.preventDefault();
    if (!selectedDebtForPayment || !paymentAmount || parseFloat(paymentAmount) <= 0) return;

    try {
      setPaying(true);
      await apiFetch(`/debts/${selectedDebtForPayment._id}/pay`, {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          syncToExpenses: true,
          notes: `Debt payoff payment for ${selectedDebtForPayment.name}`,
        }),
      });

      setPayModalOpen(false);
      setSelectedDebtForPayment(null);
      setPaymentAmount('');
      await fetchDebts();
    } catch (err) {
      console.error('Payment logging failed:', err);
    } finally {
      setPaying(false);
    }
  };

  const currentStrategyStats = simulationData
    ? selectedStrategy === 'AVALANCHE'
      ? simulationData.avalanche
      : selectedStrategy === 'SNOWBALL'
      ? simulationData.snowball
      : simulationData.baseline
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="glass-pill" style={{ color: '#FFD700', borderColor: 'rgba(255, 215, 0, 0.3)' }}>
              <Flame size={12} /> Debt Snowball & Avalanche Engine
            </span>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>• Mathematical Interest Minimization</span>
          </div>
          <h1 className="display-xl">Debt Freedom Simulator</h1>
          <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '4px' }}>
            Compare Snowball vs Avalanche payoff trajectories, inject extra monthly payments, and eliminate liabilities.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setAddDebtModalOpen(true)}
          className="btn-primary-mint"
          style={{ padding: '10px 20px', fontSize: '13.5px' }}
        >
          <Plus size={16} /> + Add Debt Liability
        </motion.button>
      </div>

      {loading ? (
        <div style={{ padding: '64px', textAlign: 'center', color: '#94A3B8' }}>
          <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: '#FFD700' }} />
          <div>Computing debt amortization schedules...</div>
        </div>
      ) : debts.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            borderRadius: '24px',
            border: '1px dashed rgba(255, 215, 0, 0.3)',
          }}
        >
          <ShieldCheck size={48} color="#00FF87" style={{ margin: '0 auto 16px' }} />
          <h3 className="heading-lg" style={{ color: '#F1F5F9' }}>
            Debt-Free Status Active!
          </h3>
          <p style={{ color: '#94A3B8', maxWidth: '440px', margin: '8px auto 20px', fontSize: '14px' }}>
            You have no active liabilities. Add credit card balances or loans to simulate rapid payoff schedules.
          </p>
          <button
            onClick={() => setAddDebtModalOpen(true)}
            className="btn-primary-mint"
            style={{ padding: '12px 24px' }}
          >
            <Plus size={16} /> Add First Debt Liability
          </button>
        </div>
      ) : (
        <>
          {/* 1. KPI Top Summary Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Total Outstanding Debt</div>
              <div
                className={`font-display ${isPrivacyMaskActive ? 'privacy-masked' : ''}`}
                style={{ fontSize: '28px', fontWeight: 800, color: '#FF7D7D', marginTop: '4px' }}
              >
                ₹{totalBalance.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                Across {activeCount} active loan accounts
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Total Minimum Due / Month</div>
              <div
                className={`font-display ${isPrivacyMaskActive ? 'privacy-masked' : ''}`}
                style={{ fontSize: '28px', fontWeight: 800, color: '#FFD700', marginTop: '4px' }}
              >
                ₹{totalMinDue.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                Baseline obligatory monthly commitment
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Projected Debt-Free Date</div>
              <div className="font-display" style={{ fontSize: '24px', fontWeight: 800, color: '#00FF87', marginTop: '4px' }}>
                {currentStrategyStats?.debtFreeDate
                  ? new Date(currentStrategyStats.debtFreeDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                  : '—'}
              </div>
              <div style={{ fontSize: '12px', color: '#00FF87', marginTop: '4px' }}>
                {currentStrategyStats?.months || 0} months to total freedom
              </div>
            </div>
          </div>

          {/* 2. Interactive Strategy Comparator & Accelerated Slider Banner */}
          <div
            className="glass-card"
            style={{
              padding: '28px',
              background: 'linear-gradient(135deg, rgba(20, 26, 44, 0.95) 0%, rgba(10, 14, 24, 0.98) 100%)',
              border: '1.5px solid rgba(255, 215, 0, 0.35)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {/* Strategy Selectors */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 className="heading-md" style={{ color: '#F1F5F9', margin: 0 }}>
                  Payoff Strategy Optimization
                </h3>
                <p style={{ fontSize: '13px', color: '#94A3B8', margin: '2px 0 0' }}>
                  Select an algorithmic payoff model to simulate cash allocation
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.04)', padding: '4px', borderRadius: '14px' }}>
                {[
                  { id: 'AVALANCHE', label: 'Avalanche (Lowest Interest)', color: '#00FF87' },
                  { id: 'SNOWBALL', label: 'Snowball (Quick Wins)', color: '#00F0FF' },
                  { id: 'BASELINE', label: 'Baseline (Minimums Only)', color: '#94A3B8' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStrategy(s.id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      border: 'none',
                      background: selectedStrategy === s.id ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                      color: selectedStrategy === s.id ? s.color : '#94A3B8',
                      fontWeight: selectedStrategy === s.id ? 800 : 600,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Accelerated Payoff Monthly Extra Slider */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '20px',
                borderRadius: '18px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sliders size={16} color="#00FF87" />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#F1F5F9' }}>
                    Extra Monthly Cash Injected:
                  </span>
                </div>
                <span
                  className="font-display"
                  style={{ fontSize: '20px', fontWeight: 800, color: '#00FF87' }}
                >
                  +₹{extraMonthlyBudget.toLocaleString()}/mo
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="50000"
                step="1000"
                value={extraMonthlyBudget}
                onChange={(e) => setExtraMonthlyBudget(parseInt(e.target.value, 10))}
                style={{
                  width: '100%',
                  accentColor: '#00FF87',
                  cursor: 'pointer',
                  height: '6px',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginTop: '6px' }}>
                <span>+₹0 (Minimums Only)</span>
                <span>+₹25,000/mo</span>
                <span>+₹50,000/mo (Max Acceleration)</span>
              </div>
            </div>

            {/* Strategy Comparison Results Strip */}
            {simulationData && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '14px',
                }}
              >
                <div style={{ background: 'rgba(0, 255, 135, 0.08)', border: '1px solid rgba(0, 255, 135, 0.25)', borderRadius: '14px', padding: '16px' }}>
                  <div style={{ fontSize: '11.5px', color: '#00FF87', fontWeight: 700, textTransform: 'uppercase' }}>Interest Saved vs Baseline</div>
                  <div className="font-display" style={{ fontSize: '22px', fontWeight: 800, color: '#00FF87', marginTop: '4px' }}>
                    ₹{(selectedStrategy === 'AVALANCHE' ? simulationData.comparison.interestSavedWithAvalanche : simulationData.comparison.interestSavedWithSnowball).toLocaleString()}
                  </div>
                </div>

                <div style={{ background: 'rgba(0, 240, 255, 0.08)', border: '1px solid rgba(0, 240, 255, 0.25)', borderRadius: '14px', padding: '16px' }}>
                  <div style={{ fontSize: '11.5px', color: '#00F0FF', fontWeight: 700, textTransform: 'uppercase' }}>Months Saved vs Baseline</div>
                  <div className="font-display" style={{ fontSize: '22px', fontWeight: 800, color: '#00F0FF', marginTop: '4px' }}>
                    {(selectedStrategy === 'AVALANCHE' ? simulationData.comparison.monthsSavedWithAvalanche : simulationData.comparison.monthsSavedWithSnowball)} Months Faster
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 215, 0, 0.08)', border: '1px solid rgba(255, 215, 0, 0.25)', borderRadius: '14px', padding: '16px' }}>
                  <div style={{ fontSize: '11.5px', color: '#FFD700', fontWeight: 700, textTransform: 'uppercase' }}>Total Interest Paid</div>
                  <div className="font-display" style={{ fontSize: '22px', fontWeight: 800, color: '#FFD700', marginTop: '4px' }}>
                    ₹{(currentStrategyStats?.totalInterest || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Active Liabilities Inventory */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 className="heading-md" style={{ color: '#F1F5F9', marginBottom: '16px' }}>
              Active Liabilities & Payment Logs
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {debts.map((debt) => {
                const isPaidOff = debt.status === 'PAID_OFF' || debt.principalBalance <= 0;
                const percentPaid = debt.originalBalance > 0
                  ? Math.min(100, Math.round(((debt.originalBalance - debt.principalBalance) / debt.originalBalance) * 100))
                  : 0;

                return (
                  <motion.div
                    key={debt._id}
                    whileHover={{ scale: 1.01 }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: isPaidOff ? '1px solid rgba(0, 255, 135, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '18px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#F1F5F9' }}>
                            {debt.name}
                          </h4>
                          {isPaidOff && (
                            <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: 'rgba(0, 255, 135, 0.15)', color: '#00FF87' }}>
                              PAID OFF ✓
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '12px', color: '#94A3B8' }}>{debt.category}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: 'rgba(255, 215, 0, 0.15)',
                            color: '#FFD700',
                            border: '1px solid rgba(255, 215, 0, 0.3)',
                          }}
                        >
                          {debt.interestRate}% APR
                        </span>

                        <button
                          onClick={() => handleDeleteDebt(debt._id)}
                          style={{ color: '#FF7D7D', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                          title="Delete debt liability"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>
                        <span>Remaining Balance:</span>
                        <strong
                          className={`font-display ${isPrivacyMaskActive ? 'privacy-masked' : ''}`}
                          style={{ color: isPaidOff ? '#00FF87' : '#FF7D7D', fontSize: '15px' }}
                        >
                          ₹{debt.principalBalance.toLocaleString()}
                        </strong>
                      </div>

                      {/* Payoff Progress Bar */}
                      <div style={{ width: '100%', height: '7px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${percentPaid}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #00FF87, #00F0FF)',
                            borderRadius: '999px',
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '3px', textAlign: 'right' }}>
                        {percentPaid}% Cleared (Orig: ₹{(debt.originalBalance || debt.principalBalance).toLocaleString()})
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '10px', fontSize: '12px' }}>
                      <span style={{ color: '#94A3B8' }}>
                        Min Due: <strong>₹{debt.minimumPayment.toLocaleString()}/mo</strong>
                      </span>

                      {!isPaidOff && (
                        <button
                          onClick={() => {
                            setSelectedDebtForPayment(debt);
                            setPaymentAmount(debt.minimumPayment.toString());
                            setPayModalOpen(true);
                          }}
                          className="btn-glass-secondary"
                          style={{ fontSize: '12px', padding: '6px 12px', color: '#00FF87', border: '1px solid rgba(0, 255, 135, 0.3)' }}
                        >
                          <DollarSign size={13} /> Log Payment
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Add Debt Modal */}
      <AddDebtModal
        isOpen={addDebtModalOpen}
        onClose={() => setAddDebtModalOpen(false)}
        onSaveDebt={handleSaveDebt}
      />

      {/* Log Payment Modal */}
      {payModalOpen && selectedDebtForPayment && (
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
              maxWidth: '420px',
              background: '#0F1420',
              border: '1.5px solid rgba(0, 255, 135, 0.3)',
              borderRadius: '24px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <h3 className="heading-md" style={{ color: '#F1F5F9', margin: 0 }}>
              Log Debt Payment
            </h3>
            <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
              {selectedDebtForPayment.name} (Balance: ₹{selectedDebtForPayment.principalBalance.toLocaleString()})
            </p>

            <form onSubmit={handleLogPayment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Payment Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedDebtForPayment.principalBalance}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
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
                    fontSize: '16px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ fontSize: '12px', color: '#64748B' }}>
                ✓ This payment will reduce the loan balance and automatically sync as an Expense record tagged #DebtPayoff.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setPayModalOpen(false)}
                  className="btn-glass-secondary"
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paying}
                  className="btn-primary-mint"
                  style={{ padding: '8px 20px' }}
                >
                  {paying ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
