import React, { useState } from 'react';
import { QrCode, X, Check, Copy, ExternalLink, RefreshCw, Smartphone, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const UpiQrModal = ({ isOpen, onClose, transfer, onSettleConfirm }) => {
  const [copied, setCopied] = useState(false);
  const [settling, setSettling] = useState(false);

  if (!isOpen || !transfer) return null;

  const { from, to, amount, toUpiId, upiUri } = transfer;
  const effectiveUpiUri = upiUri || `upi://pay?pa=${toUpiId || 'payee@upi'}&pn=${encodeURIComponent(to)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Settlement to ${to}`)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(effectiveUpiUri)}`;

  const handleCopyUri = () => {
    if (toUpiId) {
      navigator.clipboard.writeText(toUpiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirm = async () => {
    try {
      setSettling(true);
      if (onSettleConfirm) {
        await onSettleConfirm({
          fromMember: from,
          toMember: to,
          amount: amount,
          method: 'UPI',
          notes: 'Settled via Richy Rich UPI QR',
        });
      }
      onClose();
    } catch (err) {
      console.error('Settlement confirmation failed:', err);
    } finally {
      setSettling(false);
    }
  };

  return (
    <AnimatePresence>
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
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          style={{
            width: '100%',
            maxWidth: '460px',
            background: 'linear-gradient(135deg, rgba(16, 22, 38, 0.98) 0%, rgba(10, 14, 24, 0.98) 100%)',
            border: '1.5px solid rgba(0, 255, 135, 0.35)',
            borderRadius: '24px',
            padding: '28px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 255, 135, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'rgba(0, 255, 135, 0.15)',
                  border: '1px solid rgba(0, 255, 135, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00FF87',
                }}
              >
                <Smartphone size={20} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 className="heading-md" style={{ margin: 0 }}>
                  Instant UPI Settlement
                </h3>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                  Scan with GPay, PhonePe, Paytm, or BHIM
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: '999px',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Amount Highlight */}
          <div
            style={{
              padding: '14px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ fontSize: '12px', color: '#94A3B8' }}>
              <strong>{from}</strong> pays <strong>{to}</strong>
            </div>
            <div
              className="font-display"
              style={{ fontSize: '32px', fontWeight: 800, color: '#00FF87', margin: '4px 0' }}
            >
              ₹{amount.toLocaleString()}
            </div>
            {toUpiId ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: '#00F0FF',
                  background: 'rgba(0, 240, 255, 0.1)',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 240, 255, 0.25)',
                  cursor: 'pointer',
                }}
                onClick={handleCopyUri}
                title="Click to copy UPI ID"
              >
                <span>{toUpiId}</span>
                {copied ? <Check size={12} color="#00FF87" /> : <Copy size={12} />}
              </div>
            ) : (
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                No UPI ID saved — Scan generic QR below
              </div>
            )}
          </div>

          {/* QR Code Container */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '18px',
              padding: '14px',
              display: 'inline-block',
              margin: '0 auto',
              boxShadow: '0 8px 30px rgba(0, 255, 135, 0.2)',
            }}
          >
            <img
              src={qrCodeUrl}
              alt="UPI QR Code"
              style={{
                width: '200px',
                height: '200px',
                display: 'block',
                borderRadius: '8px',
              }}
            />
          </div>

          {/* Direct UPI Mobile Link Trigger */}
          <a
            href={effectiveUpiUri}
            className="btn-glass-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textDecoration: 'none',
              fontSize: '13px',
              padding: '10px',
            }}
          >
            <ExternalLink size={15} />
            <span>Open in UPI App (Mobile Only)</span>
          </a>

          {/* Settle Action Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirm}
            disabled={settling}
            className="btn-primary-mint"
            style={{ width: '100%', padding: '12px', fontSize: '14px' }}
          >
            {settling ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Recording Settlement...
              </>
            ) : (
              <>
                <Check size={16} />
                Mark as Settled (₹{amount.toLocaleString()})
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
