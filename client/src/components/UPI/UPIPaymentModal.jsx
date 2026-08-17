import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, 
  Smartphone, 
  Copy, 
  CheckCircle2, 
  X, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  Check, 
  Building2 
} from 'lucide-react';

export default function UPIPaymentModal({ 
  isOpen, 
  onClose, 
  payeeVpa = 'merchant@okhdfcbank', 
  payeeName = 'Expense Tracker Settlement', 
  amount = 0, 
  note = 'Payment via UPI',
  onSuccess 
}) {
  const [copied, setCopied] = useState(false);
  const [paidConfirmed, setPaidConfirmed] = useState(false);

  if (!isOpen) return null;

  const txnRef = `RR${Date.now()}`;
  const cleanAmount = Number(amount) || 0;
  const upiUri = `upi://pay?pa=${encodeURIComponent(payeeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${cleanAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}&tr=${txnRef}`;

  // QR Code URL using standard high-res QR service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiUri)}&color=0f172a&bgcolor=ffffff&margin=1`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(upiUri);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleConfirmPaid = () => {
    setPaidConfirmed(true);
    setTimeout(() => {
      if (onSuccess) onSuccess({ payeeVpa, amount: cleanAmount, txnRef });
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Universal UPI & GPay</h3>
                <p className="text-xs text-slate-400">Scan QR or Launch Installed UPI App</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Amount Hero */}
          <div className="my-5 text-center p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-slate-800/40 to-emerald-500/10 border border-indigo-500/20">
            <p className="text-xs uppercase tracking-wider text-indigo-300 font-semibold mb-1">Paying To: {payeeName}</p>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              ₹{cleanAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">{payeeVpa}</p>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="p-3 bg-white rounded-2xl shadow-xl border border-slate-200">
              <img
                src={qrCodeUrl}
                alt="UPI Payment QR Code"
                className="w-48 h-48 rounded-lg object-contain"
                loading="eager"
              />
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>NPCI UPI Protocol • 100% Encrypted</span>
            </div>
          </div>

          {/* Action Buttons for Mobile Deep Link & Copy */}
          <div className="space-y-2.5 mt-4">
            <a
              href={upiUri}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all active:scale-[0.98]"
            >
              <Smartphone className="w-4 h-4" />
              <span>Open in Google Pay / UPI App</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={copyToClipboard}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'UPI Link Copied!' : 'Copy UPI Link'}</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmPaid}
                disabled={paidConfirmed}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                  paidConfirmed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                }`}
              >
                {paidConfirmed ? <CheckCircle2 className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                <span>{paidConfirmed ? 'Payment Confirmed!' : 'I Have Paid'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
