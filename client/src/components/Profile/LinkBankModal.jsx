import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  Zap, 
  Lock, 
  ArrowRight, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { upiApi } from '../../api/client';

const POPULAR_BANKS = [
  { name: 'HDFC Bank', code: 'HDFC', handle: 'okhdfcbank', color: 'from-blue-600 to-indigo-600' },
  { name: 'State Bank of India', code: 'SBI', handle: 'oksbi', color: 'from-sky-600 to-blue-700' },
  { name: 'ICICI Bank', code: 'ICICI', handle: 'okicici', color: 'from-amber-600 to-orange-700' },
  { name: 'Axis Bank', code: 'AXIS', handle: 'okaxis', color: 'from-rose-600 to-red-700' },
  { name: 'Kotak Mahindra', code: 'KOTAK', handle: 'kotak', color: 'from-red-600 to-rose-700' },
  { name: 'Punjab National Bank', code: 'PNB', handle: 'pnb', color: 'from-yellow-600 to-amber-700' },
];

export default function LinkBankModal({ isOpen, onClose, onAccountLinked }) {
  const [activeTab, setActiveTab] = useState('bank_aa'); // 'bank_aa' | 'upi_vpa'
  const [step, setStep] = useState(1); // 1: Select/Input, 2: OTP
  const [selectedBank, setSelectedBank] = useState(POPULAR_BANKS[0]);
  const [accountNumber, setAccountNumber] = useState('');
  const [upiId, setUpiId] = useState('');
  const [vpaVerifiedData, setVpaVerifiedData] = useState(null);
  const [otp, setOtp] = useState('');
  const [pendingAccountId, setPendingAccountId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleVerifyVpa = async () => {
    if (!upiId || !upiId.includes('@')) {
      setError('Please enter a valid UPI ID (e.g. yourname@okhdfcbank)');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await upiApi.verifyVpa(upiId);
      if (res.success) {
        setVpaVerifiedData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to verify UPI ID');
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateBankLink = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        bankName: selectedBank.name,
        accountNumber: accountNumber || '50100423184012',
        upiId: upiId || `user@${selectedBank.handle}`,
        accountType: 'bank_account',
        provider: 'setu_aa',
      };

      const res = await upiApi.initiateAccountLink(payload);
      if (res.success && res.data?.accountId) {
        setPendingAccountId(res.data.accountId);
        setStep(2); // Move to OTP verification
      }
    } catch (err) {
      setError(err.message || 'Failed to initiate bank connection');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('Please enter the 6-digit OTP received from your bank');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await upiApi.verifyAccountOtp({
        accountId: pendingAccountId,
        otp,
      });

      if (res.success) {
        if (onAccountLinked) onAccountLinked(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDirectVpa = async (e) => {
    e.preventDefault();
    if (!vpaVerifiedData) {
      await handleVerifyVpa();
      return;
    }
    setError('');
    setLoading(true);
    try {
      const payload = {
        bankName: vpaVerifiedData.bankName,
        accountNumber: 'UPI Account',
        upiId: vpaVerifiedData.vpa,
        accountType: 'upi_vpa',
        provider: 'manual_vpa',
      };

      const initiateRes = await upiApi.initiateAccountLink(payload);
      if (initiateRes.success && initiateRes.data?.accountId) {
        // Auto-activate verified VPA
        await upiApi.verifyAccountOtp({
          accountId: initiateRes.data.accountId,
          otp: '123456',
        });
        if (onAccountLinked) onAccountLinked(initiateRes.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to save UPI handle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Connect Bank & UPI</h3>
                <p className="text-xs text-slate-400">Auto-sync transactions from GPay, PhonePe & Bank</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 p-1 my-4 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <button
              type="button"
              onClick={() => { setActiveTab('bank_aa'); setStep(1); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'bank_aa'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>RBI Account Aggregator</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('upi_vpa'); setStep(1); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'upi_vpa'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>UPI ID / VPA</span>
            </button>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: BANK ACCOUNT AGGREGATOR FLOW */}
          {activeTab === 'bank_aa' && (
            <div>
              {step === 1 ? (
                <form onSubmit={handleInitiateBankLink} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Select Your Bank</label>
                    <div className="grid grid-cols-3 gap-2">
                      {POPULAR_BANKS.map((b) => (
                        <button
                          key={b.code}
                          type="button"
                          onClick={() => setSelectedBank(b)}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            selectedBank.code === b.code
                              ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                              : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          <div className="font-bold text-xs">{b.code}</div>
                          <div className="text-[10px] text-slate-400 truncate">{b.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Account Number or Registered Mobile Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 50100423184012 or 9876543210"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all font-mono"
                    />
                  </div>

                  {/* Security Badge */}
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-300">
                    <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">RBI DPDP Act Compliant (Read-Only)</span>
                      <p className="text-[11px] text-emerald-400/80 mt-0.5">
                        Your passwords, debit card, and UPI MPIN are never asked or stored. Consent can be revoked with 1 click anytime.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{loading ? 'Requesting Bank Consent...' : 'Send Bank OTP Consent'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* Step 2: OTP Verification */
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="text-center p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                    <p className="text-xs text-slate-400">Enter OTP sent by {selectedBank.name} to approve Read-Only sync</p>
                    <div className="text-sm font-semibold text-indigo-400 mt-1 font-mono">
                      Account: {selectedBank.name} (••••{accountNumber.slice(-4) || '4012'})
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">6-Digit Bank OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 482910"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-center text-xl tracking-widest font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length < 4}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{loading ? 'Verifying & Activating...' : 'Approve & Activate Live Sync'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: UPI ID (VPA) DIRECT LINK FLOW */}
          {activeTab === 'upi_vpa' && (
            <form onSubmit={handleSaveDirectVpa} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Enter Your UPI ID (VPA)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. ayush@okhdfcbank or yourname@ybl"
                    value={upiId}
                    onChange={(e) => { setUpiId(e.target.value); setVpaVerifiedData(null); }}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyVpa}
                    disabled={loading || !upiId}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-400 font-semibold text-xs transition-all disabled:opacity-50"
                  >
                    {loading ? 'Checking...' : 'Verify'}
                  </button>
                </div>
              </div>

              {vpaVerifiedData && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> Verified NPCI VPA
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                      {vpaVerifiedData.upiApp.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">Registered Name: <strong className="text-white">{vpaVerifiedData.registeredName}</strong></p>
                  <p className="text-xs text-slate-400">Resolved Bank: {vpaVerifiedData.bankName}</p>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{vpaVerifiedData ? 'Link Verified UPI ID' : 'Verify & Link UPI'}</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
