import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Smartphone, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  RefreshCw, 
  ShieldCheck, 
  ExternalLink, 
  QrCode, 
  Lock 
} from 'lucide-react';
import { upiApi } from '../../api/client';
import LinkBankModal from './LinkBankModal';
import UPIPaymentModal from '../UPI/UPIPaymentModal';

export default function LinkedAccountsCard() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedPayeeVpa, setSelectedPayeeVpa] = useState('');

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await upiApi.getLinkedAccounts();
      if (res.success) {
        setAccounts(res.data || []);
      }
    } catch (err) {
      console.warn('[Fetch Linked Accounts]', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleUnlink = async (accountId, bankName) => {
    if (!window.confirm(`Revoke consent and unlink ${bankName}? This will immediately purge credentials in accordance with DPDP Act 2023.`)) {
      return;
    }
    try {
      const res = await upiApi.unlinkAccount(accountId);
      if (res.success) {
        setAccounts(prev => prev.filter(a => a.id !== accountId));
      }
    } catch (err) {
      alert(err.message || 'Failed to unlink account');
    }
  };

  const handleOpenQr = (vpa) => {
    setSelectedPayeeVpa(vpa || 'ayush@okhdfcbank');
    setIsQrModalOpen(true);
  };

  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Linked Bank & UPI Accounts</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time auto-sync with Google Pay, PhonePe, Paytm, and 300+ Indian Banks via RBI Account Aggregator.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchAccounts}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 transition-colors"
            title="Refresh Status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsLinkModalOpen(true)}
            className="flex items-center gap-2 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Connect Bank / UPI</span>
          </button>
        </div>
      </div>

      {/* Security Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-800/40 to-indigo-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span className="font-semibold">RBI Account Aggregator (AA) • Read-Only Consent</span>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">AES-256-GCM Encrypted</span>
      </div>

      {/* Accounts List */}
      {loading && accounts.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-sm">Loading connected accounts...</div>
      ) : accounts.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/40 space-y-3">
          <Smartphone className="w-8 h-8 text-slate-600 mx-auto" />
          <div>
            <p className="text-sm font-semibold text-slate-300">No Banks or UPI Accounts Linked Yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Link your bank account via OTP to automatically track and categorize every payment made on Google Pay or PhonePe.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsLinkModalOpen(true)}
            className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Link Your First Bank Account</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {accounts.map((acc) => (
            <motion.div
              key={acc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 flex flex-col justify-between space-y-3 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white font-extrabold text-xs shadow-md">
                    {acc.bankName.substring(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{acc.bankName}</h4>
                    <p className="text-xs text-slate-400 font-mono">{acc.accountMasked}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleUnlink(acc.id, acc.bankName)}
                  className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Revoke Consent & Unlink"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Badges & Actions */}
              <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Auto-Sync Active</span>
                </div>

                {acc.upiId && (
                  <button
                    type="button"
                    onClick={() => handleOpenQr(acc.upiId)}
                    className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold text-[11px] transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Show UPI QR</span>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      <LinkBankModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onAccountLinked={() => fetchAccounts()}
      />

      <UPIPaymentModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        payeeVpa={selectedPayeeVpa}
        payeeName="My Account"
        amount={100}
        note="Test UPI Transfer"
      />
    </div>
  );
}
